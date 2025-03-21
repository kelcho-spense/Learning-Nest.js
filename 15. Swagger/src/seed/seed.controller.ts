import { Controller, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('all')
  async seedAll() {
    await this.seedService.seedAll();
    return { message: 'All data seeded successfully' };
  }

  @Post('users')
  async seedUsers() {
    await this.seedService.seedUsers();
    return { message: 'Users seeded successfully' };
  }

  @Post('authors')
  async seedAuthors() {
    await this.seedService.seedAuthors();
    return { message: 'Authors seeded successfully' };
  }

  @Post('books')
  async seedBooks() {
    await this.seedService.seedBooks();
    return { message: 'Books seeded successfully' };
  }

  @Post('profiles')
  async seedProfiles() {
    await this.seedService.seedProfiles();
    return { message: 'Profiles seeded successfully' };
  }

  @Post('categories')
  async seedCategories() {
    await this.seedService.seedCategories();
    return { message: 'Categories seeded successfully' };
  }

  @Post('book-reviews')
  async seedBookReviews() {
    await this.seedService.seedBookReviews();
    return { message: 'Book reviews seeded successfully' };
  }

 
  @Post('clear')
  async clearDatabase() {
    await this.seedService.clearDatabase();
    return { message: 'Database cleared successfully' };
  }
}
