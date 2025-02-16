import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { ProjectsModule } from './projects/projects.module';
import { EmployeeprojectsModule } from './employeeprojects/employeeprojects.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    EmployeesModule,
    ProjectsModule,
    EmployeeprojectsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
