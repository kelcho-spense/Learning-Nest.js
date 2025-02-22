import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Post } from 'src/posts/schemas/posts.schema';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;
  // will be auto-generated
  @Prop({ unique: true, required: false })
  slug: string;

  @Prop([{ type: Types.ObjectId, ref: 'Post' }])
  posts: Post[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Add pre-save middleware to generate slug
CategorySchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});
