import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Employee } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: PrismaService) {}

  private async validateDepartmentId(departmentId?: number): Promise<void> {
    if (departmentId) {
      const department = await this.databaseService.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${departmentId} not found`,
        );
      } else {
        return;
      }
    }
  }

  private async validateProjectIds(projectIds?: number[]): Promise<void> {
    if (projectIds?.length) {
      const projects = await this.databaseService.project.findMany({
        where: { id: { in: projectIds } },
      });
      if (projects.length !== projectIds.length) {
        throw new NotFoundException('One or more project IDs are invalid');
      } else {
        return;
      }
    }
  }
  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    if (createEmployeeDto.departmentId) {
      await this.validateDepartmentId(createEmployeeDto.departmentId);
    }
    if (createEmployeeDto.departmentId) {
      await this.validateDepartmentId(createEmployeeDto.departmentId);
    }

    return await this.databaseService.employee.create({
      data: createEmployeeDto,
      include: {
        department: true,
        projects: true,
      },
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

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    await this.findOne(id);

    if (updateEmployeeDto.departmentId) {
      await this.validateDepartmentId(updateEmployeeDto.departmentId);
    }
    if (updateEmployeeDto.projectIds) {
      await this.validateProjectIds(updateEmployeeDto.projectIds);
    }

    return await this.databaseService.employee.update({
      where: { id },
      data: updateEmployeeDto,
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
