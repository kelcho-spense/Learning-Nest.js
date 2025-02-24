import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  comments: Types.ObjectId[] | undefined;

  @IsOptional()
  category?: Types.ObjectId[] | undefined;
}
