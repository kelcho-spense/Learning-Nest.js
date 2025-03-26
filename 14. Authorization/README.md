# Role-Based Access Control (RBAC) with CASL in NestJS

## Introduction

Role-Based Access Control (RBAC) is an approach to restricting system access to authorized users based on their roles. Instead of assigning permissions directly to individual users, permissions are assigned to roles, and users are then assigned to these roles. This simplifies access management and enhances security.

CASL is an isomorphic authorization library that allows you to manage user permissions in your application. It provides a flexible and expressive way to define and check permissions.

### What is CASL?

CASL is a JavaScript ability management library that helps you implement authorization in your application. Key features include:

- **Isomorphic**: Works in both front-end and back-end environments
- **Framework agnostic**: Can be integrated with any JavaScript framework
- **Declarative syntax**: Permissions are defined using intuitive `can` and `cannot` functions
- **Conditions support**: Allows for complex permission rules with conditions
- **Subject support**: Rules can be applied to specific subject types (e.g., User, Book, etc.)

### Key RBAC Concepts for Beginners:

1. **Roles**: Categories of users with similar access needs (e.g., Admin, User, Editor)
2. **Permissions**: Actions that can be performed on resources (e.g., create, read, update, delete)
3. **Resources**: Objects or data that users can access (e.g., posts, comments, users)
4. **Actions**: Operations that can be performed on resources (e.g., read, create, update, delete)

## Installation

First, install the necessary package:

```bash
npm install @casl/ability
```

- **@casl/ability**: The core CASL library that provides the ability to define and check permissions

## Basic Setup - Step by Step

### 1. Define Your Action Enum

First, define the actions that can be performed on resources. This creates a standardized way to refer to permissions throughout the application:

```typescript
// src/casl/casl-ability.factory/action.enum.ts
export enum Action {
  Manage = 'manage', // Special action that represents any action (read, create, update, delete)
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

### 2. Create the CaslAbilityFactory

Next, create a factory class that will generate ability objects based on the user's role:

```typescript
// src/casl/casl-ability.factory/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Action } from './action.enum';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/role.enum';
import { Book } from 'src/books/entities/book.entity';
import { Author } from 'src/authors/entities/author.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Profile } from 'src/profiles/entities/profile.entity';
import { BookReview } from 'src/book-reviews/entities/book-review.entity';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.role === Role.ADMIN) {
      // Admin can manage all resources
      can(Action.Manage, 'all');
    } else if (user.role === Role.USER) {
      // Books permissions - read only
      can(Action.Read, Book);

      // Categories permissions - read only
      can(Action.Read, Category);

      // Authors permissions - read only
      can(Action.Read, Author);

      // Profile permissions - users can manage their own profile
      can([Action.Read, Action.Update], Profile, { user: { id: user.id } });

      // BookReviews permissions - full control over own reviews
      can(Action.Create, BookReview);
      can(Action.Read, BookReview);
      can([Action.Update, Action.Delete], BookReview, { user: { id: user.id } });

      // User permissions - can only read and update themselves
      can(Action.Read, User, { id: user.id });
      can(Action.Update, User, { id: user.id });

      // Explicitly deny certain actions
      cannot(Action.Delete, User);
      cannot([Action.Create, Action.Update, Action.Delete], Book);
      cannot([Action.Create, Action.Update, Action.Delete], Author);
      cannot([Action.Create, Action.Update, Action.Delete], Category);
    }

    return build();
  }
}
```

This factory creates permissions based on:
- User role (Admin has full access)
- Resource type (different rules for different entities)
- Ownership (users can only update their own profiles, reviews, etc.)
- Action type (read, create, update, delete)

### 3. Create a CASL Module

Register the CaslAbilityFactory as a provider in a NestJS module:

```typescript
// src/casl/casl.module.ts
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory/casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
```

Remember to import this module in your AppModule or any feature module where you need authorization.

### 4. Define the PolicyHandler Interface

Create an interface that defines how policy handlers should look:

```typescript
// src/casl/interfaces/policy-handler.interface.ts
import { MongoAbility } from '@casl/ability';

interface IPolicyHandler {
  handle(ability: MongoAbility): boolean;
}

type PolicyHandlerCallback = (ability: MongoAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

This interface allows for two types of policy handlers:
- Class-based handlers with a `handle` method
- Function-based handlers that take an ability and return a boolean

### 5. Create a CheckPolicies Decorator

Create a decorator that attaches policy handlers to route handlers:

```typescript
// src/casl/decorators/check-policies.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../interfaces/policy-handler.interface';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

This decorator will be used on controller methods to specify which permissions are required.

### 6. Implement the PoliciesGuard

Create a guard that checks if the user has the necessary permissions:

```typescript
// src/casl/guards/policies.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl-ability.factory/casl-ability.factory';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import { PolicyHandler } from '../interfaces/policy-handler.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (policyHandlers.length === 0) {
      return true; // No policies defined, allow access
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false; // No user found, deny access

    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: any) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
```

This guard:
1. Gets policy handlers from route metadata
2. Retrieves the user from the request
3. Creates an ability instance for that user
4. Ensures the user satisfies all policy requirements

### 7. Create Policy Handlers for Resources (Optional)

For cleaner code, you can create reusable policy handler classes:

```typescript
// src/casl/policies/book.policies.ts
import { MongoAbility } from '@casl/ability';
import { Book } from 'src/books/entities/book.entity';
import { Action } from '../casl-ability.factory/action.enum';

export class ReadBookPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Read, Book);
  }
}

export class CreateBookPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Create, Book);
  }
}

export class UpdateBookPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Update, Book);
  }
}

export class DeleteBookPolicyHandler {
  handle(ability: MongoAbility) {
    return ability.can(Action.Delete, Book);
  }
}
```

You can create similar policy handlers for other resources like authors, categories, profiles, etc.

### 8. Apply Guards in Controllers

Now you can apply these guards and policies in your controllers:

```typescript
// Example controller
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { ReadBookPolicyHandler, CreateBookPolicyHandler, UpdateBookPolicyHandler, DeleteBookPolicyHandler } from '../casl/policies/book.policies';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // Public endpoint - no guards
  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  // Authentication required, but no specific permissions needed
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  // Authentication and specific permission required
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new CreateBookPolicyHandler())
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  // Using functional style policy handler
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, Book))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  // Using class-based policy handler
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new DeleteBookPolicyHandler())
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
```

## Advanced Usage and Patterns

### Combining Multiple Policies

Sometimes you need to check multiple permissions:

```typescript
@UseGuards(JwtAuthGuard, PoliciesGuard)
@CheckPolicies(
  new ReadBookPolicyHandler(),
  (ability) => ability.can(Action.Read, User)
)
@Get('complex-endpoint')
complexEndpoint() {
  // This endpoint requires both permissions
}
```

### Dynamic Subject Instances

For more complex permissions that depend on the actual data:

```typescript
@Patch(':id')
async update(@Param('id') id: string, @Body() updateDto, @Request() req) {
  const resource = await this.service.findOne(id);
  
  const ability = this.caslAbilityFactory.createForUser(req.user);
  if (!ability.can(Action.Update, resource)) {
    throw new ForbiddenException('You are not allowed to update this resource');
  }
  
  return this.service.update(id, updateDto);
}
```

### Testing Your Authorization Logic

Here's how to test your authorization implementation:

```typescript
// test authorization logic
describe('Authorization', () => {
  it('should allow admins to delete books', async () => {
    const adminUser = { id: 1, role: Role.ADMIN };
    const ability = caslAbilityFactory.createForUser(adminUser);
    
    expect(ability.can(Action.Delete, Book)).toBeTruthy();
  });

  it('should not allow regular users to delete books', async () => {
    const regularUser = { id: 2, role: Role.USER };
    const ability = caslAbilityFactory.createForUser(regularUser);
    
    expect(ability.can(Action.Delete, Book)).toBeFalsy();
  });

  it('should allow users to update their own profile', async () => {
    const user = { id: 3, role: Role.USER };
    const ability = caslAbilityFactory.createForUser(user);
    const userProfile = new Profile();
    userProfile.user = { id: 3 } as User;
    
    expect(ability.can(Action.Update, userProfile)).toBeTruthy();
  });

  it('should not allow users to update others profiles', async () => {
    const user = { id: 4, role: Role.USER };
    const ability = caslAbilityFactory.createForUser(user);
    const otherUserProfile = new Profile();
    otherUserProfile.user = { id: 5 } as User;
    
    expect(ability.can(Action.Update, otherUserProfile)).toBeFalsy();
  });
});
```

## Common Access Patterns

| Resource   | Role  | Permission Pattern |
|------------|-------|-------------------|
| Own Profile | User | Can read and update their own profile only |
| Books      | Admin | Full control (create, read, update, delete) |
| Books      | User  | Read-only access |
| Reviews    | User  | Full control over own reviews, read-only for others' reviews |
| Users      | Admin | Full access to all user data |
| Users      | User  | Can only see and update their own user data |

## Troubleshooting Common Issues

### 1. Guards Not Being Applied

**Problem**: Authorization checks are not being performed.
**Solution**: Ensure guards are properly registered and in the correct order (JwtAuthGuard before PoliciesGuard).

### 2. Ownership Checks Not Working

**Problem**: Users can access resources they don't own.
**Solution**: Make sure your condition objects match your database structure exactly.

```typescript
// Correct
can(Action.Update, Profile, { user: { id: user.id } });

// Incorrect if your database structure is different
can(Action.Update, Profile, { userId: user.id });
```

### 3. Type Errors with MongoAbility

**Problem**: TypeScript errors when working with abilities.
**Solution**: Properly define subject types in your CASL setup.

## Best Practices

1. **Separation of Concerns**: Keep authorization logic separate from business logic
2. **Consistent Naming**: Use consistent naming for actions (e.g., always use `Action.Read` instead of sometimes using "view" or "get")
3. **Fail Secure**: Default to denying access and explicitly grant permissions
4. **Defense in Depth**: Don't rely solely on guards; check permissions in services too
5. **Test Thoroughly**: Create tests for different roles and edge cases
6. **Document Your Permissions**: Keep a clear record of what roles can do what
7. **Use Both Guards and Service-level Checks**: Especially for ownership-based permissions

## Additional Resources

- [CASL Documentation](https://casl.js.org/v5/en/)
- [NestJS Authorization](https://docs.nestjs.com/security/authorization)
- [RBAC Best Practices](https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/)
- [MongoDB Permissions with CASL](https://casl.js.org/v5/en/guide/mongodb)
