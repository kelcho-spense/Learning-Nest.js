import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity'; // Adjust the import path as needed
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';

describe('UserController', () => {

    let usersController: UsersController;
    let usersService: UsersService;

    // Create a mock repository
    const mockUserRepository = {
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                }
            ],
        }).compile();

        usersService = moduleRef.get<UsersService>(UsersService);
        usersController = moduleRef.get<UsersController>(UsersController);
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users: User[] = [];
            // mock the service method
            jest.spyOn(usersService, 'findAll').mockImplementation(() => Promise.resolve(users));

            const results = await usersController.findAll();
            expect(results).toEqual(results);
            expect(usersService.findAll).toHaveBeenCalledWith();
            //failing test
            // expect(results).toBeNull();
            // expect(usersService.findAll).not.toHaveBeenCalled();
        });
    })

    describe('findOne', () => {
        it('should return a user', async () => {
            const id = randomUUID();
            const mockProfile: Profile = {
                id: id,
                bio: 'Test Bio',
                avatar: 'test.jpg',
                dateOfBirth: new Date(),
                location: 'Test Location',
                user: User.prototype,
            };
            
            const result: User = {
                id: id,
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                profile: mockProfile,
                bookReviews: []
            };

            // mock the service method
            jest.spyOn(usersService, 'findOne').mockImplementation(() => Promise.resolve(result));

            const response = await usersController.findOne(id);
            expect(response).toEqual(result);
            expect(usersService.findOne).toHaveBeenCalledWith(id);
            //failing test
            // expect(response).toBeNull();
            // expect(usersService.findOne).not.toHaveBeenCalled();
            // expect(await usersController.findOne("1")).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a user', async () => {
            // Create a user DTO (what would be sent in the request)
            const createUserDto = {
                name: 'Test User',
                email: 'test@mail.com',
                password: 'password',
            };

            // Create the expected result
            const mockProfile: Profile = {
                id: randomUUID(),
                bio: 'Test Bio',
                avatar: 'test.jpg',
                dateOfBirth: new Date(),
                location: 'Test Location',
                user: User.prototype,
            };

            const result: User = {
                id: randomUUID(),
                name: 'Test User',
                email: 'test@mail.com',
                password: 'password',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                profile: mockProfile,
                bookReviews: []
            };

            // Mock the service method
            jest.spyOn(usersService, 'create').mockResolvedValue(result);

            // Call the controller method and verify the result
            const response = await usersController.create(createUserDto);
            expect(response).toEqual(result);
            expect(usersService.create).toHaveBeenCalledWith(createUserDto);

            // failing test
            // expect(response).toBeNull();
            // expect(usersService.create).not.toHaveBeenCalled();
            // expect(usersService.create).toHaveBeenCalledWith({ name: 'Test User', email: 'test@mail.com'});
        });
    });
});