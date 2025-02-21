import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  relatedEntityId: string;

  @Prop()
  relatedEntityType: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
