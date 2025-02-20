import { Module } from '@nestjs/common';
import { EmployeeprojectsService } from './employeeprojects.service';
import { EmployeeprojectsController } from './employeeprojects.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EmployeeprojectsController],
  providers: [EmployeeprojectsService, PrismaService],
})
export class EmployeeprojectsModule {}
