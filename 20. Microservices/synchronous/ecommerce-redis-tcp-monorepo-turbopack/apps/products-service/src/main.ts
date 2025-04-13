import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.PRODUCTS_SERVICE_HOST || 'localhost',
      port: Number(process.env.PRODUCTS_SERVICE_PORT) || 4002,
    },
  });
  await app.listen();
  console.log('Products microservice is running on port 4002');
}
bootstrap();
