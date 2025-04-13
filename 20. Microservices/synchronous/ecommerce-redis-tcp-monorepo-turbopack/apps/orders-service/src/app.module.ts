import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders/entities/order.entity';

@Module({
  imports: [OrdersModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
        database: process.env.ORDERS_DB_NAME || 'orders.db',
        entities: [Order],
        synchronize: true,   
    }),
    TypeOrmModule.forFeature([Order]), // Add your entities here if needed
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
