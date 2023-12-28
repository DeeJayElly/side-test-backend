import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user endpoint' })
  async createUser(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createUserDto: CreateUserDto,
  ) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id endpoint' })
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  @Get(':id/tokens')
  @ApiOperation({ summary: 'Get user tokens endpoint' })
  @UseGuards(AuthGuard('jwt'))
  async getTokens(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserTokens(id);
  }

  @Get(':id/nft-projects')
  @ApiOperation({ summary: 'Get user NFTs endpoint' })
  @UseGuards(AuthGuard('jwt'))
  async getNFTProjects(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserNFTProjects(id);
  }
}
