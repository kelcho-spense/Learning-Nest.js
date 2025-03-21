import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/login.dto';
import { Public } from './decorators';
import { AtGuard, RtGuard } from './guards';
import { RequestWithUser } from './types';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
  @ApiParam({ name: 'id', type: 'string', description: 'user id (uuid)' })
  signOut(@Param('id') id: string) {
    return this.authService.signOut(id);
  }

  @ApiBearerAuth()
  @UseGuards(RtGuard)
  @Get('refresh')
  @ApiQuery({ name: 'id', type: 'string', description: 'user id (uuid)' })
  refreshTokens(
    @Query('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.sub !== id) {
      throw new UnauthorizedException('Invalid user');
    }
    return this.authService.refreshTokens(id, user.refreshToken);
  }
}
