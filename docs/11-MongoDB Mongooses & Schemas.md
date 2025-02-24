### Mongo

Nest supports two methods for integrating with the [MongoDB](https://www.mongodb.com/) database. You can either use the built-in [TypeORM](https://github.com/typeorm/typeorm) module described [here](https://docs.nestjs.com/techniques/database), which has a connector for MongoDB, or use [Mongoose](https://mongoosejs.com/), the most popular MongoDB object modeling tool. In this chapter we'll describe the latter, using the dedicated `@nestjs/mongoose` package.

Start by installing the [required dependencies](https://github.com/Automattic/mongoose):

```bash

npm i @nestjs/mongoose mongoose
```

Once the installation process is complete, we can import the `MongooseModule` into the root `AppModule`.

**app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
  ],
  controllers: [],
})
export class AppModule {}

```

#### Model injection[#](https://docs.nestjs.com/techniques/mongodb#model-injection)

With Mongoose, everything is derived from a [Schema](http://mongoosejs.com/docs/guide.html). Each schema maps to a MongoDB collection and defines the shape of the documents within that collection. Schemas are used to define [Models](https://mongoosejs.com/docs/models.html). Models are responsible for creating and reading documents from the underlying MongoDB database.

Schemas can be created with NestJS decorators, or with Mongoose itself manually. Using decorators to create schemas greatly reduces boilerplate and improves overall code readability.

Let's define the postSchema :

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/users.schema';

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

```

The `@Schema()` decorator marks a class as a schema definition. It maps our `Post` class to a MongoDB collection of the same name. This decorator accepts a single optional argument which is a schema options object. Think of it as the object you would normally pass as a second argument of the `mongoose.Schema` class' constructor (e.g., `new mongoose.Schema(_, options)`)). To learn more about available schema options, To learn more about available schema options, see [this](https://mongoosejs.com/docs/guide.html#options) chapter

The `@Prop()` decorator defines a property in the document. For example, in the schema definition above, we defined three properties: `name`, `age`, and `breed`. The [schema types](https://mongoosejs.com/docs/schematypes.html) for these properties are automatically inferred thanks to TypeScript metadata (and reflection) capabilities. However, in more complex scenarios in which types cannot be implicitly reflected (for example, arrays or nested object structures), types must be indicated explicitly, as follows:

Alternatively, the `@Prop()` decorator accepts an options object argument ([read more](https://mongoosejs.com/docs/schematypes.html#schematype-options) about the available options)

In case you want to specify relation to another model, later for populating, you can use `@Prop()` decorator as well. For example, if ``post`` has  ``comment ``which is stored in a different collection called ``comment``, the property should have type and ref. For example:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ type: [Types.ObjectId], ref: 'Comment' })
  comments: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
```

Lets's Register our ``postSchema`` in ``postModule``

```typescript
import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemas/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```


The `MongooseModule` provides the `forFeature()` method to configure the module, including defining which models should be registered in the current scope. If you also want to use the models in another module, add MongooseModule to the `exports` section of `PostModule` and import `PostModule` in the other module.

Once you've registered the schema, you can inject a Post model into the `PostService` using the `@InjectModel()` decorator:

```typescript
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './schemas/posts.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    return await createdPost.save();
  }
}

```
