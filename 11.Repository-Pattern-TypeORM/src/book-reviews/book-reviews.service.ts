import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookReviewDto } from './dto/create-book-review.dto';
import { UpdateBookReviewDto } from './dto/update-book-review.dto';
import { BookReview } from './entities/book-review.entity';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookReviewsService {
  constructor(
    @InjectRepository(BookReview)
    private bookReviewRepository: Repository<BookReview>,
    private booksService: BooksService,
    private usersService: UsersService,
  ) {}

  async create(createBookReviewDto: CreateBookReviewDto): Promise<BookReview> {
    const { bookId, reviewerId, ...reviewData } = createBookReviewDto;
    
    // Get the book and user entities
    const book = await this.booksService.findOne(bookId);
    const user = await this.usersService.findOne(reviewerId);

    // Create a new book review
    const newReview = this.bookReviewRepository.create({
      ...reviewData,
      book,
      user,
    });

    // Save the review to the database
    return this.bookReviewRepository.save(newReview);
  }

  async findAll(): Promise<BookReview[]> {
    return this.bookReviewRepository.find({
      relations: ['book', 'reviewer'],
    });
  }

  async findOne(id: string): Promise<BookReview> {
    const review = await this.bookReviewRepository.findOne({
      where: { id },
      relations: ['book', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException(`Book review with ID "${id}" not found`);
    }

    return review;
  }

  async update(id: string, updateBookReviewDto: UpdateBookReviewDto): Promise<BookReview> {
    // First check if the review exists
    await this.findOne(id);
    
    const { bookId, reviewerId, ...reviewData } = updateBookReviewDto;
    
    // Create an object to store updated relations
    const updateData: any = { ...reviewData };
    
    // Update book relation if bookId is provided
    if (bookId) {
      const book = await this.booksService.findOne(bookId);
      updateData.book = book;
    }
    
    // Update reviewer relation if reviewerId is provided
    if (reviewerId) {
      const user = await this.usersService.findOne(reviewerId);
      updateData.user = user;
    }
    
    // Update the review
    await this.bookReviewRepository.update(id, updateData);
    
    // Return the updated review
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookReviewRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Book review with ID "${id}" not found`);
    }
  }
}
