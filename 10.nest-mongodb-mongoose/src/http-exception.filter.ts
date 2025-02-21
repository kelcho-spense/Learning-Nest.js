import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';
import { Error as MongooseError } from 'mongoose';

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new LoggerService(AllExceptionsFilter.name);

  private getClientIp(request: Request): string {
    // Get IP from X-Forwarded-For header or fall back to connection remote address
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // If it's an array or comma-separated string, get the first IP
      return Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
    }
    return request.ip || 'unknown';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const clientIp = this.getClientIp(request);

    const myResponseObj: MyResponseObj = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof MongooseError.ValidationError) {
      myResponseObj.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      myResponseObj.response = {
        message: 'Validation Error',
        errors: Object.values(exception.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      };
    } else if (exception instanceof MongooseError.CastError) {
      myResponseObj.statusCode = HttpStatus.BAD_REQUEST;
      myResponseObj.response = {
        message: 'Invalid ID format',
        field: exception.path,
      };
    } else if (exception instanceof Error) {
      // Handle duplicate key errors from MongoDB
      interface MongoError extends Error {
        code: number;
        keyPattern: Record<string, any>;
      }

      if ((exception as MongoError).code === 11000) {
        myResponseObj.statusCode = HttpStatus.CONFLICT;
        myResponseObj.response = {
          message: 'Duplicate key error',
          field: Object.keys((exception as MongoError).keyPattern)[0],
        };
      } else {
        myResponseObj.response = exception.message;
      }
    } else {
      myResponseObj.response = 'Internal Server Error';
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);

    const logMessage =
      typeof myResponseObj.response === 'string'
        ? myResponseObj.response
        : JSON.stringify(myResponseObj.response);
    this.logger.error(logMessage, AllExceptionsFilter.name, clientIp);
  }
}
