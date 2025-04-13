import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [ProductsModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
        database: process.env.PRODUCTS_DB_NAME || 'products.db',
        entities: [Product],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
