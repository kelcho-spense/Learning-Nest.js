import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { CategoriesModule } from './categories/categories.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './books/entities/book.entity';
import { Author } from './authors/entities/author.entity';
import { Category } from './categories/entities/category.entity';
import { Profile } from './profiles/entities/profile.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { BookReviewsModule } from './book-reviews/book-reviews.module';
import { BookReview } from './book-reviews/entities/book-review.entity';
import { SeedModule } from './seed/seed.module';

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
export class AppModule { }
