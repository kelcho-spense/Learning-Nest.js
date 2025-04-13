import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const tcpMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ORDERS_SERVICE_HOST || 'localhost',
      port: Number(process.env.ORDERS_SERVICE_PORT) || 4001,
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

  console.log(`Orders microservice is running on port ${process.env.ORDERS_SERVICE_PORT || 4001} & Redis on port ${process.env.REDIS_PORT || 6379}`);
}
bootstrap();
