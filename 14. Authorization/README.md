# Role-Based Access Control (RBAC) with CASL in NestJS

## Introduction

Role-Based Access Control (RBAC) is an approach to restricting system access to authorized users based on their roles. Instead of assigning permissions directly to individual users, permissions are assigned to roles, and users are then assigned to these roles. This simplifies access management and enhances security.

CASL is an isomorphic authorization library that allows you to manage user permissions in your application. It provides a flexible and expressive way to define and check permissions.

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

### 1. Define Your Ability Types

First, we need to define what types of actions can be performed on what resources. This forms the foundation of our permission system.

Create an `ability` folder with the following files:

```typescript
// src/ability/ability.factory.ts
import { MongoAbility, AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, Post, Comment } from '@prisma/client';
import { Action } from './action.enum';

// Define what resources (subjects) our application has
type AppSubjects = {
  User: User;
  Post: Post;
  Comment: Comment;
  all: 'all'; // Special resource type that represents any resource
};

// Define what our application's ability looks like
export type AppAbility = MongoAbility<[Action, AppSubjects]>;

@Injectable()
export class AbilityFactory {
  // This method creates an ability instance for a specific user
  createForUser(user: User) {
    // The ability builder provides methods to define permissions
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // Define permissions for ADMIN role
    if (user.role === 'ADMIN') {
      // Admin can do anything with any resource
      can(Action.Manage, 'all');
    }

    // Define permissions for USER role
    if (user.role === 'USER') {
      // Users can read and create posts
      can(Action.Read, 'Post');
      can(Action.Create, 'Post');
      
      // Users can update and delete only their own posts
      can([Action.Update, Action.Delete], 'Post', { authorId: user.id });
      
      // Similar permissions for comments
      can(Action.Read, 'Comment');
      can(Action.Create, 'Comment');
      can([Action.Update, Action.Delete], 'Comment', { authorId: user.id });
    }

    // Build and return the ability instance
    return build();
  }
}
```

Let's break down what's happening in this file:

- We define `AppSubjects` to specify what resources our application has
- We create an `AppAbility` type that combines actions with subjects
- The `AbilityFactory` class has a method `createForUser` that builds a set of permissions for a given user
- For administrators, we grant full access to everything with `can(Action.Manage, 'all')`
- For regular users, we grant specific permissions with conditions (e.g., they can only update/delete their own posts)

Next, we define the possible actions:

```typescript
// src/ability/action.enum.ts
export enum Action {
  Manage = 'manage', // Special action that represents any action
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

This enum makes it easier to consistently refer to the same actions throughout our application.

### 2. Create an Ability Module

Now we need to make our `AbilityFactory` available to the rest of the application by creating a module:

```typescript
// src/ability/ability.module.ts
import { Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';

@Module({
  providers: [AbilityFactory],  // Register the factory as a provider
  exports: [AbilityFactory],    // Make it available to other modules
})
export class AbilityModule {}
```

In our codebase, we can see the actual implementation in the CASL module:

```typescript
// src/casl/casl.module.ts
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory/casl-ability.factory';

@Module({
    providers: [CaslAbilityFactory],
    exports: [CaslAbilityFactory],
})
export class CaslModule { }
```

This is a standard NestJS module that registers our ability factory as a provider and exports it for use in other modules.

### 3. Setup Policy Guards

Guards in NestJS are used to determine whether a request should be handled or not. We'll create a guard that checks if the user has the necessary permissions:

```typescript
// src/ability/policies.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { CHECK_POLICIES_KEY } from '../casl/decorators/check-policies.decorator';
import { PolicyHandler } from '../casl/interfaces/policy-handler.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Get policy handlers from route metadata using reflector
        const policyHandlers = this.reflector.get<PolicyHandler[]>(
            CHECK_POLICIES_KEY,
            context.getHandler(),
        ) || [];

        // If no policies are defined, allow access by default
        if (policyHandlers.length === 0) {
            return true; 
        }

        // Get the user from the request object
        const { user } = context.switchToHttp().getRequest();
        if (!user) return false; // No user found, deny access

        // Create an ability instance for this user
        const ability = this.caslAbilityFactory.createForUser(user);

        // Check if the user satisfies all policy handlers
        return policyHandlers.every((handler) =>
            this.execPolicyHandler(handler, ability));
    }

    // Helper method to execute a policy handler
    private execPolicyHandler(handler: PolicyHandler, ability: any) {
        if (typeof handler === 'function') {
            // If the handler is a function, call it with the ability
            return handler(ability);
        }
        // If it's an object with a handle method, call that method
        return handler.handle(ability);
    }
}
```

Let's understand this guard:

1. The guard implements NestJS's `CanActivate` interface, which requires a `canActivate` method
2. It uses NestJS's `Reflector` to access metadata attached to route handlers
3. It fetches policy handlers from the route's metadata
4. It extracts the user from the request
5. It creates an ability instance for that user
6. It checks if the user satisfies all policy handlers
7. The `execPolicyHandler` method handles both function-style and class-style policy handlers

### 4. Define Policy Handler Interface

We need to define what a policy handler looks like:

```typescript
// src/casl/interfaces/policy-handler.interface.ts
import { MongoAbility } from '@casl/ability';

// Interface for class-based policy handlers
interface IPolicyHandler {
    handle(ability: MongoAbility): boolean;
}

// Type for function-based policy handlers
type PolicyHandlerCallback = (ability: MongoAbility) => boolean;

// A policy handler can be either a class or a function
export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

This interface allows us to create policy handlers in two ways:
1. As a function that takes an ability and returns a boolean
2. As a class with a `handle` method that takes an ability and returns a boolean

### 5. Create Policy Decorators

We need a way to attach policy handlers to our route handlers. We'll use a decorator:

```typescript
// src/casl/decorators/check-policies.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../interfaces/policy-handler.interface';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

This decorator:
1. Takes one or more policy handlers as arguments
2. Uses NestJS's `SetMetadata` to attach these handlers to the route handler
3. Uses a constant key `CHECK_POLICIES_KEY` to identify the metadata

### 6. Create Policy Handler Classes (Optional)

For more complex permission checks, we can create reusable policy handler classes:

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

These classes encapsulate permission checks for different actions on the Book resource, making our code more maintainable.

### 7. Implement in Controllers

Now we can apply our RBAC system in our controllers:

```typescript
// src/posts/posts.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { Action } from '../casl/casl-ability.factory/action.enum';
import { Post as PostModel } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Protected route requiring authentication but no specific permissions
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  // Public route without any guards
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // Public route without any guards
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  // Protected route requiring authentication AND specific permission
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, 'Post'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  // Protected route requiring authentication AND specific permission
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Post'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
```

Let's understand what's happening here:

1. Some routes are protected by `JwtAuthGuard` only, which just checks if the user is authenticated
2. Other routes are protected by both `JwtAuthGuard` and `PoliciesGuard`, which check authentication and permissions
3. We use the `@CheckPolicies` decorator to define what permissions are required
4. The policy handler is provided as a function that checks if the user can perform a specific action on a resource

## Advanced Usage - Real-world Examples

Let's look at how our codebase handles more complex permission scenarios:

```typescript
// src/casl/casl-ability.factory/casl-ability.factory.ts
@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.role === Role.ADMIN) {
            // Admin can manage all resources
            can(Action.Manage, 'all');
        } else if (user.role === Role.USER) {
            // Books permissions
            can(Action.Read, Book);

            // Categories permissions
            can(Action.Read, Category);

            // Authors permissions
            can(Action.Read, Author);

            // Profile permissions - users can manage their own profile
            can([Action.Read, Action.Update], Profile, { user: { id: user.id } });

            // BookReviews permissions - full control over own reviews
            can(Action.Create, BookReview);
            can(Action.Read, BookReview);
            can([Action.Update, Action.Delete], BookReview, { user: { id: user.id } });

            // User permissions - can only read and update themselves
            can(Action.Read, User, { id: user.id });
        }

        return build();
    }
}
```

This implementation shows:

1. Role-based permissions (different permissions for ADMIN vs USER)
2. Resource-specific permissions (different rules for Books, Categories, etc.)
3. Owner-based permissions (users can only update their own resources)
4. Multi-action permissions (applying the same rule to multiple actions)

## Access Levels and Route Protection

Below is a table of common routes and their recommended access levels:

| Route            | HTTP Method | Required Role       | Action | Description            |
| ---------------- | ----------- | ------------------- | ------ | ---------------------- |
| /posts           | GET         | Any                 | Read   | List all posts         |
| /posts/:id       | GET         | Any                 | Read   | View a specific post   |
| /posts           | POST        | User, Admin         | Create | Create a new post      |
| /posts/:id       | PATCH/PUT   | User (owner), Admin | Update | Update a specific post |
| /posts/:id       | DELETE      | User (owner), Admin | Delete | Delete a specific post |
| /users           | GET         | Admin               | Read   | List all users         |
| /users/:id       | GET         | User (self), Admin  | Read   | View user profile      |
| /users/:id       | PATCH/PUT   | User (self), Admin  | Update | Update user profile    |
| /users/:id       | DELETE      | Admin               | Delete | Delete a user          |
| /admin/dashboard | GET         | Admin               | Read   | Access admin dashboard |

## Testing RBAC Implementation

To test your RBAC implementation, you can:

1. Create users with different roles (e.g., Admin, User)
2. Generate JWT tokens for these users
3. Make API requests with these tokens
4. Verify that access is granted or denied based on the user's role

### Example Test for Post Update:

```typescript
// test/posts.e2e-spec.ts
it('should allow user to update their own post', async () => {
  // Login as user
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: 'user@example.com', password: 'password' });
  
  const token = loginResponse.body.access_token;
  
  // Create a post
  const createResponse = await request(app.getHttpServer())
    .post('/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Post', content: 'This is a test post' });
  
  const postId = createResponse.body.id;
  
  // Update the post
  return request(app.getHttpServer())
    .patch(`/posts/${postId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Updated Test Post' })
    .expect(200);
});

it('should not allow user to update another user\'s post', async () => {
  // Similar setup but trying to update a post not owned by the user
  // Should return 403 Forbidden
});
```

## Common Gotchas and Best Practices

1. **Authentication vs. Authorization**: Remember that authentication (who you are) is separate from authorization (what you're allowed to do). Always use both together.

2. **Order of Guards**: When using multiple guards, order matters! Put `JwtAuthGuard` before `PoliciesGuard` to ensure the user is authenticated before checking permissions.

3. **Ownership Checks**: For resources that are "owned" by users, ensure your ability factory includes conditions that check the user ID.

4. **Performance**: For large applications, consider caching abilities or permission results to improve performance.

5. **Error Handling**: Provide meaningful error messages when permission is denied.

6. **Testing**: Always test your RBAC implementation with different user roles and edge cases.

7. **Defensive Programming**: Never assume that your guards will catch everything. Also perform permission checks in your service layer.

## Best Practices

1. Always use guards on protected routes
2. Implement fine-grained permissions based on user roles
3. Test all routes with different user roles
4. Keep permissions logic separate from business logic
5. Use decorators for better code readability
6. Document your permission system for future developers

## Additional Resources

- [CASL Documentation](https://casl.js.org/v5/en/)
- [NestJS Authorization](https://docs.nestjs.com/security/authorization)
