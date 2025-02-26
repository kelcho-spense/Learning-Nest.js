import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';

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
    ) { }

    async seedAll(): Promise<void> {
        await this.seedUsers();
        await this.seedAuthors();
        await this.seedBooks();
        this.logger.log('All data seeded successfully');
    }

    async seedUsers(): Promise<void> {
        try {
            const users:User[] = [];
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

    async seedAuthors(): Promise<void> {
        try {
            const authors:Author[] = [];
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

    async seedBooks(): Promise<void> {
        try {
            // Get all authors to relate books to authors
            const authors = await this.authorRepository.find();
            if (authors.length === 0) {
                throw new Error('No authors found. Seed authors first.');
            }

            const books:Book[] = [];
            const bookCount = 30;

            for (let i = 0; i < bookCount; i++) {
                const book = new Book();
                book.title = faker.lorem.words({ min: 2, max: 5 });
                book.description = faker.lorem.paragraph();
                book.publicationYear = faker.number.int({ min: 1900, max: 2023 });
                // Assign a random author
                book.author = authors[Math.floor(Math.random() * authors.length)];
                books.push(book);
            }

            await this.bookRepository.save(books);
            this.logger.log(`${bookCount} books seeded successfully`);
        } catch (error) {
            this.logger.error(`Error seeding books: ${error.message}`, error.stack);
            throw error;
        }
    }

    async clearDatabase(): Promise<void> {
        try {
            await this.bookRepository.delete({});
            await this.authorRepository.delete({});
            await this.userRepository.delete({});
            this.logger.log('Database cleared successfully');
        } catch (error) {
            this.logger.error(`Error clearing database: ${error.message}`, error.stack);
            throw error;
        }
    }
}
