import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookReviewDto {
  @ApiProperty({ description: 'Review content', example: 'This book is awesome!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Review rating', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({description: 'Book ID', example: 'f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b'})
  @IsUUID()
  bookId: string;

  @ApiProperty({description: 'Reviewer ID', example: 'f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b'})
  @IsUUID()
  reviewerId: string;
}
