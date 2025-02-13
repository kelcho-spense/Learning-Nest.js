import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Redirect,
} from '@nestjs/common';
import { AppService } from './app.service';
import { IEmployee } from './schemas/employee.schema';

@Controller('employees')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // http://localhost:3000/employees
  findAll(): IEmployee[] {
    return this.appService.employees;
  }

  @Get() // http://localhost:3000/employees?name=John
  search(@Query('name') name: string): IEmployee[] {
    return this.appService.search(name);
  }

  @Get(':id') // http://localhost:3000/employees/1
  findOne(@Param('id', ParseIntPipe) idParam: number): IEmployee | string {
    return this.appService.findOne(idParam);
  }

  @Post() // http://localhost:3000/employees
  create(@Body() data: Partial<IEmployee>): IEmployee {
    return this.appService.create(data);
  }

  @Put(':id') // http://localhost:3000/employees/1
  update(
    @Body() data: Partial<IEmployee>,
    @Param('id', ParseIntPipe) param: number,
  ): IEmployee | string {
    return this.appService.update(data, param);
  }

  @Delete(':id') // http://localhost:3000/employees/1
  delete(@Param('id', ParseIntPipe) params: number): string {
    return this.appService.delete(params);
  }

  @Get('redirect') //  Redirect to /employees
  @Redirect('http://localhost:3000/employees')
  redirect(): string {
    return 'Redirected to /employees';
  }

  @Get('error') // http://localhost:3000/employees/error
  showErrors(): void {
    // throw new Error('This is a test error');
    throw new ForbiddenException('This is forbidden exception error');
    // throw new NotFoundException('This is a notfound error');
    // throw new BadRequestException('This is a bad request error');
  }
}
