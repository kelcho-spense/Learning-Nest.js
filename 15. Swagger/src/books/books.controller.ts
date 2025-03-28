import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import {
  ReadBookPolicyHandler,
  CreateBookPolicyHandler,
  UpdateBookPolicyHandler,
  DeleteBookPolicyHandler
} from '../casl/policies/book.policies';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateBookPolicyHandler())
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadBookPolicyHandler())
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadBookPolicyHandler())
  @ApiParam({ name: 'id', type: String,description: 'book id  (uuid)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
     return await this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateBookPolicyHandler())
  @ApiParam({ name: 'id', type: String,description: 'book id  (uuid)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteBookPolicyHandler())
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String,description: 'book id  (uuid)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}
