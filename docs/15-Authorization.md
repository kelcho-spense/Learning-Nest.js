## Authorization

**Authorization** refers to the process that determines what a user is able to do. For example, an ``administrative user`` is allowed to create, edit, and delete posts. A ``non-administrative user`` is only authorized to read the posts.

## Authorization in NestJS with Common Ability Schema Library(CASL)

CASL is a JavaScript library designed to manage user permissions and access control, allowing developers to define and enforce rules for what actions users can perform on resources

All permissions are defined in a single location (the Ability class) and not duplicated across UI components, API services, and database queries.

Authorization is orthogonal and independent from authentication. However, authorization requires an authentication mechanism.

## Introduction

Authorization is a critical component of any secure application. While authentication verifies who users are, authorization determines what they can do. In this guide, we'll explore how to implement a robust authorization system in NestJS using CASL.

## Understanding CASL

[CASL](https://casl.js.org/) is an isomorphic authorization library that restricts which resources a given user is allowed to access. It's designed to be adaptable to various environments and frameworks.

CASL uses an attribute-based authorization model that allows you to define abilities based on user roles and other attributes.

## Installation

First, install the necessary packages:

```bash
npm install @casl/ability
# or
pnpm add @casl/ability
```

## Implementation Walkthrough

### Step 1: Create Action Enum

First, define the possible actions a user can perform:

```typescript
// src/casl/casl-ability.factory/action.enum.ts
export enum Action {
    Manage = 'manage', // read, create, update, delete
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete'
}
```

### Step 2: Create the CASL Ability Factory

Create a service that will generate ability objects based on user roles and permissions:

```typescript
// src/casl/casl-ability.factory/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';
import { Action } from './action.enum';

// Define the subjects (resources) that permissions apply to
type Subjects = InferSubjects<typeof User | typeof Book> | 'all';

// Define the type of Ability we're using
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>
    );

    if (user.isAdmin) {
      // Admin can do anything
      can(Action.Manage, 'all');
    } else {
      // Regular user permissions
      can(Action.Read, Book); // Everyone can read books
    
      // Users can update their own profile
      can(Action.Update, User, { id: user.id });
    
      // Users can create books
      can(Action.Create, Book);
    
      // Users can update and delete only books they own
      can(Action.Update, Book, { authorId: user.id });
      can(Action.Delete, Book, { authorId: user.id });
    }

    return build({
      // Convert object instances to plain objects for type checking
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
```

### Step 3: Create the CASL Module

Create a module to organize your CASL-related components:

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

### Step 4: Create Policy Guards

Create guards to check if users have the required permissions for specific actions:

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
    const policyHandlers = this.reflector.get<PolicyHandler[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    ) || [];

    if (policyHandlers.length === 0) {
      return true; // No policies defined means no restrictions
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false; // No user means no permissions
    }

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

### Step 5: Create Policy Handlers and Decorators

Create interfaces and decorators to define and check policies:

```typescript
// src/casl/interfaces/policy-handler.interface.ts
import { AppAbility } from '../casl-ability.factory/casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

```typescript
// src/casl/decorators/check-policies.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../interfaces/policy-handler.interface';

export const CHECK_POLICIES_KEY = 'check_policies';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

### Step 6: Implement Policy Handlers for Specific Actions

Create concrete policy handlers for common actions:

```typescript
// src/casl/policies/book-policies.ts
import { Injectable } from '@nestjs/common';
import { Action } from '../casl-ability.factory/action.enum';
import { AppAbility } from '../casl-ability.factory/casl-ability.factory';
import { Book } from '../../books/entities/book.entity';

@Injectable()
export class BookPolicies {
  static read(ability: AppAbility) {
    return ability.can(Action.Read, Book);
  }

  static create(ability: AppAbility) {
    return ability.can(Action.Create, Book);
  }

  static update(ability: AppAbility, bookId: number) {
    return ability.can(Action.Update, Book);
    // In a real application, you would fetch the book and check ownership
  }

  static delete(ability: AppAbility, bookId: number) {
    return ability.can(Action.Delete, Book);
    // In a real application, you would fetch the book and check ownership
  }
}
```

### Step 7: Apply Authorization to Controllers

Finally, apply the guards and policies to your controllers:

```typescript
// src/books/books.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { BookPolicies } from '../casl/policies/book-policies';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(BookPolicies.create)
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(BookPolicies.read)
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(BookPolicies.read)
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => BookPolicies.update(ability, +id))
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => BookPolicies.delete(ability, +id))
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
```

## Testing Authorization

To test your authorization system, you can create integration tests:

```typescript
// test/books.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/entities/user.entity';

describe('Books Controller (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();

    // Create tokens for testing
    const adminUser = { id: 1, username: 'admin', isAdmin: true } as User;
    const regularUser = { id: 2, username: 'user', isAdmin: false } as User;
  
    adminToken = authService.generateToken(adminUser);
    userToken = authService.generateToken(regularUser);
  });

  it('should allow admin to access all books', () => {
    return request(app.getHttpServer())
      .get('/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should allow regular user to read books', () => {
    return request(app.getHttpServer())
      .get('/books')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  // More tests for specific permissions...

  afterAll(async () => {
    await app.close();
  });
});
```

## Best Practices

1. **Separate Concerns**: Keep authorization logic separate from business logic
2. **Granular Permissions**: Define fine-grained permissions rather than broad ones
3. **Test Thoroughly**: Ensure you test both positive and negative permission cases
4. **Consider Performance**: For complex applications, consider caching ability objects
5. **Error Handling**: Provide meaningful error messages when permission is denied
6. **Conditional Abilities**: Use conditions to define complex access rules

## Conclusion

With CASL and NestJS, you can create a powerful and flexible authorization system that meets your application's security requirements. This approach allows you to define fine-grained permissions based on user roles, resource ownership, and other conditions.

By following this implementation pattern, you ensure that your application's authorization logic is centralized, testable, and maintainable.
