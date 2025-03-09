import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthorsService } from '../authors/authors.service';
import { CategoriesService } from '../categories/categories.service';
import { BookReview } from '../book-reviews/entities/book-review.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    private authorsService: AuthorsService,
    private categoriesService: CategoriesService,
    private dataSource: DataSource,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = new Book();
    book.title = createBookDto.title;
    book.description = createBookDto.description;
    book.publicationYear = createBookDto.publicationYear;
    book.isAvailable = createBookDto.isAvailable ?? true;

    // Set author
    const author = await this.authorsService.findOne(createBookDto.authorId);
    book.author = author;

    // Set categories if provided
    if (createBookDto.categoryIds && createBookDto.categoryIds.length > 0) {
      book.categories = await Promise.all(
        createBookDto.categoryIds.map((id) =>
          this.categoriesService.findOne(id),
        ),
      );
    }

    return this.booksRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.booksRepository.find({
      relations: ['author', 'categories'],
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['author', 'categories'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (updateBookDto.title) book.title = updateBookDto.title;
    if (updateBookDto.description !== undefined)
      book.description = updateBookDto.description;
    if (updateBookDto.publicationYear)
      book.publicationYear = updateBookDto.publicationYear;
    if (updateBookDto.isAvailable !== undefined)
      book.isAvailable = updateBookDto.isAvailable;

    // Update author if provided
    if (updateBookDto.authorId) {
      book.author = await this.authorsService.findOne(updateBookDto.authorId);
    }

    // Update categories if provided
    if (updateBookDto.categoryIds) {
      book.categories = await Promise.all(
        updateBookDto.categoryIds.map((id) =>
          this.categoriesService.findOne(id),
        ),
      );
    }

    return this.booksRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the book with all its relationships
      const book = await this.booksRepository.findOne({
        where: { id },
        relations: ['reviews', 'categories'],
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      // Explicitly delete reviews first if any exist
      if (book.reviews && book.reviews.length > 0) {
        const reviewRepository = this.dataSource.getRepository(BookReview);
        for (const review of book.reviews) {
          await reviewRepository.remove(review);
        }
      }

      // Clear ManyToMany relationships
      if (book.categories && book.categories.length > 0) {
        book.categories = [];
        await queryRunner.manager.save(book);
      }

      // Finally delete the book itself
      await queryRunner.manager.remove(book);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
