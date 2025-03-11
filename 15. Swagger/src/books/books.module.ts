import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { AuthorsModule } from 'src/authors/authors.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), AuthorsModule, CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService, CaslAbilityFactory],
  exports: [BooksService],
})
export class BooksModule {}
