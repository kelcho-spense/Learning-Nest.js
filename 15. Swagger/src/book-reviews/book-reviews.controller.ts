import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookReviewsService } from './book-reviews.service';
import { CreateBookReviewDto } from './dto/create-book-review.dto';
import { UpdateBookReviewDto } from './dto/update-book-review.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('book-reviews')
export class BookReviewsController {
  constructor(private readonly bookReviewsService: BookReviewsService) {}

  @Post()
  create(@Body() createBookReviewDto: CreateBookReviewDto) {
    return this.bookReviewsService.create(createBookReviewDto);
  }

  @Get()
  findAll() {
    return this.bookReviewsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'book review id  (uuid)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookReviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String, description: 'book review id  (uuid)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookReviewDto: UpdateBookReviewDto,
  ) {
    return this.bookReviewsService.update(id, updateBookReviewDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String, description: 'book review id  (uuid)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookReviewsService.remove(id);
  }
}
