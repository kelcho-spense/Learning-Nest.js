import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/posts.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from 'src/categories/schemas/categories.schema';
import { Comment } from 'src/comments/schemas/comments.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    return await createdPost.save();
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<Post[]> {
    const query = this.postModel
      .find({})
      .populate('author')
      .populate('category')
      .populate('comments'); // Populate the comments
    return await query.limit(Math.max(1, limit)).skip(Math.max(0, skip)).exec();
  }

  async findOne(id: string): Promise<Post | NotFoundException> {
    const post = await this.postModel
      .findById(id)
      .populate('author')
      .populate('category')
      .populate('comments') // Populate the comments
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    await this.findOne(id);
    const { category, comments, ...rest } = updatePostDto;
    const update: Partial<Post> = { ...rest } as unknown as Partial<Post>;

    if (category) {
      if (Array.isArray(category)) {
        const foundCategories = await Promise.all(
          category.map((catId) => this.categoryModel.findById(catId)),
        );
        if (foundCategories.some((cat) => !cat)) {
          const missingCategories = category.filter(
            (catId, idx) => !foundCategories[idx],
          );
          throw new NotFoundException(
            `Categories not found: ${missingCategories.join(', ')}`,
          );
        }
        update.category = category;
      } else {
        const foundCategory = await this.categoryModel.findById(category);
        if (!foundCategory) {
          throw new NotFoundException('Category not found');
        }
        update.category = category;
      }
    }

    if (comments) {
      if (Array.isArray(comments)) {
        const foundComments = await Promise.all(
          comments.map((commentId) => this.commentModel.findById(commentId)),
        );
        if (foundComments.some((comment) => !comment)) {
          const missingComments = comments.filter(
            (commentId, idx) => !foundComments[idx],
          );
          throw new NotFoundException(
            `Comment not found with id(s): ${missingComments.join(', ')}`,
          );
        }
        update.comments = comments;
      } else {
        const foundComment = await this.commentModel.findById(comments);
        if (!foundComment) {
          throw new NotFoundException('Comment not found');
        }
        update.comments = comments;
      }
    }

    return await this.postModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('author')
      .populate('category')
      .populate('comments')
      .exec();
  }

  // async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
  //   await this.findOne(id);
  //   return await this.postModel
  //     .findByIdAndUpdate(id, updatePostDto, { new: true })
  //     .exec();
  // }

  async remove(id: string) {
    await this.findOne(id);
    return await this.postModel.findByIdAndDelete(id).exec();
  }
}
