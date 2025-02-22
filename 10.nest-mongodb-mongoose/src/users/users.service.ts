import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<User[]> {
    const query = this.userModel.find({});
    return await query.limit(Math.max(1, limit)).skip(Math.max(0, skip)).exec();
  }

  async findOne(id: string): Promise<User | NotFoundException> {
    const user = await this.userModel
      .findById(id)
      .populate('posts')
      .populate('category')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.findOne(id);
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}
