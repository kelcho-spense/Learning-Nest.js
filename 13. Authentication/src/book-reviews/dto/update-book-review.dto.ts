import { PartialType } from '@nestjs/mapped-types';
import { CreateBookReviewDto } from './create-book-review.dto';

export class UpdateBookReviewDto extends PartialType(CreateBookReviewDto) {}
