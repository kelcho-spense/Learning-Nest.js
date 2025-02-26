import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookReviewsService } from './book-reviews.service';
import { BookReviewsController } from './book-reviews.controller';
import { BookReview } from './entities/book-review.entity';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookReview]),
    BooksModule,
    UsersModule
  ],
  controllers: [BookReviewsController],
  providers: [BookReviewsService],
  exports: [BookReviewsService]
})
export class BookReviewsModule { }
