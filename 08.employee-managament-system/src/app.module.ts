import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { ProjectsModule } from './projects/projects.module';
import { EmployeeprojectsModule } from './employeeprojects/employeeprojects.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    EmployeesModule,
    ProjectsModule,
    EmployeeprojectsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DepartmentsModule,
  ],
})
export class AppModule {}
