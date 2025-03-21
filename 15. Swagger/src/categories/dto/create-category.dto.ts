import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCategoryDto {
  @ApiProperty({description: 'Category name', example: 'Horror'})
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({description: 'Category description', example: 'Scary books'})
  @IsOptional()
  @IsString()
  description?: string;
}
