import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch user
      const user = await this.usersService.findOne(createOrderDto.userId);

      // Create new order instance
      const order = new Order();
      order.user = user;
      order.products = [];
      order.totalAmount = 0;
      order.orderStatus = OrderStatus.PENDING;

      // Process each product in the order
      for (const item of createOrderDto.items) {
        const product = await this.productsService.findOne(item.productId);

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for product: ${product.name}`);
        }

        // Update product stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        // Add product to order
        order.products.push(product);

        // Calculate order total
        order.totalAmount += product.price * item.quantity;
      }

      // Save the order
      const savedOrder = await queryRunner.manager.save(order);

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'products'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // For orders, typically we would only update status
    // Not allowing changes to products once order is created
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (updateOrderDto.OrderStatus) {
      order.orderStatus = updateOrderDto.OrderStatus;
      return this.orderRepository.save(order);
    }

    return order;
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.orderRepository.remove(order);
  }
}
