import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';

@Module({
  imports: [UsersModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
        database: process.env.USERS_DB_NAME || 'users.db',
        entities: [User],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
