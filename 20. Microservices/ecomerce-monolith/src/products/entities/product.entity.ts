import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @ManyToMany(() => Order, (order) => order.products)
  orders: Order[];
}
