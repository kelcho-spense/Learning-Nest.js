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
