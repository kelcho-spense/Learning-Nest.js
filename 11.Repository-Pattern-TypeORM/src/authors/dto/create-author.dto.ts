import { IsDate, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateAuthorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    bio: string;

    @IsOptional()
    @IsDate()
    birthDate: Date;

    @IsNumber()
    @IsOptional()
    profileId?: number;

    @IsNumber({}, { each: true })
    @IsOptional()
    bookIds?: number[];
}
