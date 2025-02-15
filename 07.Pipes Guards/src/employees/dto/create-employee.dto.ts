import { IsInt, IsOptional, IsString } from 'class-validator';
export class CreateEmployeeDto {
  @IsOptional()
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  department: string;
}
