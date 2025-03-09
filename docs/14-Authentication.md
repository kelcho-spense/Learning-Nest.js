# Authentication in NestJS

![1741550989476](image/14-Authentication/1741550989476.png)

![1741551029786](image/14-Authentication/1741551029786.png)

Authentication is a critical component of most web applications, ensuring that users are who they claim to be and controlling access to protected resources. NestJS provides several built-in features to implement robust authentication systems.

## Setting Up Authentication

### Installation

To set up authentication in NestJS, you'll need to install the following packages:

```bash
pnpm add @nestjs/passport passport passport-jwt
pnpm add @nestjs/jwt
pnpm add bcrypt
```

For TypeScript typings:

```bash
pnpm add -D @types/passport-jwt @types/bcrypt
```

### Authentication Flow in this Application

1. User registers (signs up) via `/auth/signup` endpoint

![1741551283527](image/14-Authentication/1741551283527.png)
2. User logs in (signs in) via `/auth/signin` endpoint and receives:

- Access token (short-lived)
- Refresh token (long-lived)

![1741551391995](image/14-Authentication/1741551391995.png)

3. User includes the access token in requests to protected resources via Bearer token

![1741551559998](image/14-Authentication/1741551559998.png)
4. When the access token expires, user can get a new one via `/auth/refresh` endpoint using the refresh token

![1741551711126](image/14-Authentication/1741551711126.png)

![1741551779848](image/14-Authentication/1741551779848.png)
5. User can sign out via `/auth/signout/:id` endpoint to invalidate their tokens

![1741551854680](image/14-Authentication/1741551854680.png)

## NestJS Authentication Components: Decorators, Strategies, and Guards Explained

### Decorators

Decorators in NestJS are special functions that modify the behavior of classes, methods, or parameters. In authentication:

#### `@Public()` Decorator

```typescript
@Public()
@Get('categories')
findAll() {
  // This endpoint is accessible without authentication
}
```

- **Purpose**: Marks specific routes as publicly accessible
- **How it works**: Sets metadata that tells guards to skip authentication checks

#### `@GetCurrentUserId` Decorator

```typescript
@Post('profile')
createProfile(
  @Body() data: CreateProfileDto,
  @GetCurrentUserId() userId: string
) {
  // userId is automatically extracted from the JWT token
}
```

- **Purpose**: Extracts the user ID from the authenticated request
- **How it works**: Pulls the user ID from the JWT payload attached to the request

### Strategies

Strategies define how authentication is performed - they implement different authentication methods.

#### Access Token Strategy

```typescript
// This validates regular API requests
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  validate(payload: JWTPayload) {
    return payload; // This attaches the user data to request.user
  }
}
```

- **Purpose**: Validates short-lived access tokens
- **How it works**: Extracts the JWT from the Authorization header, verifies it with the secret key, and attaches the payload to the request

#### Refresh Token Strategy

```typescript
// This specifically validates refresh token requests
@Injectable()
export class RfStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  // Similar implementation, but for refresh tokens
}
```

- **Purpose**: Validates long-lived refresh tokens
- **How it works**: Similar to access token strategy but uses a different secret key

### Guards

Guards are middleware that determine if a request can proceed to a route handler.

#### Access Token Guard

```typescript
@Injectable()
export class AtGuard extends AuthGuard('jwt-at') {
  // Implementation that checks if routes are public or protected
}
```

- **Purpose**: Protects routes from unauthorized access
- **How it works**: Intercepts requests and uses the access token strategy to validate before allowing the request to proceed
- Applied globally to all routes by default

#### Refresh Token Guard

```typescript
@Injectable()
export class RtGuard extends AuthGuard('jwt-rt') {
  // Implementation specifically for refresh token validation
}
```

- **Purpose**: Specifically protects the token refresh endpoint
- **How it works**: Uses the refresh token strategy to validate refresh tokens

### How They Work Together

1. When a request comes in, the **Guard** intercepts it
2. The Guard uses a **Strategy** to validate the token
3. If valid, the user information is attached to the request
4. Your controller methods can use **Decorators** to easily access this user information

This separation creates a clean, secure authentication system where you can easily control which routes are protected and how to access the authenticated user's information.

## Implementation Details

### Auth Module Structure

The authentication system is organized as follows:

```
src/auth/
├── controllers/
│   └── auth.controller.ts
├── decorators/
│   ├── get-current-user.decorator.ts
│   ├── get-current-user-id.decorator.ts
│   └── public.decorator.ts
├── dto/
│   └── login.dto.ts
├── entities/
│   └── auth.entity.ts
├── guards/
│   ├── at.guard.ts
│   └── rt.guard.ts
├── strategies/
│   ├── at.strategy.ts
│   └── rt.strategy.ts
├── auth.module.ts
└── auth.service.ts
```

### Authentication Controller

The `AuthController` handles authentication operations:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signUpLocal(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUpLocal(createAuthDto);
  }

  @Public()
  @Post('signin')
  signInLocal(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signInLocal(createAuthDto);
  }
  
  @UseGuards(AtGuard)
  @Get('signout/:id')
  signOut(@Param('id') id: string) {
    return this.authService.signOut(id);
  }

  @UseGuards(RtGuard)
  @Get('refresh')
  refreshTokens(
    @Query('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.sub !== id) {
      throw new UnauthorizedException('Invalid user');
    }
    return this.authService.refreshTokens(id, user.refreshToken);
  }
}
```

### Authentication Service

The `AuthService` handles authentication business logic:

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Sign up a new user
  async signUpLocal(createAuthDto: CreateAuthDto) {
    // Check if user exists
    // Hash password
    // Save user
    // Generate tokens
    // Return tokens
  }

  // Sign in an existing user
  async signInLocal(AuthData: CreateAuthDto) {
    // Check if user exists
    // Validate password
    // Generate tokens
    // Save refresh token
    // Return tokens
  }

  // Sign out a user
  async signOut(userId: string) {
    // Remove refresh token
    // Return success message
  }

  // Refresh tokens
  async refreshTokens(userId: string, refreshToken: string) {
    // Validate refresh token
    // Generate new tokens
    // Update refresh token
    // Return new tokens
  }

  // Generate access and refresh tokens
  private async getTokens(userId: string, email: string) {
    // Generate access token
    // Generate refresh token
    // Return tokens
  }
}
```

### JWT Strategies

Two JWT strategies are implemented:

1. **Access Token Strategy** (`at.strategy.ts`):

   ```typescript
   @Injectable()
   export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
     constructor(private readonly configService: ConfigService) {
       super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
       });
     }

     validate(payload: JWTPayload) {
       return payload; // attaches payload to request.user
     }
   }
   ```
2. **Refresh Token Strategy** (`rt.strategy.ts`):

   ```typescript
   @Injectable()
   export class RfStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
     constructor(private readonly configService: ConfigService) {
       super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
         passReqToCallback: true,
       });
     }

     validate(req: Request, payload: any) {
       const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
       return { ...payload, refreshToken };
     }
   }
   ```

### Auth Guards

Two guards protect routes:

1. **Access Token Guard** (`at.guard.ts`):

   ```typescript
   @Injectable()
   export class AtGuard extends AuthGuard('jwt-at') {
     constructor(private reflector: Reflector) {
       super();
     }

     canActivate(context: ExecutionContext) {
       const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
         context.getHandler(),
         context.getClass(),
       ]);

       if (isPublic) {
         return true;
       }

       return super.canActivate(context);
     }
   }
   ```
2. **Refresh Token Guard** (`rt.guard.ts`):

   ```typescript
   @Injectable()
   export class RtGuard extends AuthGuard('jwt-rt') {
     constructor() {
       super();
     }
   }
   ```

### Custom Decorators

1. **Public Decorator** - Marks routes as public (no authentication required):

   ```typescript
   export const Public = () => SetMetadata('isPublic', true);
   ```
2. **GetCurrentUserId Decorator** - Extracts the current user ID from the request:

   ```typescript
   export const GetCurrentUserId = createParamDecorator(
     (data: undefined, context: ExecutionContext): string => {
       const request = context.switchToHttp().getRequest();
       return request.user['sub'];
     },
   );
   ```

## Global Authentication

In this application, all routes are protected by default through the global application of the `AtGuard`:

```typescript
// In app.module.ts
@Module({
  // ...
  providers: [
    // ...
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    }
  ],
})
export class AppModule {}
```

## How to Use Authentication

### Protecting Routes

All routes are protected by default. To access them, include the access token in your request:

```http
GET http://localhost:8000/books
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Making Routes Public

To make a route public (no authentication required), use the `@Public()` decorator:

```typescript
import { Public } from '../auth/decorators';

@Controller('categories')
export class CategoriesController {
  // ...
  
  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
  
  // ...
}
```

### Accessing the Current User ID

To access the current user's ID in a controller method:

```typescript
import { GetCurrentUserId } from '../auth/decorators';

@Controller('profiles')
export class ProfilesController {
  // ...
  
  @Post()
  create(
    @Body() createProfileDto: CreateProfileDto,
    @GetCurrentUserId() userId: string
  ) {
    // Use userId
    return this.profilesService.create({ ...createProfileDto, userId });
  }
  
  // ...
}
```

### Authentication Flow

1. **Register a new user**:

   ```http
   POST http://localhost:8000/auth/signup
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "securepassword123"
   }
   ```
2. **Sign in to get tokens**:

   ```http
   POST http://localhost:8000/auth/signin
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "securepassword123"
   }
   ```

   Response:

   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```
3. **Access protected resources**:

   ```http
   GET http://localhost:8000/books
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Refresh tokens when access token expires**:

   ```http
   GET http://localhost:8000/auth/refresh?id=user-id
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. **Sign out**:

   ```http
   GET http://localhost:8000/auth/signout/user-id
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Environment Configuration

The authentication system uses environment variables for configuration:

```
JWT_ACCESS_TOKEN_SECRET=your-access-token-secret
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_SECRET=your-refresh-token-secret
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d
```

## Security Best Practices

1. **Separate token secrets**: Different secrets for access and refresh tokens.
2. **Short-lived access tokens**: Access tokens are short-lived (15 minutes by default).
3. **Longer-lived refresh tokens**: Refresh tokens last longer but can be invalidated.
4. **Password hashing**: Passwords are hashed using bcrypt before storage.
5. **Token invalidation**: Refresh tokens can be invalidated on sign-out.
6. **Public route marking**: Explicitly mark which routes should be public.
7. **Global protection**: All routes are protected by default.

## Conclusion

This NestJS application implements a robust JWT-based authentication system with separate access and refresh tokens. By applying the `AtGuard` globally, all routes are protected by default, and you can use the `@Public()` decorator to explicitly mark routes that should be accessible without authentication.

This approach follows modern security best practices while providing a convenient developer experience through the use of custom decorators and guards.
