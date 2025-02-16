import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeeprojectsService } from './employeeprojects.service';
import { CreateEmployeeprojectDto } from './dto/create-employeeproject.dto';
import { UpdateEmployeeprojectDto } from './dto/update-employeeproject.dto';

@Controller('employeeprojects')
export class EmployeeprojectsController {
  constructor(private readonly employeeprojectsService: EmployeeprojectsService) {}

  @Post()
  create(@Body() createEmployeeprojectDto: CreateEmployeeprojectDto) {
    return this.employeeprojectsService.create(createEmployeeprojectDto);
  }

  @Get()
  findAll() {
    return this.employeeprojectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeprojectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeprojectDto: UpdateEmployeeprojectDto) {
    return this.employeeprojectsService.update(+id, updateEmployeeprojectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeprojectsService.remove(+id);
  }
}
