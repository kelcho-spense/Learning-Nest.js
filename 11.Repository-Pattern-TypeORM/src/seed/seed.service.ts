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

    async seedAll(): Promise<void> {
        await this.seedUsers();
        await this.seedProfiles();
        await this.seedAuthors();
        await this.seedCategories();
        await this.seedBooks();
        await this.seedBookReviews();
        this.logger.log('All data seeded successfully');
    }

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
                profile.user = user;
                profiles.push(profile);
            }

            await this.profileRepository.save(profiles);
            this.logger.log(`${profiles.length} profiles seeded successfully`);
        } catch (error) {
            this.logger.error(`Error seeding profiles: ${error.message}`, error.stack);
            throw error;
        }
    }

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
                // Assign a random author
                book.author = authors[Math.floor(Math.random() * authors.length)];

                // Assign 1-3 random categories
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
}
