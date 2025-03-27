import { Module } from '@nestjs/common';
import { RockPaperScissorsService } from './rock-paper-scissors.service';

@Module({
  providers: [RockPaperScissorsService],
  exports: [RockPaperScissorsService],
})
export class RockPaperScissorsModule {}
