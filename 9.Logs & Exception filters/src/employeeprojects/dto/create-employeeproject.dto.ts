import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateEmployeeprojectDto {
  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
