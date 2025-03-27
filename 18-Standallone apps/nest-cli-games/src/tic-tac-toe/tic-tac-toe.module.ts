import { Module } from '@nestjs/common';
import { TicTacToeService } from './tic-tac-toe.service';

@Module({
  providers: [TicTacToeService],
  exports: [TicTacToeService],
})
export class TicTacToeModule {}
