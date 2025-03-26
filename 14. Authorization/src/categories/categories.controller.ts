import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CreateCategoryPolicyHandler,
  DeleteCategoryPolicyHandler,
  ReadCategoryPolicyHandler,
  UpdateCategoryPolicyHandler,
} from '../casl/policies/category.policies';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @CheckPolicies(new CreateCategoryPolicyHandler())
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @CheckPolicies(new ReadCategoryPolicyHandler())
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @CheckPolicies(new ReadCategoryPolicyHandler())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies(new UpdateCategoryPolicyHandler())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @CheckPolicies(new DeleteCategoryPolicyHandler())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
