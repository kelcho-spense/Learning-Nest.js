import { Module } from '@nestjs/common';
import { GuessService } from './guess.service';
import { GuessCommand } from './guess.command';

@Module({
  providers: [GuessService, GuessCommand]
})
export class GuessModule {}
