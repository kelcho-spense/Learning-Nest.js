import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private projectService: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return await this.projectService.project.create({
      data: createProjectDto,
    });
  }
  async createMany(createProjectDto: CreateProjectDto[]) {
    return await this.projectService.project.createMany({
      data: createProjectDto,
      skipDuplicates: true,
    });
  }

  async findAll() {
    return await this.projectService.project.findMany({
      include: {
        employees: true,
      },
    });
  }

  async findOne(id: number) {
    const project = await this.projectService.project.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  private async findById(id: number) {
    const project = await this.projectService.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.findById(id);
    return await this.projectService.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return await this.projectService.project.delete({
      where: { id },
    });
  }
}
