import { Module } from '@nestjs/common';
import { MICROSERVICES_CLIENT } from './constants';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './orders/orders.controller';
import { UsersController } from './users/users.controller';
import { ProductsController } from './products/products.controller';
import { PaymentController } from './payment/payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ClientsModule.registerAsync([
      {
        name: MICROSERVICES_CLIENT.ORDERS_SERVICES,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDERS_SERVICE_HOST', 'localhost'),
            port: configService.get('ORDERS_SERVICE_PORT', 4001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: MICROSERVICES_CLIENT.PRODUCTS_SERVICES,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PRODUCTS_SERVICE_HOST', 'localhost'),
            port: configService.get('PRODUCTS_SERVICE_PORT', 4002),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: MICROSERVICES_CLIENT.USERS_SERVICES,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_SERVICE_HOST', 'localhost'),
            port: configService.get('USERS_SERVICE_PORT', 4003),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: MICROSERVICES_CLIENT.PAYMENTS_SERVICES,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PAYMENTS_SERVICE_HOST', 'localhost'),
            port: configService.get('PAYMENTS_SERVICE_PORT', 4004),
          },
        }),
        inject: [ConfigService],
      }
    ]),
  ],
  controllers: [OrdersController, UsersController, ProductsController, PaymentController],
  providers: [],
})
export class AppModule {}
