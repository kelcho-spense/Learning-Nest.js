import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorsRepository.create(createAuthorDto);
    return await this.authorsRepository.save(author);
  }

  async findAll(): Promise<Author[]> {
    return await this.authorsRepository.find({
      relations: ['books'],
    });
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: { id },
      relations: ['books'],
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);

    // Update the author properties
    Object.assign(author, updateAuthorDto);

    return await this.authorsRepository.save(author);
  }

  async remove(id: string): Promise<void> {
    const result = await this.authorsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }
}
