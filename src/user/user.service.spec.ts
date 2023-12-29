import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Token } from '../entities/token.entity';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const testUser: User = {
    id: 1,
    walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
    createdAt: new Date(),
    updatedAt: new Date(),
    tokens: [],
    nftProjects: [],
  };

  const mockUser: User = {
    id: 1,
    walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
    createdAt: new Date(),
    updatedAt: new Date(),
    tokens: [],
    nftProjects: [],
  };

  const mockToken: Token = {
    id: 1,
    name: 'USDC',
    symbol: 'USDC',
    price: 1,
    user: testUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNFT = {
    id: 1,
    name: 'Dreadfulz',
    description: 'Dreadfulz',
    price: 241401.11,
    user: testUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockUser.tokens.push(mockToken);
  mockUser.nftProjects.push(mockNFT);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        walletAddress: '0x14ca4C61019D789c7a3829F6788a8bf0B56AfC3E',
      };

      userRepository.create = jest.fn().mockReturnValue(mockUser);
      userRepository.save = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await userService.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
      };

      userRepository.create = jest.fn().mockReturnValue(mockUser);
      userRepository.save = jest.fn().mockRejectedValue({ code: '23505' }); // Simulate unique violation error

      // Act and Assert
      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        walletAddress: '0x56dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
      };

      userRepository.create = jest.fn().mockReturnValue(mockUser);
      userRepository.save = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      // Act and Assert
      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findUserById', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const userId = 1;

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await userService.findUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user is not found', async () => {
      // Arrange
      const userId = 2;

      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await userService.findUserById(userId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getUserTokens', () => {
    it('should return user tokens by ID', async () => {
      // Arrange
      const userId = 1;

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserTokens(userId);

      // Assert
      expect(result).toEqual([mockToken]);
    });
  });

  describe('getUserNFTProjects', () => {
    it('should return user NFT projects by ID', async () => {
      // Arrange
      const userId = 1;

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserNFTProjects(userId);

      // Assert
      expect(result).toEqual([mockNFT]);
    });
  });
});
