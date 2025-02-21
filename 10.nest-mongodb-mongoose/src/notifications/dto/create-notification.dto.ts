import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsMongoId()
    user: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    relatedEntityId: string;

    @IsNotEmpty()
    @IsString()
    relatedEntityType: string;
}
