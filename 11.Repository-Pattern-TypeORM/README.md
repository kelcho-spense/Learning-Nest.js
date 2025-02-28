# NestJS Repository Pattern with TypeORM

## BookVault`<Book Management System>`

A comprehensive book management system built with NestJS and TypeORM, demonstrating advanced repository pattern implementation and various entity relationships.

## Entity Relationships

BookVault demonstrates advanced TypeORM relationship management:

### Core Entities

- **Authors**
  - One-to-Many with Books (one author can write multiple books)
  - Contains biographical information and publication history
- **Books**
  - Many-to-One with Authors (each book has one author)
  - Many-to-Many with Categories (books can belong to multiple genres/categories)
  - One-to-Many with Reviews (books can have multiple user reviews)
- **Categories**
  - Many-to-Many with Books (categories can contain multiple books)
  - Hierarchical relationship possibilities (subcategories)
- **Users & Profiles**
  - One-to-One relationship between User and Profile
  - One-to-Many with Reviews (users can write multiple reviews)
  - Authentication and authorization capabilities

## Step-by-Step Repository Pattern Implementation

The repository pattern provides a clean separation between your domain model and data access logic. Here's how we implement it with TypeORM in NestJS:

### 1. Define Entity Classes

First, define your entity classes with TypeORM decorators:

```typescript
// src/books/entities/book.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { Author } from '../../authors/entities/author.entity';
import { Category } from '../../categories/entities/category.entity';
import { BookReview } from '../../book-reviews/entities/book-review.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  publicationYear: number;

  // Many-to-One: Many books can be written by one author
  @ManyToOne(() => Author, author => author.books)
  author: Author;

  // Many-to-Many: Books can have multiple categories
  @ManyToMany(() => Category, category => category.books)
  @JoinTable()
  categories: Category[];

  // One-to-Many: Books can have multiple reviews
  @OneToMany(() => BookReview, review => review.book)
  reviews: BookReview[];
}
```

### 2. Create Repository Interfaces

Define interfaces for your repositories to enforce consistent methods:

```typescript
// src/books/interfaces/book-repository.interface.ts
import { Book } from '../entities/book.entity';
import { CreateBookDto } from '../dto/create-book.dto';

export interface IBookRepository {
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book>;
  findByAuthor(authorId: number): Promise<Book[]>;
  findWithCategories(categoryIds: number[]): Promise<Book[]>;
  create(createBookDto: CreateBookDto): Promise<Book>;
  update(id: number, updateBookDto: any): Promise<Book>;
  delete(id: number): Promise<void>;
}
```

### 3. Implement TypeORM Repository

Implement the repository using TypeORM's Repository, EntityManager, and QueryBuilder:

```typescript
// src/books/repositories/book.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { Book } from '../entities/book.entity';
import { CreateBookDto } from '../dto/create-book.dto';
import { IBookRepository } from '../interfaces/book-repository.interface';
import { Author } from '../../authors/entities/author.entity';
import { Category } from '../../categories/entities/category.entity';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private entityManager: EntityManager,
  ) {}

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({
      relations: ['author', 'categories'],
    });
  }

  async findById(id: number): Promise<Book> {
    return this.bookRepository.findOne({ 
      where: { id },
      relations: ['author', 'categories', 'reviews', 'reviews.user'],
    });
  }

  async findByAuthor(authorId: number): Promise<Book[]> {
    // Using QueryBuilder for more complex queries
    return this.bookRepository
      .createQueryBuilder('book')
      .innerJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.categories', 'category')
      .where('author.id = :authorId', { authorId })
      .getMany();
  }

  async findWithCategories(categoryIds: number[]): Promise<Book[]> {
    // Using QueryBuilder with advanced joins and filtering
    return this.bookRepository
      .createQueryBuilder('book')
      .innerJoinAndSelect('book.author', 'author')
      .innerJoinAndSelect('book.categories', 'category')
      .where('category.id IN (:...ids)', { ids: categoryIds })
      .getMany();
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Using EntityManager for transactions
    return this.entityManager.transaction(async manager => {
      const book = new Book();
      book.title = createBookDto.title;
      book.description = createBookDto.description;
      book.publicationYear = createBookDto.publicationYear;
      
      // Fetch related entities
      book.author = await manager.findOne(Author, { 
        where: { id: createBookDto.authorId } 
      });
      
      if (createBookDto.categoryIds && createBookDto.categoryIds.length > 0) {
        book.categories = await manager.find(Category, {
          where: { id: In(createBookDto.categoryIds) }
        });
      }
      
      return manager.save(book);
    });
  }

  async update(id: number, updateBookDto: any): Promise<Book> {
    await this.bookRepository.update(id, {
      title: updateBookDto.title,
      description: updateBookDto.description,
      publicationYear: updateBookDto.publicationYear,
    });

    const book = await this.findById(id);

    // Handle relations updates if needed
    if (updateBookDto.categoryIds) {
      // Using query builder for relation updates
      const categories = await this.entityManager.find(Category, {
        where: { id: In(updateBookDto.categoryIds) }
      });
      book.categories = categories;
      await this.bookRepository.save(book);
    }

    return book;
  }

  async delete(id: number): Promise<void> {
    await this.bookRepository.delete(id);
  }
}
```

### 4. Create Service Layer

Create a service layer that uses the repository:

```typescript
// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { BookRepository } from './repositories/book.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(private bookRepository: BookRepository) {}

  async findAll(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    return this.bookRepository.create(createBookDto);
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    return this.bookRepository.update(id, updateBookDto);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.delete(id);
  }

  async findByAuthor(authorId: number): Promise<Book[]> {
    return this.bookRepository.findByAuthor(authorId);
  }

  async findByCategories(categoryIds: number[]): Promise<Book[]> {
    return this.bookRepository.findWithCategories(categoryIds);
  }
}
```

### 5. Register in Module

Register your repositories and services in the module:

```typescript
// src/books/books.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookRepository } from './repositories/book.repository';
import { Book } from './entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Author, Category]),
  ],
  controllers: [BooksController],
  providers: [
    BooksService,
    BookRepository,
  ],
  exports: [BooksService],
})
export class BooksModule {}
```

## Advanced TypeORM Features Used in the Project

### EntityManager for Transactions

The EntityManager is used for transaction management ensuring data consistency:

```typescript
// Transaction example in book.repository.ts
async createWithReviews(bookData, reviewsData): Promise<Book> {
  return this.entityManager.transaction(async manager => {
    // Create the book first
    const book = manager.create(Book, bookData);
    await manager.save(book);
    
    // Then create associated reviews
    const reviews = reviewsData.map(reviewData => {
      const review = manager.create(BookReview, {
        ...reviewData,
        book: book
      });
      return review;
    });
    
    await manager.save(reviews);
    return book;
  });
}
```

### QueryBuilder for Complex Queries

QueryBuilder enables more complex and optimized database queries:

```typescript
// Advanced filtering example from book.repository.ts
async findBooksWithFilters(filters: {
  title?: string;
  authorId?: number;
  categoryIds?: number[];
  yearStart?: number;
  yearEnd?: number;
  minRating?: number;
}): Promise<Book[]> {
  const query = this.bookRepository
    .createQueryBuilder('book')
    .leftJoinAndSelect('book.author', 'author')
    .leftJoinAndSelect('book.categories', 'category')
    .leftJoinAndSelect('book.reviews', 'review');
  
  if (filters.title) {
    query.andWhere('book.title ILIKE :title', { title: `%${filters.title}%` });
  }
  
  if (filters.authorId) {
    query.andWhere('author.id = :authorId', { authorId: filters.authorId });
  }
  
  if (filters.categoryIds?.length) {
    query.andWhere('category.id IN (:...categoryIds)', { categoryIds: filters.categoryIds });
  }
  
  if (filters.yearStart) {
    query.andWhere('book.publicationYear >= :yearStart', { yearStart: filters.yearStart });
  }
  
  if (filters.yearEnd) {
    query.andWhere('book.publicationYear <= :yearEnd', { yearEnd: filters.yearEnd });
  }
  
  if (filters.minRating) {
    query.andWhere('review.rating >= :minRating', { minRating: filters.minRating });
  }
  
  return query.getMany();
}
```

### Relationship Loading Strategies

Different strategies for loading entity relationships:

```typescript
// Eager loading (when you need all relations)
async findBookWithAllDetails(id: number): Promise<Book> {
  return this.bookRepository.findOne({
    where: { id },
    relations: ['author', 'categories', 'reviews', 'reviews.user'],
  });
}

// Lazy loading (more efficient for large datasets)
async findBooksWithLazyLoading(): Promise<Book[]> {
  const books = await this.bookRepository.find();
  
  // Later, load relationships only when needed
  for (const book of books) {
    await this.bookRepository
      .createQueryBuilder()
      .relation(Book, "categories")
      .of(book)
      .loadMany();
  }
  
  return books;
}

// Join loading with specific columns
async findBooksWithLimitedData(): Promise<any[]> {
  return this.bookRepository
    .createQueryBuilder('book')
    .select(['book.id', 'book.title', 'author.name'])
    .innerJoin('book.author', 'author')
    .getMany();
}
```

### Custom Repository Methods

Implementation of specialized queries for specific business needs:

```typescript
// Custom repository method from book-review.repository.ts
async findTopRatedBooks(limit: number = 10): Promise<any[]> {
  return this.entityManager
    .createQueryBuilder(BookReview, 'review')
    .select('book.id', 'id')
    .addSelect('book.title', 'title')
    .addSelect('AVG(review.rating)', 'averageRating')
    .addSelect('COUNT(review.id)', 'reviewCount')
    .innerJoin('review.book', 'book')
    .groupBy('book.id')
    .orderBy('averageRating', 'DESC')
    .addOrderBy('reviewCount', 'DESC')
    .limit(limit)
    .getRawMany();
}
```

## Best Practices for Repository Pattern with TypeORM

1. **Separation of Concerns**: Keep repositories focused on data access, with business logic in services
2. **Interface-First Design**: Define repository interfaces before implementation for better testability
3. **Transaction Management**: Use EntityManager transactions for operations that modify multiple entities
4. **Query Optimization**: Use QueryBuilder for complex queries and optimize with proper join strategies
5. **Avoid N+1 Problem**: Load relationships efficiently using appropriate loading strategies
6. **Repository Composition**: Break down large repositories into smaller, focused ones
7. **Error Handling**: Implement consistent error handling in repositories
8. **Testing**: Create mock repositories for unit testing services

## Project Structure

```
src/
├── authors/
│   ├── controllers/
│   ├── dto/
│   ├── entities/
│   ├── interfaces/
│   ├── repositories/
│   └── services/
├── books/
│   ├── controllers/
│   ├── dto/
│   ├── entities/
│   ├── interfaces/
│   ├── repositories/
│   └── services/
├── categories/
│   └── ...
├── users/
│   └── ...
├── profiles/
│   └── ...
├── book-reviews/
│   └── ...
└── seed/
    ├── seed.controller.ts
    ├── seed.module.ts
    └── seed.service.ts
```

## Database Configuration

The project uses TypeORM with MySQL. Here's the database configuration from `app.module.ts`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BooksModule,
    AuthorsModule,
    CategoriesModule,
    ProfilesModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('MYSQL_HOST') || 'localhost',
        port: configService.getOrThrow<number>('MYSQL_PORT') || 3306,
        username: configService.getOrThrow<string>('MYSQL_USER'),
        password: configService.getOrThrow<string>('MYSQL_PASSWORD'),
        database: configService.getOrThrow<string>('MYSQL_DATABASE'),
        entities: [Book, Author, Category, Profile, User, BookReview],
        synchronize:
          configService.getOrThrow<string>('NODE_ENV') !== 'production', // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
        logging: configService.getOrThrow<string>('NODE_ENV') !== 'production'
      }),
    }),
    TypeOrmModule.forFeature([
      Book,
      Author,
      Category,
      Profile,
      User,
      BookReview,
    ]),
    BookReviewsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

### Environment Variables Required

Create a `.env` file in the root directory with these variables:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
NODE_ENV=development
```

Note: Make sure to set `NODE_ENV=production` in production environments to disable automatic schema synchronization and SQL logging.

This project serves as an excellent reference implementation for NestJS applications using TypeORM with the Repository Pattern, showcasing clean architecture and best practices for complex data relationships.
