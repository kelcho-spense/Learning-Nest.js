import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/role.enum';
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

  @IsEnum(Role)
  role: Role = Role.User;
}
