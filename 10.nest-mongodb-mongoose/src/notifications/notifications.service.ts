import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './schemas/notifications.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return await notification.save();
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<Notification[]> {
    const query = this.notificationModel.find({}).populate('recipient');
    return await query.limit(Math.max(1, limit)).skip(Math.max(0, skip)).exec();
  }

  async findOne(id: string): Promise<Notification | NotFoundException> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('recipient')
      .exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification | null> {
    await this.findOne(id);
    return await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.notificationModel.findByIdAndDelete(id).exec();
  }
}
