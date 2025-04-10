import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { USERS_SERVICES, ORDERS_SERVICES, PRODUCTS_SERVICES } from './constants';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDERS_SERVICES,
        transport: Transport.TCP,
        options: {
          host: process.env.ORDERS_SERVICE_HOST || 'localhost',
          port: Number(process.env.ORDERS_SERVICE_PORT) || 4001,
        },
      },
      {
        name: PRODUCTS_SERVICES,
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCTS_SERVICE_HOST || 'localhost',
          port: Number(process.env.PRODUCTS_SERVICE_PORT) || 4002,
        },
      },
      {
        name: USERS_SERVICES,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST || 'localhost',
          port: Number(process.env.USERS_SERVICE_PORT) || 4003,
        },
      }
    ]),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
