import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AdvancedGateway } from './advanced.gateway';
import { EventsService } from './events.service';

@Module({
  providers: [EventsGateway, AdvancedGateway, EventsService],
  exports: [EventsGateway, AdvancedGateway, EventsService]
})
export class EventsModule { }