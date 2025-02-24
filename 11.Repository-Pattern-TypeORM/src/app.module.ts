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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BooksModule,
    AuthorsModule,
    CategoriesModule,
    ProfilesModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.getOrThrow<string>('DATABASE') || 'db.sqlite',
        entities: [Book, Author, Category, Profile],
        synchronize: configService.getOrThrow<string>('NODE_ENV') !== 'production', // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
      }),
    }),
    TypeOrmModule.forFeature([Book, Author, Category, Profile]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
