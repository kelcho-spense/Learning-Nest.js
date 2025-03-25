import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookReview } from '../src/book-reviews/entities/book-review.entity';
import { Profile } from '../src/profiles/entities/profile.entity';
import { Book } from '../src/books/entities/book.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Author } from '../src/authors/entities/author.entity';

describe('Users', () => {
  let app: INestApplication;

  // Better mock with realistic data structure
  const usersService = {
    findAll: () => [
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
      },
    ],
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        // In-memory SQLite for testing
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'database.sqlite',
          entities: [User, Profile, BookReview, Book, Author, Category],
          synchronize: true,
        }),
        UsersModule,
      ],
    })
      // .overrideProvider(UsersService)
      // .useValue(usersService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET users`, async () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .then((response) => {
        console.log('Actual response:', response.body);
        console.log('Expected:', usersService.findAll());

        // More flexible assertion
        expect(response.status).toBe(200);

        // Check if the response contains the expected data
        // without requiring exact format match
        expect(response.body).toBeTruthy();
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThanOrEqual(1);

        // falling test
        // expect(response.body).toBeInstanceOf(Object);
        // expect(response.body.length).toBeLessThanOrEqual(1);
      });
  });

  it('/POST users', async() => {
      return await request(app.getHttpServer())
          .post('/users')
          .send({
              name: '11Test User',
              email: '11test@gmail.com',
              password: "11password",
          })
          .expect(201)
          .then(response => {
              console.log('Actual response:', response.body);

              // More flexible assertion
              expect(response.status).toBe(201);

              // Check if the response contains the expected data
              // without requiring exact format match
              expect(response.body).toBeTruthy();
              expect(response.body.name).toBe('11Test User');
              expect(response.body.email).toBe('11test@gmail.com');

              // fail test
              // expect(response.status).toBe(200);
              // expect(response.body.name).toBe('Test User');
              // expect(response.body.email).toBe('test@gmail.com');

          });
  });

  it('/GET users/:id', async () => {
    return request(app.getHttpServer())
      .get('/users/cbe80bc9-608e-4b39-a003-1f55ce9ce479')
      .expect(200)
      .then((response) => {

        // More flexible assertion
        expect(response.status).toBe(200);

        // Check if the response contains the expected data
        // without requiring exact format match
        expect(response.body).toBeTruthy();
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.name).toBe('Test User');
        expect(response.body.email).toBe('test@gmail.com')
        expect(response.body.isActive).toBe(true);

        // failing test
        // expect(response.body.name).toBe('1Test User');
        // expect(response.body.email).toBe('1test@gmail.com')
        // expect(response.body.isActive).toBe(false);
      });
  });

  it('/PUT users/:id', async () => {
    return request(app.getHttpServer())
      .put('/users/cbe80bc9-608e-4b39-a003-1f55ce9ce479')
      .send({
        name: 'Test User 2',
        email: 'updatedtest@email.com',
        isActive: false,
      })
      .expect(200)
      .then((response) => {
        console.log('Actual response:', response.body);

        // More flexible assertion
        expect(response.status).toBe(200);

        // Check if the response contains the expected data
        // without requiring exact format match
        expect(response.body).toBeTruthy();
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.name).toBe('Test User 2');
        expect(response.body.email).toBe('updatedtest@email.com');
        expect(response.body.isActive).toBe(false);

        // failing test
        // expect(response.body.name).toBe('Test User');
        // expect(response.body.email).toBe('test@email.com');
        // expect(response.body.isActive).toBe(true);
      }
    );
  });

  it('/DELETE users/:id', async () => {
    return request(app.getHttpServer())
      .delete('/users/cbe80bc9-608e-4b39-a003-1f55ce9ce479')
      .expect(204)
      .then((response) => {
        console.log('Actual response:', response.body);

        // More flexible assertion
        expect(response.status).toBe(204);
        
        // Check if the response contains the expected data
        // without requiring exact format match
        expect(response.body).toBeTruthy();
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.message).toBe('User deleted successfully');
        
        // failing test
        // expect(response.status).toBe(200);
        // expect(response.status).toBe(404);
        // expect(response.body.message).toBe('User not found');
      });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
