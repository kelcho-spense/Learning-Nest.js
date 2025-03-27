import { Module } from '@nestjs/common';
import { JumpingGameService } from './jumping-game.service';

@Module({
  providers: [JumpingGameService],
  exports: [JumpingGameService],
})
export class JumpingGameModule {}
