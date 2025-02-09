import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Redirect,
} from '@nestjs/common';
// import { AppService } from './app.service';
interface IEmployee {
  id: number;
  name: string;
  age: number;
  department: string;
}

@Controller('employees')
export class AppController {
  // constructor(private readonly appService: AppService) {}
  private employees: IEmployee[] = [
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

  @Get() // http://localhost:3000/employees
  findAll(): IEmployee[] {
    return this.employees;
  }

  @Get() // http://localhost:3000/employees?name=John
  search(@Query('name') name: string): IEmployee[] {
    return this.employees.filter((e) => e.name.toLowerCase().includes(name));
  }

  @Get(':id') // http://localhost:3000/employees/1
  findOne(@Param('id', ParseIntPipe) idParam: number): IEmployee | string {
    const employee = this.employees.find((e) => e.id === idParam);
    if (!employee) {
      return `Employee with id: ${idParam} not found`;
    }
    return employee;
  }

  @Post() // http://localhost:3000/employees
  create(@Body() data: Partial<IEmployee>): IEmployee {
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

  @Put(':id') // http://localhost:3000/employees/1
  update(
    @Body() data: Partial<IEmployee>,
    @Param('id', ParseIntPipe) param: number,
  ): IEmployee | string {
    const employee = this.employees.find((e) => e.id === param);
    if (!employee) {
      return `Employee with id: ${param} not found`;
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

  @Delete(':id') // http://localhost:3000/employees/1
  delete(@Param('id', ParseIntPipe) params: number): string {
    const index = this.employees.findIndex((e) => e.id === params);
    this.employees.splice(index, 1);
    return `Employee with id: ${index} deleted`;
  }

  @Get('redirect') //  Redirect to /employees
  @Redirect('http://localhost:3000/employees')
  redirect(): string {
    return 'Redirected to /employees';
  }
}
