import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: 'user email', example: 'example@email.com' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'StrongPassword123' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(4, { message: 'Your Password should be more that 4 characters' })
  password: string;
}
