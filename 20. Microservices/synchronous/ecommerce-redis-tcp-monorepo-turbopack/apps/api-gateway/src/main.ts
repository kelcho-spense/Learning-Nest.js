import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe()); // Enable validation globally

  app.enableCors({
    origin: '*', // Replace with your frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // app.setGlobalPrefix('api'); // Set global prefix for all routes

  await app.listen(configService.getOrThrow('PORT'));
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
