import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let projectRepository: Repository<Project>;

  const mockUser: User = {
    id: 1,
    walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
    createdAt: new Date(),
    updatedAt: new Date(),
    tokens: [],
    nftProjects: [],
  };

  const mockCreateProjectDto: CreateProjectDto = {
    name: 'Sample Project',
    description: 'Sample Description',
    price: 100,
  };

  const mockProject: any = {
    id: 1,
    name: 'Sample Project',
    description: 'Sample Description',
    price: 100,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: 'ProjectRepository',
          useClass: Repository,
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
    projectRepository = module.get('ProjectRepository');
  });

  describe('trackProject', () => {
    it('should create and return a new project', async () => {
      // Arrange
      projectRepository.create = jest.fn().mockReturnValue(mockProject);
      projectRepository.save = jest.fn().mockResolvedValue(mockProject);

      // Act
      const result = await projectService.trackProject(
        mockCreateProjectDto,
        mockUser,
      );

      // Assert
      expect(result).toEqual(mockProject);
    });

    it('should throw an error when creating a project fails', async () => {
      // Arrange
      projectRepository.create = jest.fn().mockReturnValue(mockProject);
      projectRepository.save = jest
        .fn()
        .mockRejectedValue(new Error('DB error'));

      // Act and Assert
      await expect(
        projectService.trackProject(mockCreateProjectDto, mockUser),
      ).rejects.toThrowError('Failed to create a new project.');
    });
  });

  describe('getUserDashboard', () => {
    it('should return user projects', async () => {
      // Arrange
      projectRepository.find = jest.fn().mockResolvedValue([mockProject]);

      // Act
      const result = await projectService.getUserDashboard(mockUser);

      // Assert
      expect(result).toEqual([mockProject]);
    });

    it('should throw an error when fetching user projects fails', async () => {
      // Arrange
      projectRepository.find = jest
        .fn()
        .mockRejectedValue(new Error('Failed to fetch user projects.'));

      // Act and Assert
      await expect(
        projectService.getUserDashboard(mockUser),
      ).rejects.toThrowError('Failed to fetch user projects.');
    });
  });

  describe('getProjectById', () => {
    it('should return a project by ID', async () => {
      // Arrange
      const projectId = 1;
      projectRepository.findOne = jest.fn().mockResolvedValue(mockProject);

      // Act
      const result = await projectService.getProjectById(projectId);

      // Assert
      expect(result).toEqual(mockProject);
    });

    it('should return undefined when the project is not found', async () => {
      // Arrange
      const projectId = 2;
      projectRepository.findOne = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await projectService.getProjectById(projectId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw an error when fetching a project by ID fails', async () => {
      // Arrange
      const projectId = 1;
      projectRepository.findOne = jest
        .fn()
        .mockRejectedValue(new Error('Failed to fetch project by ID.'));

      // Act and Assert
      await expect(
        projectService.getProjectById(projectId),
      ).rejects.toThrowError('Failed to fetch project by ID.');
    });
  });
});
