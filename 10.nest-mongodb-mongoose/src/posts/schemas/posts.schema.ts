import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Comment } from '../../comments/schemas/comments.schema';
import { User } from '../../users/schemas/users.schema';
import { Category } from 'src/categories/schemas/categories.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ type: [Types.ObjectId], ref: 'Comment' })
  comments: Types.ObjectId[];

  @Prop({ type: [String] })
  image_url: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Category' })
  category: Types.ObjectId[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  dislikes: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
