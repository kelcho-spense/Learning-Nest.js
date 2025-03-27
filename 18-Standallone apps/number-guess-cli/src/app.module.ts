import { Module } from '@nestjs/common';
import { GuessModule } from './guess/guess.module';

@Module({
  imports: [GuessModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
