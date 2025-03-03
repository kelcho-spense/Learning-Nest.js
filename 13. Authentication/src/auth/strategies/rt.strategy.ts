import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RfStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header
      secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'), // Secret key to verify the signature of the JWT
      passReqToCallback: true, // Pass the request object to the validate function
    });
  }

  validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new Error('No refresh token provided');
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();
    return {
      ...payload, // attach request.user = payload;
      refreshToken,
    };
  }
}
