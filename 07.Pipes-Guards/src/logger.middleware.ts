import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * A middleware that logs incoming requests to the console.
 *
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @param next The next middleware function in the chain.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
