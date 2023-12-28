import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  const jwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('validateUser', () => {
    it('should return a user when validation is successful', async () => {
      // Arrange
      const walletAddress = '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E';
      const signature = 'valid_signature';

      const user = {
        id: 1,
        walletAddress,
      };

      const recoveredAddress = walletAddress;

      jest.spyOn(ethers, 'verifyMessage').mockReturnValueOnce(recoveredAddress);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

      // Act
      const result = await authService.validateUser(walletAddress, signature);

      // Assert
      expect(result).toEqual(user);
    });

    it('should create a new user when validation is successful and the user does not exist', async () => {
      // Arrange
      const walletAddress = '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E';
      const signature = 'valid_signature';
      const id = 1;

      const recoveredAddress = walletAddress;

      jest.spyOn(ethers, 'verifyMessage').mockReturnValueOnce(recoveredAddress);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValueOnce({ walletAddress, id });
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce({ id: 1, walletAddress });

      // Act
      const result = await authService.validateUser(walletAddress, signature);

      // Assert
      expect(result).toEqual({ id: 1, walletAddress });
    });

    it('should throw BadRequestException when signature is invalid', async () => {
      // Arrange
      const walletAddress = '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E';
      const signature = 'invalid_signature';

      jest.spyOn(ethers, 'verifyMessage').mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      // Act and Assert
      await expect(
        authService.validateUser(walletAddress, signature),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return an access token when login is successful', async () => {
      // Arrange
      const walletAddress = '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E';

      const access_token = 'valid_token';

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(access_token);

      // Act
      const result = await authService.login(walletAddress);

      // Assert
      expect(result).toEqual({ access_token });
    });

    it('should throw InternalServerErrorException when token generation fails', async () => {
      // Arrange
      const walletAddress = '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E';

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(null);

      // Act and Assert
      await expect(authService.login(walletAddress)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
