import { Module } from '@nestjs/common';
import { GuessNumberModule } from './guess-number/guess-number.module';
import { RockPaperScissorsModule } from './rock-paper-scissors/rock-paper-scissors.module';
import { TicTacToeModule } from './tic-tac-toe/tic-tac-toe.module';
import { JumpingGameModule } from './jumping-game/jumping-game.module';
import GameStart from './game.start';

@Module({
  imports: [ GuessNumberModule, RockPaperScissorsModule, TicTacToeModule, JumpingGameModule],
  providers: [GameStart],
})
export class AppModule { }
