import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { HttpException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const jwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        AuthService,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a token and userId when login is successful', async () => {
      // Arrange
      const loginDto: LoginDto = {
        walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
        signature: 'valid_signature',
      };

      const user = {
        id: 1,
        walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
      };

      const token = {
        access_token: 'valid_token',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(user);
      jest.spyOn(authService, 'login').mockResolvedValueOnce(token);

      // Act
      const result = await authController.login(loginDto);

      // Assert
      expect(result).toEqual({ ...token, userId: user.id });
    });

    it('should throw UnauthorizedException when login fails', async () => {
      // Arrange
      const loginDto: LoginDto = {
        walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
        signature: 'invalid_signature',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(null);

      // Act and Assert
      await expect(authController.login(loginDto)).rejects.toThrowError(
        'Authentication failed.',
      );
    });

    it('should throw HttpException when an error occurs', async () => {
      // Arrange
      const loginDto: LoginDto = {
        walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
        signature: 'valid_signature',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValueOnce(new Error('Validation error'));

      // Act and Assert
      await expect(authController.login(loginDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return a new token when refreshToken is successful', async () => {
      // Arrange
      const user = {
        id: 1,
        walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
      };

      const token = {
        access_token: 'new_token',
      };

      const req = { user };

      jest.spyOn(authService, 'login').mockResolvedValueOnce(token);

      // Act
      const result = await authController.refreshToken(req);

      // Assert
      expect(result).toEqual(token);
    });
  });

  describe('logout', () => {
    it('should return a success message when logout is called', async () => {
      // Act
      const result = await authController.logout();

      // Assert
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
