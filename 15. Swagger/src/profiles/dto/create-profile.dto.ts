import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ description: 'Profile bio', example: 'John is a great author!' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Profile name', example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Profile avatar', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Profile date of birth', example: '2021-10-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiProperty({ description: 'Profile location', example: 'New York' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'User ID(uuid)', example: 'f7b9f1b1-3b7d-4b7b-8b3b-3b7b1b7b7b7b' })
  @IsUUID()
  userId: string;
}
