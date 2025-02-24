import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/posts.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

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
    const { category, comments, ...rest } = updatePostDto;
    const update: any = { ...rest };

    if (category || comments) {
      update.$addToSet = {};
      if (category) {
        update.$addToSet.category = { $each: category };
      }
      if (comments) {
        update.$addToSet.comments = { $each: comments };
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
