import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/users.schema';
import { Post } from '../posts/schemas/posts.schema';
import { Category } from '../categories/schemas/categories.schema';
import { Comment } from '../comments/schemas/comments.schema';
import { Notification } from '../notifications/schemas/notifications.schema';
import { categoriesData } from './seed-data/categories.data';
import { usersData } from './seed-data/users.data';
import { createPostData } from './seed-data/posts.data';
import { createCommentData } from './seed-data/comments.data';
import { faker } from '@faker-js/faker/.';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async cleanDatabase() {
    await Promise.all([
      this.userModel.deleteMany({}),
      this.postModel.deleteMany({}),
      this.categoryModel.deleteMany({}),
      this.commentModel.deleteMany({}),
      this.notificationModel.deleteMany({}),
    ]);
  }

  async seed() {
    await this.cleanDatabase();

    // Seed categories
    const categories = await this.categoryModel.create(categoriesData);

    // Seed users
    const users = await this.userModel.create(usersData);

    // Seed posts
    const posts = await Promise.all(
      Array(50)
        .fill(null)
        .map(async () => {
          const post = await this.postModel.create({
            ...createPostData(),
            author: faker.helpers.arrayElement(users)._id,
            category: faker.helpers
              .arrayElements(categories, { min: 1, max: 3 })
              .map((cat) => cat._id),
          });
          return post;
        }),
    );

    // Seed comments
    const comments = await Promise.all(
      Array(100)
        .fill(null)
        .map(async () => {
          const comment = await this.commentModel.create({
            ...createCommentData(),
            author: faker.helpers.arrayElement(users)._id,
            post: faker.helpers.arrayElement(posts)._id,
          });
          return comment;
        }),
    );

    // Create notifications
    await Promise.all(
      users.map(async (user) => {
        await this.notificationModel.create({
          message: faker.lorem.sentence(),
          recipient: user._id,
          type: faker.helpers.arrayElement(['comment', 'like', 'mention']),
          isRead: faker.datatype.boolean(),
        });
      }),
    );

    // Update references
    await Promise.all([
      // Update users with their posts and comments
      ...users.map((user) =>
        this.userModel.findByIdAndUpdate(user._id, {
          $set: {
            posts: posts
              .filter((post) => post.author.valueOf() === user._id.valueOf())
              .map((p) => p._id),
            comments: comments
              .filter(
                (comment) => comment.author.valueOf() === user._id.valueOf(),
              )
              .map((c) => c._id),
          },
        }),
      ),
      // Update posts with their comments
      ...posts.map((post) =>
        this.postModel.findByIdAndUpdate(post._id, {
          $set: {
            comments: comments
              .filter(
                (comment) => comment.post?.valueOf() === post._id?.valueOf(),
              )
              .map((c) => c._id),
          },
        }),
      ),
      // Update categories with their posts
      ...categories.map((category) =>
        this.categoryModel.findByIdAndUpdate(category._id, {
          $set: {
            posts: posts
              .filter((post) =>
                post.category
                  .map((c) => c.toString())
                  .includes(category._id.toString()),
              )
              .map((p) => p._id),
          },
        }),
      ),
    ]);

    console.log('Database seeded successfully!');
  }
}
