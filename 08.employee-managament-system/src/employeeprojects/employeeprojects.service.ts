import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeprojectDto, UpdateEmployeeprojectDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmployeeprojectsService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeprojectDto: CreateEmployeeprojectDto) {
    const { employeeId, projectId } = createEmployeeprojectDto;
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
