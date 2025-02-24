import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/categories.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(createCategoryDto);
    return await category.save();
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<Category[]> {
    const query = this.categoryModel.find({}).populate('posts');
    return await query.limit(Math.max(1, limit)).skip(Math.max(0, skip)).exec();
  }

  async findOne(id: string): Promise<Category | NotFoundException> {
    const category = await this.categoryModel
      .findById(id)
      .populate('posts')
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    await this.findOne(id);
    return await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.categoryModel.findByIdAndDelete(id).exec();
  }
}
