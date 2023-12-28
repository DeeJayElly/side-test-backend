import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../entities/user.entity';

describe('UserController', () => {
  let userController: UserController;

  const mockUser: User = {
    id: 1,
    walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
    createdAt: new Date(),
    updatedAt: new Date(),
    tokens: [],
    nftProjects: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockUser),
            findUserById: jest.fn().mockResolvedValue(mockUser),
            getUserTokens: jest.fn().mockResolvedValue([]),
            getUserNFTProjects: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        walletAddress: '0x33dd5A61019D789c7a3829F6788a8bf0B56AfC3E',
      };

      // Act
      const result = await userController.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const userId = 1;

      // Act
      const result = await userController.getUser(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });

  describe('getTokens', () => {
    it('should return user tokens by ID', async () => {
      // Arrange
      const userId = 1;

      // Act
      const result = await userController.getTokens(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getNFTProjects', () => {
    it('should return user NFT projects by ID', async () => {
      // Arrange
      const userId = 1;

      // Act
      const result = await userController.getNFTProjects(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
