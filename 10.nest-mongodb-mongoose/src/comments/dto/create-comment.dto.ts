import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsMongoId()
    author: Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    post: Types.ObjectId;
}
