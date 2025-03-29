import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
      exclude: ['/api*'],
      serveRoot: '/',
    }),
    EventsModule],
  controllers: [],
})
export class AppModule { }
