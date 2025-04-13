import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const tcpMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.PRODUCTS_SERVICE_HOST || 'localhost',
      port: Number(process.env.PRODUCTS_SERVICE_PORT) || 4002,
    },
  });
  const redisMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });
  await Promise.all([
    tcpMicroservice.listen(),
    redisMicroservice.listen(),
  ]);
  console.log(`Products microservice is running on port ${process.env.PRODUCTS_SERVICE_PORT || 4002} & Redis on port ${process.env.REDIS_PORT || 6379}`);
}
bootstrap();
