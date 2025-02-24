import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { Role } from './enums/role.enum';
@Injectable()
export class EmployeesService {
  public employees: CreateEmployeeDto[] = [
    {
      id: 1,
      name: 'John Doe',
      age: 30,
      department: 'IT',
      role: Role.Admin,
    },
    {
      id: 2,
      name: 'Jane Doe',
      age: 25,
      department: 'HR',
      role: Role.User,
    },
    {
      id: 3,
      name: 'John Smith',
      age: 35,
      department: 'Finance',
      role: Role.User,
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
  create(data: CreateEmployeeDto): CreateEmployeeDto {
    const lastId = this.employees[this.employees.length - 1].id;
    const newEmployee: CreateEmployeeDto = {
      id: lastId + 1,
      name: data.name,
      age: data.age,
      department: data.department,
      role: data.role || Role.User,
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
