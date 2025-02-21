import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaSchema } from './schemas/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Media', schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
