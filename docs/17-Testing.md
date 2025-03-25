# Testing in NestJS

Testing is a crucial part of application development. NestJS provides built-in support for both unit testing and end-to-end (e2e) testing using Jest as the default testing framework.

## Table of Contents

- [Introduction](#introduction)
- [Testing Types](#testing-types)
- [Unit Testing](#unit-testing)
  - [Configuration](#unit-testing-configuration)
  - [Testing Controllers](#testing-controllers)
  - [Mocking Dependencies](#mocking-dependencies)
  - [Writing Effective Tests](#writing-effective-tests)
- [End-to-End Testing](#end-to-end-testing)
  - [Configuration](#e2e-testing-configuration)
  - [Creating E2E Tests](#creating-e2e-tests)
- [Running Tests](#running-tests)

## Introduction

NestJS creates testing files automatically when you generate components using the Nest CLI. These files include:

- `.spec.ts` files for unit tests
- `.e2e-spec.ts` files for end-to-end tests

The test files are placed alongside the files they test, making it easy to maintain and update tests when the source code changes.

## Testing Types

### Unit Testing

Unit tests focus on testing individual components in isolation. They verify that each unit of code works as expected by mocking dependencies.

### End-to-End Testing

E2E tests verify that the complete flow of an application works correctly. They test the entire application stack from the HTTP request to database operations.

## Unit Testing

### Unit Testing Configuration

NestJS configures Jest for testing automatically. Here's the default Jest configuration from our project's `package.json`:

```json
"jest": {
  "moduleFileExtensions": [
    "js",
    "json",
    "ts"
  ],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

This configuration:

- Specifies file extensions to consider
- Sets the root directory for tests
- Defines a pattern to identify test files
- Configures transformation for TypeScript files
- Sets up coverage reporting

### Testing Controllers

Let's examine how to test a controller using our example from `users.controller.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  // Create a mock repository
  const mockUserRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
  });

  // Test cases follow...
});
```

The key steps for testing controllers are:

1. **Create a test module** - Use `Test.createTestingModule()` to build a testing module
2. **Define dependencies** - Include necessary controllers and providers
3. **Mock repositories** - Create mock implementations for database repositories
4. **Compile the module** - Call `.compile()` to build the testing module
5. **Get instances** - Use `moduleRef.get()` to obtain controller and service instances

### Mocking Dependencies

Proper mocking is essential for unit testing. In our example, we mock the UserRepository:

```typescript
const mockUserRepository = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockReturnValue({}),
  save: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
};
```

And provide it using the repository token:

```typescript
{
  provide: getRepositoryToken(User),
  useValue: mockUserRepository,
}
```

### Understanding `.spyOn()` in Jest Testing

The `jest.spyOn()` method is a powerful testing utility that allows you to observe and track method calls on an object. In the context of your NestJS tests, it serves several important purposes:

#### What `.spyOn()` Does:

1. **Creates a spy/tracker** on a specific method of an object (like your `usersService`)
2. **Records information** about calls to that method, including:
   * Whether the method was called
   * How many times it was called
   * What arguments were passed to it
3. **Allows mock implementation** when chained with methods like `.mockImplementation()` or `.mockResolvedValue()`

##### Example from Your Code:

```typescript
jest
  .spyOn(usersService, 'findAll')
  .mockImplementation(() => Promise.resolve(users));
```

This code:

* Creates a spy on the `findAll` method of the `usersService` object
* Replaces the original implementation with a mock function that returns the `users` array wrapped in a resolved Promise
* Allows you to later verify how the method was called using assertions

##### Verification Example:

`expect(usersService.findAll).toHaveBeenCalledWith();`

This assertion checks that the `findAll` method was called without any arguments.

The `.spyOn()` method is essential for proper unit testing as it helps isolate the component being tested from its dependencies by allowing you to control and monitor how those dependencies are used.

### Writing Effective Tests

Here's an example of testing the `findAll` method:

```typescript
describe('findAll', () => {
  it('should return an array of users', async () => {
    const users: User[] = [];
    // mock the service method
    jest
      .spyOn(usersService, 'findAll')
      .mockImplementation(() => Promise.resolve(users));

    const results = await usersController.findAll();
    expect(results).toEqual(results);
    expect(usersService.findAll).toHaveBeenCalledWith();
  });
});
```

And testing the `findOne` method:

```typescript
describe('findOne', () => {
  it('should return a user', async () => {
    const id = randomUUID();
    const mockProfile: Profile = {
      id: id,
      bio: 'Test Bio',
      avatar: 'test.jpg',
      dateOfBirth: new Date(),
      location: 'Test Location',
      user: User.prototype,
    };

    const result: User = {
      id: id,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      profile: mockProfile,
      bookReviews: [],
    };

    // mock the service method
    jest
      .spyOn(usersService, 'findOne')
      .mockImplementation(() => Promise.resolve(result));

    const response = await usersController.findOne(id);
    expect(response).toEqual(result);
    expect(usersService.findOne).toHaveBeenCalledWith(id);
  });
});
```

Key testing patterns:

1. **Arrange** - Set up the test conditions and mock return values
2. **Act** - Call the method being tested
3. **Assert** - Verify the results and method calls

## End-to-End Testing

### E2E Testing Configuration

E2E tests have their own Jest configuration. Here's the configuration from `jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

The main differences from unit test configuration:

- `rootDir` is set to the project root
- `testRegex` looks for `.e2e-spec.ts` files
- Tests are typically placed in the `test` directory

### Creating E2E Tests

To create an E2E test, follow these steps:

1. **Create a test file** in the `test` directory with a `.e2e-spec.ts` extension
2. **Import necessary modules** from `@nestjs/testing` and `supertest`
3. **Create a test module** that includes all necessary components
4. **Set up the app** before running tests
5. **Create test cases** that make HTTP requests to your API endpoints

Here's an example of what an E2E test might look like for the Users controller:

```typescript
// users.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('email');
      });
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual('Test User');
        expect(res.body.email).toEqual('test@example.com');
      });
  });
});
```

## Running Tests

NestJS provides several npm scripts for running tests:

```bash
# Run unit tests
npm run test

# Watch mode for unit tests
npm run test:watch

# Generate test coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

These commands are defined in the `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

## Best Practices

1. **Keep tests focused** - Each test should verify a single functionality
2. **Use descriptive test names** - Make it clear what the test is checking
3. **Properly mock dependencies** - Ensure isolated testing of components
4. **Cleanup after tests** - Reset any shared state between tests
5. **Test both positive and negative cases** - Include error handling tests
6. **Maintain test independence** - Tests should not depend on each other

## Conclusion

Testing is an integral part of NestJS development. By leveraging the built-in testing tools and following best practices, you can ensure your application is robust and reliable.
