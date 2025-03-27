import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GuessCommand } from './guess/guess.command';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.get(GuessCommand).run();
  await app.close();
}
bootstrap();
