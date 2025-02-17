import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private databaseService: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    return this.databaseService.department.create({
      data: createDepartmentDto,
    });
  }

  async createMany(createDepartmentDto: CreateDepartmentDto[]) {
    return this.databaseService.department.createManyAndReturn({
      data: createDepartmentDto,
      skipDuplicates: true,
    });
  }

  async findAll() {
    return this.databaseService.department.findMany({
      include: {
        employees: true,
      },
    });
  }

  async searchDepartmentByName(name: string) {
    return this.databaseService.department.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive', // case-insensitive
        },
      },
      include: {
        employees: true,
      },
    });
  }

  async findOne(id: number) {
    const department = await this.databaseService.department.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

    return await this.databaseService.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.databaseService.department.delete({
      where: { id },
    });

    return `Department with ID ${id} has been deleted`;
  }

  async removeAll(ids: number[]) {
    // check if ids exist and delete the ones which exist and return error on the missing ones
    const departments = await this.databaseService.department.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (departments.length !== ids.length) {
      const missingIds = ids.filter(
        (id) => !departments.map((department) => department.id).includes(id),
      );
      throw new NotFoundException(
        `Departments with IDs ${missingIds.join(', ')} not found`,
      );
    }

    return await this.databaseService.department.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
