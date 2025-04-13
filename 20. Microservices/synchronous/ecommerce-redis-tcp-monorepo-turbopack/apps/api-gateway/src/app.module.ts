import { Module } from '@nestjs/common';
import { MICROSERVICES_CLIENT } from './constants';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './orders/orders.controller';
import { UsersController } from './users/users.controller';
import { ProductsController } from './products/products.controller';
import { PaymentController } from './payment/payment.controller';
import { PaymentController } from './payment/payment.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES_CLIENT.ORDERS_SERVICES,
        transport: Transport.TCP,
        options: {
          host: process.env.ORDERS_SERVICE_HOST || 'localhost',
          port: Number(process.env.ORDERS_SERVICE_PORT) || 4001,
        },
      },
      {
        name: MICROSERVICES_CLIENT.PRODUCTS_SERVICES,
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCTS_SERVICE_HOST || 'localhost',
          port: Number(process.env.PRODUCTS_SERVICE_PORT) || 4002,
        },
      },
      {
        name: MICROSERVICES_CLIENT.USERS_SERVICES,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST || 'localhost',
          port: Number(process.env.USERS_SERVICE_PORT) || 4003,
        },
      }
    ]),

  ],
  controllers: [ OrdersController, UsersController, ProductsController, PaymentController],
  providers: [],
})
export class AppModule { }
