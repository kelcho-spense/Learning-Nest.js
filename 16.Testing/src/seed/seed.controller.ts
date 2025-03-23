import { Controller, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('all')
  async seedAll() {
    await this.seedService.seedAll();
    return { message: 'All data seeded successfully' };
  }

  @Get('users')
  async seedUsers() {
    await this.seedService.seedUsers();
    return { message: 'Users seeded successfully' };
  }

  @Get('authors')
  async seedAuthors() {
    await this.seedService.seedAuthors();
    return { message: 'Authors seeded successfully' };
  }

  @Get('books')
  async seedBooks() {
    await this.seedService.seedBooks();
    return { message: 'Books seeded successfully' };
  }

  @Get('profiles')
  async seedProfiles() {
    await this.seedService.seedProfiles();
    return { message: 'Profiles seeded successfully' };
  }

  @Get('categories')
  async seedCategories() {
    await this.seedService.seedCategories();
    return { message: 'Categories seeded successfully' };
  }

  @Get('book-reviews')
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
