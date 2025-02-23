import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
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

  @Prop([{ type: Types.ObjectId, ref: 'Comment' }])
  comments: Comment[];

  @Prop([{ type: Types.ObjectId, ref: 'Category' }])
  category: Category[];

  @Prop({ required: false })
  image_url: string[];

  @Prop({ required: true })
  tags: string[];

  @Prop({ default: 0, required: false })
  likes: number;

  @Prop({ default: 0, required: false })
  dislikes: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
