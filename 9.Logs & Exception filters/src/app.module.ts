import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { ProjectsModule } from './projects/projects.module';
import { EmployeeprojectsModule } from './employeeprojects/employeeprojects.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    EmployeesModule,
    ProjectsModule,
    EmployeeprojectsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
  ],
})
export class AppModule {}
