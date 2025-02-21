import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Post } from 'src/posts/schemas/posts.schema';

export type MediaDocument = HydratedDocument<Media>;

@Schema()
export class Media {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post: Post;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
