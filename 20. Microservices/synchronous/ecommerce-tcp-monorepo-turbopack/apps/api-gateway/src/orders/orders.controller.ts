import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENT } from 'src/constants';

@Controller('orders')
export class OrdersController {
    constructor(@Inject(MICROSERVICES_CLIENT.ORDERS_SERVICES) private ordersServiceClient: ClientProxy) { }

    @Get()
    getOrders() {
        return this.ordersServiceClient.send('findAllOrders', {});
    }

    @Get(':id')
    getOrderById() {
        return 'This action returns a single order';
    }

}
