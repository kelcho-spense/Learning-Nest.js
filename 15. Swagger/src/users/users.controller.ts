import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiParam } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'user id (uuid)' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return this.usersService.create(createUserDto);
  // }

  @Put(':id')
  @ApiParam({ name: 'id', type: String, description: 'user id (uuid)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }
  
  @Delete(':id')
  @ApiParam({ name: 'id', type: String, description: 'user id (uuid)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
