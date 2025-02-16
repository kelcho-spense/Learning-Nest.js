import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeprojectDto } from './create-employeeproject.dto';

export class UpdateEmployeeprojectDto extends PartialType(
  CreateEmployeeprojectDto,
) {}
