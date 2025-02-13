import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './logger.middleware';

/**
 * @Module AppModule
 * AppModule is the root module of the application.
 * It is responsible for configuring the application's middleware.
 */
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})

/**
 * @implements NestModule
 * @remarks
 * This module applies the LoggerMiddleware to all routes under the 'employees' path.
 * configure() method is used to apply middleware to the routes.
 * The middleware will execute before the route handlers for employee-related endpoints.
 */
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('employees');
  }
}
