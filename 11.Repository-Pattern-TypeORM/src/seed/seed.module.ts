import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Book, Author])], // Adjust entities based on your project
    providers: [SeedService],
    controllers: [SeedController],
})
export class SeedModule { }
