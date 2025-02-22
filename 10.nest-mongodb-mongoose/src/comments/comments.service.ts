import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './schemas/comments.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    return await createdComment.save();
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<Comment[]> {
    const query = this.commentModel
      .find({})
      .populate('author')
      .populate('post');
    return await query.limit(Math.max(1, limit)).skip(Math.max(0, skip)).exec();
  }

  async findOne(id: string): Promise<Comment | NotFoundException> {
    const comment = await this.commentModel
      .findById(id)
      .populate('author')
      .populate('post')
      .exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    await this.findOne(id);
    return await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.commentModel.findByIdAndDelete(id).exec();
  }
}
