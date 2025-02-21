import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import { Post } from 'src/posts/schemas/posts.schema';
import { Media } from 'src/media/schemas/media.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @Prop({ default: 0, required: false })
  likes: number;

  @Prop({ default: 0, required: false })
  dislikes: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop([{ type: Types.ObjectId, ref: 'Media' }])
  media: Media[];

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
