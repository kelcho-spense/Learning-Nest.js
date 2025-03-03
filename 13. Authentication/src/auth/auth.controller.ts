import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUpLocal(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUpLocal(createAuthDto);
  }

  @Post('signin')
  signInLocal(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signInLocal(createAuthDto);
  }
  
  @Get('signout/:id')
  signOut(@Param('id') id: string) {
    console.log("signout")
    return this.authService.signOut(id);
  }

  @Get('refresh')
  refreshTokens(
    @Query('id') id: string,
    @Query('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(id, refreshToken);
  }
}
