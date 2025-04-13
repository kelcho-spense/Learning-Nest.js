import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.PAYMENT_SERVICE_HOST || 'localhost',
      port: Number(process.env.PAYMENT_SERVICE_PORT) || 4004,
    },
  });
  
  await app.listen();
  console.log('Payment microservice is running on port 4004');
}
bootstrap();
