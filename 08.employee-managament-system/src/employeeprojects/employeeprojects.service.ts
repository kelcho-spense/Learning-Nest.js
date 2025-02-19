import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeprojectDto, UpdateEmployeeprojectDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmployeeprojectsService {
  constructor(private prisma: PrismaService) {}

  private async validateProjectId(projectId: number): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    } else {
      return true;
    }
  }

  private async validateEmployeeId(employeeId: number): Promise<boolean> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    } else {
      return true;
    }
  }

  async create(createEmployeeprojectDto: CreateEmployeeprojectDto) {
    const { employeeId, projectId } = createEmployeeprojectDto;
    await this.validateEmployeeId(employeeId);
    await this.validateProjectId(projectId);
    return this.prisma.employeeProjects.create({
      data: {
        employeeId,
        projectId,
      },
      include: {
        employee: true,
        project: true,
      },
    });
  }

  async findAll() {
    return this.prisma.employeeProjects.findMany({
      include: {
        employee: true,
        project: true,
      },
    });
  }

  async findOne(employeeId: number, projectId: number) {
    const assignment = await this.prisma.employeeProjects.findUnique({
      where: {
        employeeId_projectId: {
          employeeId,
          projectId,
        },
      },
      include: {
        employee: true,
        project: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Employee project assignment not found');
    }

    return assignment;
  }

  async update(
    employeeId: number,
    projectId: number,
    updateEmployeeprojectDto: UpdateEmployeeprojectDto,
  ) {
    await this.validateEmployeeId(employeeId);
    await this.validateProjectId(projectId);

    const assignment = await this.prisma.employeeProjects.update({
      where: {
        employeeId_projectId: {
          employeeId,
          projectId,
        },
      },
      data: updateEmployeeprojectDto,
      include: {
        employee: true,
        project: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Employee project assignment not found');
    }

    return assignment;
  }

  async remove(employeeId: number, projectId: number) {
    await this.validateEmployeeId(employeeId);
    await this.validateProjectId(projectId);

    return this.prisma.employeeProjects.delete({
      where: {
        employeeId_projectId: {
          employeeId,
          projectId,
        },
      },
    });
  }
}
