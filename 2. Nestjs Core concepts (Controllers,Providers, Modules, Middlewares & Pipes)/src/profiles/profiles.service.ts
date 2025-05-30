import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  create(createProfileDto: CreateProfileDto) {
    return `This action adds a new profile: ${JSON.stringify(createProfileDto)}`;
  }

  findAll(search?: string) {
    if (search) {
      return `This action returns profiles matching: ${search}`;
    }
    return `This action returns all profiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile with: ${JSON.stringify(updateProfileDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
