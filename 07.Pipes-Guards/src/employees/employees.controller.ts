import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { RolesGuard } from './guards/roles.guards';
import { Roles } from './decorator/roles.decorator';
import { Role } from './enums/role.enum';

@UseGuards(RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @Roles(Role.Admin)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll(): CreateEmployeeDto[] {
    return this.employeesService.findAll();
  }

  @Get()
  search(@Query('name') name: string): CreateEmployeeDto[] {
    return this.employeesService.search(name);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) idParam: number) {
    return this.employeesService.findOne(idParam);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) idParam: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(idParam, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) idParam: number): string {
    return this.employeesService.remove(idParam);
  }
}
