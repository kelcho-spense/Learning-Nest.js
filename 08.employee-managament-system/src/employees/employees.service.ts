import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Employee } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: PrismaService) {}

  private async validateDepartmentId(departmentId: number): Promise<void> {
    const department = await this.databaseService.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with id ${departmentId} not found`,
      );
    }
  }

  private async validateProjectIds(projectIds: number[]): Promise<void> {
    const projects = await Promise.all(
      projectIds.map(async (projectId) => {
        const project = await this.databaseService.project.findUnique({
          where: { id: projectId },
        });
        return { id: projectId, exists: !!project };
      }),
    );

    const invalidIds = projects
      .filter((project) => !project.exists)
      .map((project) => project.id);

    if (invalidIds.length > 0) {
      throw new NotFoundException(
        `Projects with ids ${invalidIds.join(', ')} not found`,
      );
    }
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { departmentId, projectIds } = createEmployeeDto;

    if (departmentId) {
      await this.validateDepartmentId(departmentId);
    }

    if (projectIds && projectIds.length > 0) {
      await this.validateProjectIds(projectIds);
    }

    return await this.databaseService.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll(): Promise<Employee[]> {
    return await this.databaseService.employee.findMany({
      include: {
        department: true,
        projects: true,
      },
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.databaseService.employee.findUnique({
      where: { id },
      include: {
        department: true,
        projects: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const { departmentId, projectId, ...rest } = updateEmployeeDto;

    return await this.databaseService.employee.update({
      where: { id },
      data: {
        ...rest,
        department: departmentId
          ? {
              connect: { id: departmentId },
            }
          : undefined,
        projects: projectId
          ? {
              connect: { id: projectId },
            }
          : undefined,
      },
    });
  }

  async remove(id: number): Promise<Employee> {
    await this.findOne(id);

    return await this.databaseService.employee.delete({
      where: { id },
      include: {
        department: true,
        projects: true,
      },
    });
  }
}
