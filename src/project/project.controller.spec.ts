import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProjectController', () => {
  let projectController: ProjectController;
  let projectService: ProjectService;

  const mockUser: User = {
    id: 1,
    walletAddress: '0x23dd4C61019D789c7a3829F6788a8bf0B56AfC3E',
    createdAt: new Date(),
    updatedAt: new Date(),
    tokens: [],
    nftProjects: [],
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
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            trackProject: jest.fn(),
            getUserDashboard: jest.fn(),
            getProjectById: jest.fn(),
          },
        },
      ],
    }).compile();

    projectController = module.get<ProjectController>(ProjectController);
    projectService = module.get<ProjectService>(ProjectService);
  });

  describe('trackProject', () => {
    it('should track a project and return it', async () => {
      // Arrange
      const createProjectDto: CreateProjectDto = {
        name: 'Sample Project',
        description: 'Sample Description',
        price: 100,
      };

      jest
        .spyOn(projectService, 'trackProject')
        .mockResolvedValueOnce(mockProject);

      // Act
      const result = await projectController.trackProject(
        createProjectDto,
        mockUser,
      );

      // Assert
      expect(result).toEqual(mockProject);
    });
  });

  describe('getDashboard', () => {
    it('should get the dashboard data', async () => {
      // Arrange
      jest
        .spyOn(projectService, 'getUserDashboard')
        .mockResolvedValueOnce([mockProject]);

      // Act
      const result = await projectController.getDashboard(mockUser);

      // Assert
      expect(result).toEqual([mockProject]);
    });
  });

  describe('getProjectById', () => {
    it('should get a project by id', async () => {
      // Arrange
      const projectId = 1;
      jest
        .spyOn(projectService, 'getProjectById')
        .mockResolvedValueOnce(mockProject);

      // Act
      const result = await projectController.getProjectById(projectId);

      // Assert
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project is not found', async () => {
      // Arrange
      const projectId = 2;
      jest.spyOn(projectService, 'getProjectById').mockResolvedValueOnce(null);

      // Act and Assert
      await expect(projectController.getProjectById(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
