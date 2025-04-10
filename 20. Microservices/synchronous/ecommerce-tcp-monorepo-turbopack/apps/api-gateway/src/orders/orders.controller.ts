import { Controller, Get, Inject, Param, ParseIntPipe, Patch, Body, Delete, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENT } from 'src/constants';

@Controller('orders')
export class OrdersController {
    constructor(@Inject(MICROSERVICES_CLIENT.ORDERS_SERVICES) private ordersServiceClient: ClientProxy) { }

    @Post()
    createOrder(@Body() orderData: any) {
        return this.ordersServiceClient.send('createOrder', orderData);
    }

    @Get()
    getOrders() {
        return this.ordersServiceClient.send('findAllOrders', {});
    }

    @Get(':id')
    getOrderById(@Param('id', ParseIntPipe) id: number) {
        return this.ordersServiceClient.send('findOneOrder', id );
    }

    @Patch(':id')
    updateOrder(@Param('id', ParseIntPipe) id: number, @Body() orderData: any) {
        orderData.id = id; // Ensure the ID is included in the order data
        return this.ordersServiceClient.send('updateOrder', orderData);
    }

    @Delete(':id')
    deleteOrder(@Param('id', ParseIntPipe) id: number) {
        return this.ordersServiceClient.send('removeOrder', id );
    }

}
