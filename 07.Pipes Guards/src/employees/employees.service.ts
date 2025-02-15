import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
@Injectable()
export class EmployeesService {
  public employees: CreateEmployeeDto[] = [
    {
      id: 1,
      name: 'John Doe',
      age: 30,
      department: 'IT',
    },
    {
      id: 2,
      name: 'Jane Doe',
      age: 25,
      department: 'HR',
    },
    {
      id: 3,
      name: 'John Smith',
      age: 35,
      department: 'Finance',
    },
  ];
  findAll(): CreateEmployeeDto[] {
    return this.employees;
  }
  search(name: string): CreateEmployeeDto[] {
    const foundEmployee = this.employees.filter((e) =>
      e.name.toLowerCase().includes(name),
    );
    if (!foundEmployee) {
      throw new NotFoundException(`Employee with name: ${name} not found`);
    }
    return foundEmployee;
  }

  findOne(idParam: number): CreateEmployeeDto | string {
    const employee = this.employees.find((e) => e.id === idParam);
    if (!employee) {
      throw new NotFoundException(`Employee with id: ${idParam} not found`);
    }
    return employee;
  }
  create(data: Partial<CreateEmployeeDto>): CreateEmployeeDto {
    const lastId = this.employees[this.employees.length - 1].id;
    const newEmployee = {
      id: lastId + 1,
      name: data.name!,
      age: data.age!,
      department: data.department!,
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }
  update(param: number, data: UpdateEmployeeDto): CreateEmployeeDto | string {
    const employee = this.employees.find((e) => e.id === param);
    if (!employee) {
      throw new NotFoundException(`Employee with id: ${param} not found`);
    }
    if (data.name) {
      employee.name = data.name;
    } else if (data.age) {
      employee.age = data.age;
    } else if (data.department) {
      employee.department = data.department;
    } else {
      return employee;
    }
    return employee;
  }

  remove(id: number): string {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Employee with id: ${id} not found`);
    }
    this.employees.splice(index, 1);
    return `Employee with id: ${index} deleted`;
  }
}
