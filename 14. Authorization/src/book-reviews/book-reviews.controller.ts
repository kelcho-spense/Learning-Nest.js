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
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { CreateBookReviewPolicyHandler,DeleteBookReviewPolicyHandler,ReadBookReviewPolicyHandler,UpdateBookReviewPolicyHandler } from 'src/casl/policies/book-review.policies';

@Controller('book-reviews')
export class BookReviewsController {
  constructor(private readonly bookReviewsService: BookReviewsService) {}

  @Post()
  @CheckPolicies(new CreateBookReviewPolicyHandler())
  create(@Body() createBookReviewDto: CreateBookReviewDto) {
    return this.bookReviewsService.create(createBookReviewDto);
  }

  @Get()
  @CheckPolicies(new ReadBookReviewPolicyHandler())
  findAll() {
    return this.bookReviewsService.findAll();
  }

  @Get(':id')
  @CheckPolicies(new ReadBookReviewPolicyHandler())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookReviewsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies(new UpdateBookReviewPolicyHandler())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookReviewDto: UpdateBookReviewDto,
  ) {
    return this.bookReviewsService.update(id, updateBookReviewDto);
  }

  @Delete(':id')
  @CheckPolicies(new DeleteBookReviewPolicyHandler())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookReviewsService.remove(id);
  }
}
