import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  ValidationPipe,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../entities/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('project')
@ApiTags('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track project endpoint' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async trackProject(
    @Body(new ValidationPipe())
    createProjectDto: CreateProjectDto,
    @GetUser() user: User, // Use the GetUser decorator to get the authenticated user
  ) {
    const project = await this.projectService.trackProject(
      createProjectDto,
      user,
    );
    return project;
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Dashboard data endpoint' })
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@GetUser() user: User) {
    const dashboard = await this.projectService.getUserDashboard(user);
    return dashboard;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by id endpoint' })
  @UseGuards(AuthGuard('jwt'))
  async getProjectById(@Param('id', ParseIntPipe) id: number) {
    const project = await this.projectService.getProjectById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}
