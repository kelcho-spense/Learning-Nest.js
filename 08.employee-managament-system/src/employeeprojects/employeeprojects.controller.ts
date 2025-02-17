import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeprojectsService.findOne(id);
  }

  @Patch(':employeeId/:projectId')
  update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() updateEmployeeprojectDto: UpdateEmployeeprojectDto,
  ) {
    return this.employeeprojectsService.update({
      employeeId,
      projectId,
      updateEmployeeprojectDto,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeprojectsService.remove(id);
  }
}
