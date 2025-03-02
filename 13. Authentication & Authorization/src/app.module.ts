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
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
        // logging: configService.getOrThrow<string>('NODE_ENV') !== 'production'
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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ttl: 10000, // 10 seconds
          stores: [
            // First store - in-memory cache
            // new Keyv({
            //   store: new CacheableMemory({ ttl: 10000, lruSize: 5000 }),
            // }),
            // Second store - Redis cache (fixed approach)
            createKeyv(
              configService.get<string>('REDIS_URL') ||
                'redis://localhost:6379',
            ),
          ],
        };
      },
    }),
    BooksModule,
    AuthorsModule,
    CategoriesModule,
    ProfilesModule,
    UsersModule,
    BookReviewsModule,
    SeedModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
