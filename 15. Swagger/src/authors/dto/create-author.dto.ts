import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ description: 'Author name', example: 'John' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Author bio', example: 'John is a great author!' })
  @IsOptional()
  @IsString()
  bio: string;

  @ApiProperty({ description: 'Author birth date', example: '2021-10-01' })
  @IsOptional()
  @IsDate()
  birthDate: Date;

  @ApiProperty({ description: 'Author profile ID(uuid)', example: 'f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b' })
  @IsString({ each: true })
  @IsOptional()
  profileId?: number;

  @ApiProperty({ description: 'Book IDs(uuid)', example: ['f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b'] })
  @IsString({ each: true })
  @IsOptional()
  bookIds?: string[];
}
