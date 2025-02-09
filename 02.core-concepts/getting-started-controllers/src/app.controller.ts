import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller()
export class AppController {
 

  @Get()
  getHello(): string {
    
  }

  @Post()
  postHello(): string {
    
  }

  @Put()
  putHello(): string {
    
  }

  @Delete() {
    deleteHello(): string {
  }
}
