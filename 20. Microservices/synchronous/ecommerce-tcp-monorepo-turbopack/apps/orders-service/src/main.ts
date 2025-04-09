import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ORDERS_SERVICE_HOST || 'localhost',
      port: Number(process.env.ORDERS_SERVICE_PORT) || 4001,
    },
  });
 
  await app.listen();
}
bootstrap();
