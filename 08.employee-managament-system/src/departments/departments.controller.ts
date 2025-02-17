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
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { ParseArrayJsonPipe } from './pipes/parse-array-Json.pipe';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentsService.create(createDepartmentDto);
  }

  @Post('many')
  async createMany(@Body() createDepartmentDto: CreateDepartmentDto[]) {
    return await this.departmentsService.createMany(createDepartmentDto);
  }

  @Get()
  async findAll() {
    return await this.departmentsService.findAll();
  }
  @Get()
  async searchByName(@Query('name') name: string) {
    return await this.departmentsService.searchDepartmentByName(name);
  }

  @Delete('many')
  async removeAll(@Query('ids', new ParseArrayJsonPipe()) ids: number[]) {
    return await this.departmentsService.removeAll(ids);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return await this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentsService.remove(id);
  }
}
