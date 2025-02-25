import { IsNumber, IsOptional } from 'class-validator';

export class CreateAuthorDto {
    @IsNumber()
    @IsOptional()
    profileId?: number;

    @IsNumber({}, { each: true })
    @IsOptional()
    bookIds?: number[];
}
