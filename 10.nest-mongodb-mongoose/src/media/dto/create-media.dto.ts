import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMediaDto {
    @IsNotEmpty()
    @IsString()
    filename: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    url: string;

    @IsNotEmpty()
    @IsNumber()
    size: number;

    @IsMongoId()
    post: Types.ObjectId;
}
