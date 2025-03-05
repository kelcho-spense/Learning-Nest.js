import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/login.dto';
import { Public } from './decorators';
import { AtGuard, RtGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signUpLocal(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUpLocal(createAuthDto);
  }

  @Public()
  @Post('signin')
  signInLocal(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signInLocal(createAuthDto);
  }
  
  @UseGuards(AtGuard)
  @Get('signout/:id')
  signOut(@Param('id') id: string) {
    return this.authService.signOut(id);
  }

  @UseGuards(RtGuard)
  @Get('refresh')
  refreshTokens(
    @Query('id') id: string,
    @Query('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(id, refreshToken);
  }
}
