import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import GameStart from './game.start';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.get(GameStart).run();
  await app.close();
}
bootstrap();
