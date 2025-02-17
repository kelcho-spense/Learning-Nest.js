import { IsString, IsEmail, IsOptional, IsInt, IsArray } from 'class-validator';
export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsArray()
  projectIds?: number[];
}
