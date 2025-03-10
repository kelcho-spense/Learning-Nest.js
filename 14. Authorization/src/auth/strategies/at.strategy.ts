import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
type JWTPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Bearer token extraction from Authorization header
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'), // Fetch Access token secret key
    });
  }
  //secret key verification using JWT_ACCESS_TOKEN_SECRET
  validate(payload: JWTPayload) {
    return payload; // attach request.user = payload;
  }
}

// This strategy validates JWT tokens from Authorization Bearer headers
// using the JWT_ACCESS_TOKEN_SECRET environment variable
