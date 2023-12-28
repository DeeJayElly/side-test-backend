// auth.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(walletAddress: string, signature: string): Promise<User> {
    // The message that was signed on the client side
    const originalMessage =
      'Authentication your account while signing a message';

    // Recover the address from the signature
    try {
      const recoveredAddress = ethers.verifyMessage(originalMessage, signature);

      // If the recovered address matches the provided wallet address, the signature is valid

      if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
        let user = await this.userRepository.findOne({
          where: { walletAddress },
        });

        if (!user) {
          try {
            user = this.userRepository.create({ walletAddress });
            await this.userRepository.save(user);
          } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Unable to create user.');
          }
        }

        return user;
      }
    } catch (error) {
      throw new BadRequestException('Invalid signature or wallet address.');
    }
  }

  async login(walletAddress: string): Promise<{ access_token: string }> {
    try {
      const payload = { walletAddress };
      const access_token = this.jwtService.sign(payload);

      if (!access_token) {
        throw new InternalServerErrorException(
          'Failed to generate access token.',
        );
      }

      return { access_token };
    } catch (error) {
      // Log the error internally
      // console.error('Error during the login process:', error);

      // Throw an Internal Server Error Exception which will be caught by the global exception filter
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
