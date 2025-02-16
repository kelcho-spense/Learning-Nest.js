import { Module } from '@nestjs/common';
import { EmployeeprojectsService } from './employeeprojects.service';
import { EmployeeprojectsController } from './employeeprojects.controller';

@Module({
  controllers: [EmployeeprojectsController],
  providers: [EmployeeprojectsService],
})
export class EmployeeprojectsModule {}
