import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UnauthorizedException,
  HttpException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login endpoint' })
  @HttpCode(HttpStatus.OK) // Setting the HTTP status code to 200 for the login endpoint
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ) {
    try {
      const user = await this.authService.validateUser(
        loginDto.walletAddress,
        loginDto.signature,
      );
      if (user) {
        const token = await this.authService.login(user.walletAddress);
        return { ...token, userId: user.id };
      } else {
        throw new UnauthorizedException('Authentication failed.');
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token endpoint' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req) {
    // Assuming you have user information in the request after successful guard check
    const newToken = await this.authService.login(req.user.walletAddress);
    return newToken;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout endpoint' })
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
