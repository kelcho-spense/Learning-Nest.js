import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsMongoId()
  recipient: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsNotEmpty()
  @IsString()
  type: string;
}
