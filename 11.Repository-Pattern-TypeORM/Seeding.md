# Seeding Databases with TypeORM, Nest.js and Faker.js

![How to Seed Database with TypeORM, Nest.js and PostgreSQL](https://thriveread.com/how-to-seed-database-with-typeorm/hero.png)

TypeORM uses database Seeding to populate your tables with initial data during development. Seeding will create and insert records into the database tables directly while using code within your app.

Dive into this step-by-step guide and learn seeding a database using TypeORM in Nest.js. You will learn:

* How to create a dedicated seeder module in your Nest.js application
* Using TypeORM to seed the database with Faker.js generated data
* How to seed TypeORM relationships (OneToMany, ManyToOne, etc.)
* Implementing proper seeding patterns that work across different database providers

### Why Seed a Database with TypeORM?

* During development, you need sample data mimicking how your app works.
* Testing phase to write tests against a consistent dataset.
* Initial state setup to ensure the database starts with the required data

### When should you use Database Seeding?

Make sure you run the TypeORM database seeding:

* On application bootstrap for development environments
* Before running tests, to ensure consistent test results
* When setting up a new environment for the first time

### Setting Up a Dedicated Seeder Module

Instead of mixing seeding logic with your service classes, let's create a dedicated module for seeding. This keeps our application structure clean and modular.

First, create a seeder module:

```bash
nest g module seed
nest g service seed
nest g controller seed
```

Then structure your seeder module to handle various entity seeding operations:

```TypeScript
// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { BookReview } from '../book-reviews/entities/book-review.entity';
import { Category } from '../categories/entities/category.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Book,
      Author,
      BookReview,
      Category,
      Profile
    ]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule { }
```

### Creating a Comprehensive Seed Service

Here we'll create a seed service with methods for each entity type. Let's start with the basic structure:

```TypeScript
// src/seed/seed.service.ts (basic structure)
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { BookReview } from '../book-reviews/entities/book-review.entity';
import { Category } from '../categories/entities/category.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { fakerEN as faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        @InjectRepository(Author)
        private readonly authorRepository: Repository<Author>,
        @InjectRepository(BookReview)
        private readonly bookReviewRepository: Repository<BookReview>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) { }

    // We'll add individual seeding methods here
}
```

### The Main Seeding Method

Let's first look at the main method that orchestrates the entire seeding process:

```TypeScript
// seedAll() method
async seedAll(): Promise<void> {
    await this.seedUsers();           // Independent entity
    await this.seedProfiles();        // Depends on users
    await this.seedAuthors();         // Independent entity
    await this.seedCategories();      // Independent entity
    await this.seedBooks();           // Depends on authors and categories
    await this.seedBookReviews();     // Depends on books and users
    this.logger.log('All data seeded successfully');
}
```

This method calls all other seeding methods in the correct order, ensuring that parent entities are seeded before their dependent entities. The sequence is crucial:

1. First, we seed independent entities (users, authors, categories) that don't depend on other entities
2. Then we seed profiles which depend on users
3. Next, we seed books which depend on authors and categories
4. Finally, we seed book reviews which depend on both books and users

### Seeding Independent Entities

#### 1. Seeding Users

```TypeScript
// seedUsers() method
async seedUsers(): Promise<void> {
    try {
        const users: User[] = [];
        const userCount = 10;

        for (let i = 0; i < userCount; i++) {
            const user = new User();
            user.name = faker.person.fullName();
            user.email = faker.internet.email();
            user.password = faker.internet.password();
            users.push(user);
        }

        await this.userRepository.save(users);
        this.logger.log(`${userCount} users seeded successfully`);
    } catch (error) {
        this.logger.error(`Error seeding users: ${error.message}`, error.stack);
        throw error;
    }
}
```

**Explanation**:

- We create an array of 10 user objects
- For each user, we generate random data using Faker.js:
  - Full name with `faker.person.fullName()`
  - Email with `faker.internet.email()`
  - Password with `faker.internet.password()`
- We use TypeORM's repository pattern to save all users in a single database operation
- Error handling captures any failures with descriptive error messages

#### 2. Seeding Authors

```TypeScript
// seedAuthors() method
async seedAuthors(): Promise<void> {
    try {
        const authors: Author[] = [];
        const authorCount = 15;

        for (let i = 0; i < authorCount; i++) {
            const author = new Author();
            author.name = faker.person.fullName();
            author.bio = faker.lorem.paragraph();
            author.birthDate = faker.date.past({ years: 100 });
            authors.push(author);
        }

        await this.authorRepository.save(authors);
        this.logger.log(`${authorCount} authors seeded successfully`);
    } catch (error) {
        this.logger.error(`Error seeding authors: ${error.message}`, error.stack);
        throw error;
    }
}
```

**Explanation**:

- Similar to users, we create 15 author objects
- We generate random author data:
  - Name with `faker.person.fullName()`
  - Biography with `faker.lorem.paragraph()`
  - Birth date with `faker.date.past()`, going back up to 100 years
- The try-catch pattern provides robust error handling for the seeding operation

#### 3. Seeding Categories

```TypeScript
// seedCategories() method
async seedCategories(): Promise<void> {
    try {
        const categories: Category[] = [];
        const categoryNames = [
            'Fiction',
            'Non-Fiction',
            'Science Fiction',
            'Fantasy',
            'Mystery',
            'Romance',
            'Thriller',
            'Horror',
            'Biography',
            'History',
            'Self-Help',
            'Business',
            'Children',
            'Young Adult',
            'Poetry',
        ];

        for (const name of categoryNames) {
            const category = new Category();
            category.name = name;
            category.description = faker.lorem.sentence();
            categories.push(category);
        }

        await this.categoryRepository.save(categories);
        this.logger.log(`${categories.length} categories seeded successfully`);
    } catch (error) {
        this.logger.error(
            `Error seeding categories: ${error.message}`,
            error.stack,
        );
        throw error;
    }
}
```

**Explanation**:

- Unlike other entities, we use a predefined list of category names rather than random generation
- This is a common practice for reference/lookup data that should be consistent
- Each category gets a randomly generated description
- This approach ensures predictable category values while still having some randomized content

### Seeding Dependent Entities

#### 4. Seeding Profiles (depends on Users)

```TypeScript
// seedProfiles() method
async seedProfiles(): Promise<void> {
    try {
        const users = await this.userRepository.find();
        if (users.length === 0) {
            throw new Error('No users found. Seed users first.');
        }

        const profiles: Profile[] = [];

        for (const user of users) {
            const profile = new Profile();
            profile.bio = faker.lorem.paragraph();
            profile.dateOfBirth = faker.date.past({ years: 50 });
            profile.location = `${faker.location.city()}, ${faker.location.country()}`;
            profile.user = user;  // Set up the one-to-one relationship
            profiles.push(profile);
        }

        await this.profileRepository.save(profiles);
        this.logger.log(`${profiles.length} profiles seeded successfully`);
    } catch (error) {
        this.logger.error(`Error seeding profiles: ${error.message}`, error.stack);
        throw error;
    }
}
```

**Explanation**:

- This method demonstrates seeding a **one-to-one relationship** between User and Profile
- It first checks if users exist, which is critical for maintaining referential integrity
- For each user, we create a matching profile with:
  - Biography using `faker.lorem.paragraph()`
  - Birth date using `faker.date.past()`
  - Location by combining city and country from Faker
- We directly assign the user entity to the profile to establish the relationship
- This showcases the TypeORM approach to handling entity relationships during seeding

#### 5. Seeding Books (depends on Authors and Categories)

```TypeScript
// seedBooks() method
async seedBooks(): Promise<void> {
    try {
        // Get all authors to relate books to authors
        const authors = await this.authorRepository.find();
        if (authors.length === 0) {
            throw new Error('No authors found. Seed authors first.');
        }

        // Get categories to assign to books
        const categories = await this.categoryRepository.find();
        if (categories.length === 0) {
            throw new Error('No categories found. Seed categories first.');
        }

        const books: Book[] = [];
        const bookCount = 30;

        for (let i = 0; i < bookCount; i++) {
            const book = new Book();
            book.title = faker.lorem.words({ min: 2, max: 5 });
            book.description = faker.lorem.paragraph();
            book.publicationYear = faker.number.int({ min: 1900, max: 2023 });
            // Assign a random author (ManyToOne relationship)
            book.author = authors[Math.floor(Math.random() * authors.length)];

            // Assign 1-3 random categories (ManyToMany relationship)
            const numCategories = faker.number.int({ min: 1, max: 3 });
            const bookCategories: Category[] = [];
            for (let j = 0; j < numCategories; j++) {
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                if (!bookCategories.includes(randomCategory)) {
                    bookCategories.push(randomCategory);
                }
            }
            book.categories = bookCategories;

            books.push(book);
        }

        await this.bookRepository.save(books);
        this.logger.log(`${bookCount} books seeded successfully`);
    } catch (error) {
        this.logger.error(`Error seeding books: ${error.message}`, error.stack);
        throw error;
    }
}
```

**Explanation**:

- This method demonstrates seeding two different types of relationships:
  - A **ManyToOne relationship** between Book and Author (each book has one author)
  - A **ManyToMany relationship** between Book and Category (each book can have multiple categories)
- We first verify that both authors and categories exist
- For each book, we:
  - Generate random title, description, and publication year
  - Assign a random author from the available authors
  - Assign 1-3 random categories, ensuring no duplicates
- This is a great example of how TypeORM can handle complex entity relationships during seeding

#### 6. Seeding Book Reviews (depends on Books and Users)

```TypeScript
// seedBookReviews() method
async seedBookReviews(): Promise<void> {
    try {
        const books = await this.bookRepository.find();
        if (books.length === 0) {
            throw new Error('No books found. Seed books first.');
        }

        const users = await this.userRepository.find();
        if (users.length === 0) {
            throw new Error('No users found. Seed users first.');
        }

        const bookReviews: BookReview[] = [];
        const reviewCount = 50;

        for (let i = 0; i < reviewCount; i++) {
            const review = new BookReview();
            review.content = faker.lorem.paragraph();
            review.rating = faker.number.int({ min: 1, max: 5 });
            review.book = books[Math.floor(Math.random() * books.length)];
            review.user = users[Math.floor(Math.random() * users.length)];
            bookReviews.push(review);
        }

        await this.bookReviewRepository.save(bookReviews);
        this.logger.log(`${reviewCount} book reviews seeded successfully`);
    } catch (error) {
        this.logger.error(
            `Error seeding book reviews: ${error.message}`,
            error.stack,
        );
        throw error;
    }
}
```

**Explanation**:

- This method showcases seeding an entity with multiple dependencies (both Book and User)
- We first ensure that both prerequisite entities exist
- For each review, we:
  - Generate random content and a rating between 1-5
  - Assign a random book from the available books
  - Assign a random user as the reviewer
- This demonstrates the pattern for seeding entities that have multiple foreign key relationships

### Database Cleanup

For a complete seeder implementation, you'll want a method to clear existing data:

```TypeScript
// clearDatabase() method
async clearDatabase(): Promise<void> {
    try {
        await this.bookReviewRepository.delete({});
        await this.bookRepository.delete({});
        await this.categoryRepository.delete({});
        await this.authorRepository.delete({});
        await this.profileRepository.delete({});
        await this.userRepository.delete({});
        this.logger.log('Database cleared successfully');
    } catch (error) {
        this.logger.error(
            `Error clearing database: ${error.message}`,
            error.stack,
        );
        throw error;
    }
}
```

**Explanation**:

- This method deletes all records from each entity table
- The order of deletion is crucial - we must delete child records before parent records to maintain referential integrity:
  1. First, delete BookReviews (depends on Books and Users)
  2. Then delete Books (depends on Authors and Categories)
  3. Then delete Categories (independent)
  4. Then delete Authors (independent)
  5. Then delete Profiles (depends on Users)
  6. Finally, delete Users (independent)
- This prevents foreign key constraint errors during the deletion process

### Creating a Seeder Controller

For easy access to seeding operations, create a controller with endpoints:

```TypeScript
// src/seed/seed.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @Get('all')
  async seedAll() {
    await this.seedService.seedAll();
    return { message: 'All data seeded successfully' };
  }

  @Get('users')
  async seedUsers() {
    await this.seedService.seedUsers();
    return { message: 'Users seeded successfully' };
  }

  @Get('authors')
  async seedAuthors() {
    await this.seedService.seedAuthors();
    return { message: 'Authors seeded successfully' };
  }

  @Get('books')
  async seedBooks() {
    await this.seedService.seedBooks();
    return { message: 'Books seeded successfully' };
  }

  @Get('profiles')
  async seedProfiles() {
    await this.seedService.seedProfiles();
    return { message: 'Profiles seeded successfully' };
  }

  @Get('categories')
  async seedCategories() {
    await this.seedService.seedCategories();
    return { message: 'Categories seeded successfully' };
  }

  @Get('book-reviews')
  async seedBookReviews() {
    await this.seedService.seedBookReviews();
    return { message: 'Book reviews seeded successfully' };
  }

  @Post('clear')
  async clearDatabase() {
    await this.seedService.clearDatabase();
    return { message: 'Database cleared successfully' };
  }
}
```

**Explanation**:

- We create a dedicated controller for seeding operations
- Each seeder method gets its own endpoint for granular control
- The HTTP methods are chosen appropriately:
  - `GET` for read-only operations (seeding adds data but doesn't modify existing data)
  - `POST` for the clear operation which modifies existing data
- This approach provides a convenient way to trigger seeders for development and testing

### Best Practices for TypeORM Seeding

1. **Order Matters**: Always seed parent entities before child entities

   ```TypeScript
   async seedAll(): Promise<void> {
       await this.seedUsers();           // Independent entity
       await this.seedAuthors();         // Independent entity
       await this.seedCategories();      // Independent entity
       await this.seedProfiles();        // Depends on users
       await this.seedBooks();           // Depends on authors and categories
       await this.seedBookReviews();     // Depends on books and users
   }
   ```
2. **Validation First**: Always check for prerequisites before seeding dependent entities

   ```TypeScript
   // Check for existence of users before seeding profiles
   const users = await this.userRepository.find();
   if (users.length === 0) {
       throw new Error('No users found. Seed users first.');
   }
   ```
3. **Error Handling**: Wrap seeding operations in try-catch blocks for proper error reporting

   ```TypeScript
   try {
       // Seeding operations
   } catch (error) {
       this.logger.error(`Error seeding: ${error.message}`, error.stack);
       throw error;
   }
   ```
4. **Bulk Operations**: Use array-based bulk inserts for better performance

   ```TypeScript
   // Create an array of entities first
   const users: User[] = [];
   // ... populate the array
   // Then save all at once for performance
   await this.userRepository.save(users);
   ```
5. **Idempotent Operations**: Check if data exists before seeding to avoid duplicates

   ```TypeScript
   // Check if data already exists
   const userCount = await this.userRepository.count();
   if (userCount > 0) {
       this.logger.log('Users already exist, skipping seed');
       return;
   }
   ```
6. **Relationship Handling**: Pay special attention to how TypeORM handles relationships

   ```TypeScript
   // One-to-one relationship example
   profile.user = user;

   // Many-to-one relationship example
   book.author = randomAuthor;

   // Many-to-many relationship example
   book.categories = selectedCategories;
   ```

### Using the Seed API

With our seed controller, we can use these endpoints:

- `GET /seed/all` - Seeds all entities
- `GET /seed/users` - Seeds only users
- `GET /seed/authors` - Seeds only authors
- `GET /seed/books` - Seeds only books
- `GET /seed/profiles` - Seeds only profiles
- `GET /seed/categories` - Seeds only categories
- `GET /seed/book-reviews` - Seeds only book reviews
- `POST /seed/clear` - Clears all data from the database

### Conclusion

Using this approach to seed your database with TypeORM and Nest.js provides a clean, maintainable pattern that separates concerns and allows flexible seeding strategies. The dedicated seeder module pattern makes it easy to expand your seeding logic as your application grows.

With properly structured seeders, you can:

- Generate consistent test data
- Quickly populate your development database
- Handle complex entity relationships
- Clear and repopulate your database as needed

This modular approach to database seeding gives you the flexibility to seed specific entities as needed or the entire database at once, making your development workflow more efficient.
