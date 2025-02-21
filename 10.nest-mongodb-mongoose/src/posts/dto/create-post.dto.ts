import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsMongoId()
    author: Types.ObjectId;

    @IsArray()
    @IsMongoId({ each: true })
    category: Types.ObjectId[];

    @IsArray()
    @IsString({ each: true })
    tags: string[];
}
