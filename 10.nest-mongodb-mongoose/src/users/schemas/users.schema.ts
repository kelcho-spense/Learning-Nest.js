import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Post } from 'src/posts/schemas/posts.schema';

export type userDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'reader' })
  role: string;

  @Prop()
  avatar: string;

  @Prop()
  bio: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop([{ type: Types.ObjectId, ref: 'Post' }])
  posts: Post[];

  @Prop([{ type: Types.ObjectId, ref: 'Comment' }])
  comments: Comment[];
}

export const UserSchema = SchemaFactory.createForClass(User);
