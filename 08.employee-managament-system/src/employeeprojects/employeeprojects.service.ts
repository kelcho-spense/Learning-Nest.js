import { Injectable } from '@nestjs/common';
import { CreateEmployeeprojectDto, UpdateEmployeeprojectDto } from './dto';

@Injectable()
export class EmployeeprojectsService {
  create(createEmployeeprojectDto: CreateEmployeeprojectDto) {
    return 'This action adds a new employeeproject';
  }

  findAll() {
    return `This action returns all employeeprojects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeeproject`;
  }

  update(id: number, updateEmployeeprojectDto: UpdateEmployeeprojectDto) {
    return `This action updates a #${id} employeeproject`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeeproject`;
  }
}
