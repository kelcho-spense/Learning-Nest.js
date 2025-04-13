import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment/entities/payment.entity';

@Module({
  imports: [PaymentModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
        database: process.env.PAYMENT_DB_NAME || 'payment.db',
        entities: [Payment],
        synchronize: true,
      }),
    TypeOrmModule.forFeature([Payment]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
