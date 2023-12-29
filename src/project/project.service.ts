import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async trackProject(
    createProjectDto: CreateProjectDto,
    user: User,
  ): Promise<Project> {
    try {
      const project = this.projectRepository.create({
        name: createProjectDto.name,
        description: createProjectDto.description,
        price: createProjectDto.price,
        user: user,
      });

      return await this.projectRepository.save(project);
    } catch (error) {
      throw new Error('Failed to create a new project.');
    }
  }

  async getUserDashboard(user: User): Promise<Project[]> {
    try {
      return this.projectRepository.find({ where: { user } });
    } catch (error) {
      throw new Error('Failed to fetch user projects.');
    }
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    try {
      return this.projectRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error('Failed to fetch project by ID.');
    }
  }
}
