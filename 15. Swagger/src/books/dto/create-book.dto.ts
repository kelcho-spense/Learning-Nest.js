import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OneToMany } from 'typeorm';
import { Author } from 'src/authors/entities/author.entity';

export class CreateBookDto {
  @ApiProperty({ description: 'Book title',example: 'My life in crime' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Book description',example: 'Story about a reformed criminal' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Book publication year',example: 2025 })
  @IsNotEmpty()
  @IsNumber()
  publicationYear: number;

  @ApiProperty({ description: 'Book availability', example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({ description: 'Author IDs',example: 'f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b' })
  @IsNotEmpty()
  @IsUUID()
  @OneToMany(() => Author, (author) => author.books)
  authorId: string;

  @ApiProperty({ description: 'Category IDs',example: ['f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b','f7c9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7c'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
