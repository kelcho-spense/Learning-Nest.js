import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { RolesGuard } from './guards/roles.guards';

@Module({
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class EmployeesModule {}
