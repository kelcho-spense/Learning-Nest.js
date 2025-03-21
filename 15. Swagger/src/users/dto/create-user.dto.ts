import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email', example: 'example@mail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  
  @ApiProperty({ description: 'User password', example: 'StrongPassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
