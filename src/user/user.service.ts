import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { NFTProject } from '../entities/nft-project.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = this.userRepository.create(createUserDto);
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        // '23505' is a Postgres error code for unique violation
        throw new ConflictException(
          'A user with this wallet address already exists.',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findUserById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserTokens(userId: number): Promise<Token[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tokens'],
    });
    return user ? user.tokens : null;
  }

  async getUserNFTProjects(userId: number): Promise<NFTProject[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['nftProjects'],
    });
    return user ? user.nftProjects : null;
  }
}
