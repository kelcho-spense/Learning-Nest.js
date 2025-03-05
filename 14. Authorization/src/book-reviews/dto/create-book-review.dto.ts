import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateBookReviewDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsUUID()
  bookId: string;

  @IsUUID()
  reviewerId: string;
}
