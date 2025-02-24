Here's a step-by-step implementation of a project that incorporates one-to-one, one-to-many, and many-to-many relationships using  **NestJS** ,  **TypeORM** , and  **SQLite** . I'll guide you through the creation of entities, relationships, and CRUD operations for each case.

### 1. **Create a NestJS Project**

First, create a new NestJS project if you haven't already:

```bash
nest new bookstore
```

After this, choose TypeScript as the language, and when prompted, choose to install the dependencies automatically.

### 2. **Install TypeORM and SQLite**

To set up TypeORM with SQLite, you will need to install TypeORM and SQLite3:

```bash
npm install @nestjs/typeorm typeorm sqlite3
```

### 3. **Set Up TypeORM in `app.module.ts`**

Now, configure TypeORM to use SQLite in the `app.module.ts` file.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { Book } from './book.entity';
import { Profile } from './profile.entity';
import { Category } from './category.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Author, Book, Profile, Category],
      synchronize: true, // Note: In production, set this to false and use migrations
    }),
    TypeOrmModule.forFeature([Author, Book, Profile, Category]),
  ],
})
export class AppModule {}
```

### 4. **Define Entities with Relationships**

#### **Author ↔ Profile (One-to-One)**

In this case, each `Author` has a unique `Profile`.

```typescript
// author.entity.ts
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Profile)
  @JoinColumn()  // Join column indicates the foreign key
  profile: Profile;
}
```

```typescript
// profile.entity.ts
import { Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Author } from './author.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Author)
  author: Author;
}
```

#### **Author ↔ Books (One-to-Many)**

An `Author` can write many `Books`, and each `Book` is written by one `Author`.

```typescript
// author.entity.ts
import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
```

```typescript
// book.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Author } from './author.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;
}
```

#### **Book ↔ Category (Many-to-Many)**

A `Book` can belong to many `Categories`, and each `Category` can contain many `Books`.

```typescript
// book.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Category, (category) => category.books)
  @JoinTable() // This decorator will create a join table for many-to-many relationship
  categories: Category[];
}
```

```typescript
// category.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Book, (book) => book.categories)
  books: Book[];
}
```

### 5. **Set Up Controllers and Services**

Now that we have our entities and relationships set up, we need controllers and services to handle the business logic and routes.

#### **Author Controller and Service**

Let's create a service and controller for managing authors.

```typescript
// author.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  findAll(): Promise<Author[]> {
    return this.authorRepository.find();
  }

  findOne(id: number): Promise<Author> {
    return this.authorRepository.findOne(id);
  }

  async create(authorData: Partial<Author>): Promise<Author> {
    const author = this.authorRepository.create(authorData);
    return await this.authorRepository.save(author);
  }
}
```

```typescript
// author.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Author } from './author.entity';

@Controller('authors')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Get()
  findAll(): Promise<Author[]> {
    return this.authorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Author> {
    return this.authorService.findOne(id);
  }

  @Post()
  create(@Body() authorData: Partial<Author>): Promise<Author> {
    return this.authorService.create(authorData);
  }
}
```

### 6. **Run the Application**

Now, you can run your application:

```bash
npm run start
```

You can access your API and interact with your entities (Author, Profile, Book, Category) through RESTful endpoints like:

* `GET /authors`: Retrieve all authors
* `GET /authors/:id`: Retrieve a specific author
* `POST /authors`: Create a new author

### 7. **Testing CRUD Operations**

You can use Postman or any API client to test these CRUD operations.

* **POST** `/authors`: Create an author with a profile
* **GET** `/authors`: Get a list of authors
* **GET** `/authors/:id`: Get a specific author
* **POST** `/books`: Create books associated with authors
* **GET** `/books`: Get all books, including categories

### 8. **Data Validation (Optional)**

To ensure the integrity of your data, you can use class-validator with NestJS. Install it by running:

```bash
npm install class-validator class-transformer
```

Then, you can add validation to your DTOs (Data Transfer Objects) or entities using decorators like `@IsString()`, `@IsInt()`, etc.

---

By following this guide, you'll have successfully set up a project with one-to-one, one-to-many, and many-to-many relationships in NestJS using TypeORM and SQLite.
