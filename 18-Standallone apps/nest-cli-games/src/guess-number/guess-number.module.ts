import { Module } from '@nestjs/common';
import { GuessNumberService } from './guess-number.service';

@Module({
  providers: [GuessNumberService],
  exports: [GuessNumberService],
})
export class GuessNumberModule { }
