import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EmployeeprojectsService } from './employeeprojects.service';
import { CreateEmployeeprojectDto, UpdateEmployeeprojectDto } from './dto';

@Controller('employeeprojects')
export class EmployeeprojectsController {
  constructor(
    private readonly employeeprojectsService: EmployeeprojectsService,
  ) {}

  @Post()
  create(@Body() createEmployeeprojectDto: CreateEmployeeprojectDto) {
    return this.employeeprojectsService.create(createEmployeeprojectDto);
  }

  @Get()
  findAll() {
    return this.employeeprojectsService.findAll();
  }

  @Get('one')
  findOne(
    @Query('employeeId', ParseIntPipe) employeeId: number,
    @Query('projectId', ParseIntPipe) projectId: number,
  ) {
    console.log(employeeId, projectId);
    return this.employeeprojectsService.findOne(employeeId, projectId);
  }

  @Patch()
  update(@Body() updateEmployeeprojectDto: UpdateEmployeeprojectDto) {
    return this.employeeprojectsService.update(updateEmployeeprojectDto);
  }

  @Delete()
  remove(
    @Query('employeeId', ParseIntPipe) employeeId: number,
    @Query('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.employeeprojectsService.remove(employeeId, projectId);
  }
}
