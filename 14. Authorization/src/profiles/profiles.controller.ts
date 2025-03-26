import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { ReadProfilePolicyHandler, CreateProfilePolicyHandler, DeleteProfilePolicyHandler, UpdateProfilePolicyHandler } from 'src/casl/policies/profile.policies';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get()
  @CheckPolicies(new ReadProfilePolicyHandler())
  findAll(): Promise<Profile[]> {
    return this.profilesService.findAll();
  }

  @Get(':id')
  @CheckPolicies(new ReadProfilePolicyHandler())
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Profile> {
    return this.profilesService.findOne(id);
  }

  @Post()
  @CheckPolicies(new CreateProfilePolicyHandler())
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.profilesService.create(createProfileDto);
  }

  @Patch(':id')
  @CheckPolicies(new UpdateProfilePolicyHandler())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @CheckPolicies(new DeleteProfilePolicyHandler())
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.profilesService.remove(id);
  }
}
