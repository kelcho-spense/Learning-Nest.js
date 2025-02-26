# NestJS Repository Pattern with TypeORM

This project demonstrates how to implement the Repository Pattern using NestJS and TypeORM. It showcases three types of relationships:

1. **One-to-One**: User and Profile
2. **One-to-Many**: User and Posts
3. **Many-to-Many**: Posts and Categories

## Project Structure

The application is structured as follows:

```
src/
├── users/
│   ├── entities/user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── profiles/
│   ├── entities/profile.entity.ts
│   ├── profiles.controller.ts
│   ├── profiles.module.ts
│   └── profiles.service.ts
├── posts/
│   ├── entities/post.entity.ts
│   ├── posts.controller.ts
│   ├── posts.module.ts
│   └── posts.service.ts
├── categories/
│   ├── entities/category.entity.ts
│   ├── categories.controller.ts
│   ├── categories.module.ts
│   └── categories.service.ts
├── app.module.ts
└── main.ts
```

## Relationships Explained

### One-to-One: User ↔ Profile

Each User has exactly one Profile, and each Profile belongs to exactly one User.

```typescript
// In User entity
@OneToOne(() => Profile, (profile) => profile.user)
profile: Profile;

// In Profile entity
@OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'userId' })
user: User;
```

### One-to-Many: User ↔ Posts

A User can have many Posts, but each Post belongs to exactly one User.

```typescript
// In User entity
@OneToMany(() => Post, (post) => post.author)
posts: Post[];

// In Post entity
@ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'authorId' })
author: User;
```

### Many-to-Many: Posts ↔ Categories

A Post can have many Categories, and each Category can be associated with many Posts.

```typescript
// In Post entity
@ManyToMany(() => Category, (category) => category.posts)
@JoinTable({
    name: 'posts_categories',
    joinColumn: { name: 'postId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' }
})
categories: Category[];

// In Category entity
@ManyToMany(() => Post, (post) => post.categories)
posts: Post[];
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the application**:
   ```bash
   npm run start:dev
   ```

3. **Access the API**:
   The API will be available at http://localhost:3000

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Profiles
- `GET /profiles` - Get all profiles
- `GET /profiles/:id` - Get a specific profile
- `POST /profiles` - Create a new profile
- `PATCH /profiles/:id` - Update a profile
- `DELETE /profiles/:id` - Delete a profile

### Posts
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get a specific post
- `POST /posts` - Create a new post
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get a specific category
- `POST /categories` - Create a new category
- `PATCH /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

## Using the Repository Pattern

This project follows the Repository Pattern, where each entity has its own repository that handles database operations. This pattern provides a clean separation between the database access logic and the rest of the application.

Example usage in a service:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['profile', 'posts'],
    });
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['profile', 'posts'],
    });
  }

  // More CRUD operations...
}
```
