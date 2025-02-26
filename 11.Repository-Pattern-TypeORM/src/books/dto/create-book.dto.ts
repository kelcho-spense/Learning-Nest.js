import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsArray } from 'class-validator';

export class CreateBookDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    publicationYear: number;

    @IsOptional()
    @IsBoolean()
    isAvailable: boolean;

    @IsNotEmpty()
    @IsUUID()
    authorId: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    categoryIds: string[];
}
