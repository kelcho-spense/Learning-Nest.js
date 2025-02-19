# Database Schema & Relationships Guide

## Prisma Configuration

### Setup
1. The database configuration is initialized in `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Database Connection
- Connection is managed through `PrismaService`:
```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
}
```

## Entity Relationships

### 1. Employee Entity
```prisma
model Employee {
  id               Int                @id @default(autoincrement())
  name             String
  email            String             @unique
  departmentId     Int?
  department       Department?        @relation("DepartmentEmployees")
  projects         Project[]          @relation("EmployeeProjects")
  EmployeeProjects EmployeeProjects[]
}
```
- Primary Key: `id` (Auto-incrementing)
- Unique Constraint: `email`
- Foreign Key: `departmentId` references Department
- Relationships:
  - One-to-Many with Department (Many employees belong to one department)
  - Many-to-Many with Projects (through EmployeeProjects)

### 2. Department Entity
```prisma
model Department {
  id        Int        @id @default(autoincrement())
  name      String
  employees Employee[] @relation("DepartmentEmployees")
}
```
- Primary Key: `id` (Auto-incrementing)
- One-to-Many relationship with Employee

### 3. Project Entity
```prisma
model Project {
  id               Int                @id @default(autoincrement())
  name             String
  employees        Employee[]         @relation("EmployeeProjects")
  EmployeeProjects EmployeeProjects[]
}
```
- Primary Key: `id` (Auto-incrementing)
- Many-to-Many relationship with Employee

### 4. EmployeeProjects (Junction Table)
```prisma
model EmployeeProjects {
  employeeId Int
  projectId  Int
  employee   Employee @relation(fields: [employeeId], references: [id])
  project    Project  @relation(fields: [projectId], references: [id])

  @@id([employeeId, projectId])
}
```
- Composite Primary Key: `[employeeId, projectId]`
- Manages Many-to-Many relationship between Employee and Project

## Relationship Examples in Queries

### 1. Creating Related Records
```typescript
// Creating an employee with department and projects
async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
  const { departmentId, projectIds, ...rest } = createEmployeeDto;
  return await this.databaseService.employee.create({
    data: {
      ...rest,
      department: departmentId 
        ? { connect: { id: departmentId } }
        : undefined,
      projects: projectIds
        ? { connect: projectIds.map((projectId) => ({ id: projectId })) }
        : undefined,
    },
    include: {
      department: true,
      projects: true,
    },
  });
}
```

### 2. Fetching Related Data
```typescript
// Finding an employee with related department and projects
async findOne(id: number): Promise<Employee> {
  return await this.databaseService.employee.findUnique({
    where: { id },
    include: {
      department: true,
      projects: true,
    },
  });
}
```

### 3. Updating Relationships
```typescript
// Updating employee's department and projects
async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
  const { departmentId, projectIds, ...rest } = updateEmployeeDto;
  return await this.databaseService.employee.update({
    where: { id },
    data: {
      ...rest,
      department: departmentId
        ? { connect: { id: departmentId } }
        : undefined,
      projects: projectIds
        ? { set: projectIds.map((projectId) => ({ id: projectId })) }
        : undefined,
    },
  });
}
```

## Best Practices

1. **Foreign Key Validation**: Always validate foreign keys before creating/updating records:
```typescript
private async validateDepartmentId(departmentId: number): Promise<void> {
  const department = await this.databaseService.department.findUnique({
    where: { id: departmentId },
  });
  if (!department) {
    throw new NotFoundException(`Department with id ${departmentId} not found`);
  }
}
```

2. **Include Related Data**: Use the `include` option to fetch related data when needed:
```typescript
const result = await prisma.employee.findMany({
  include: {
    department: true,
    projects: true,
  },
});
```

3. **Composite Keys**: Use composite keys for junction tables:
```prisma
@@id([employeeId, projectId])
```

4. **Cascade Deletes**: Consider the impact of deleting records with relationships and handle them appropriately in your service methods.

## Common Prisma Operations

1. **Create**: `create`, `createMany`
2. **Read**: `findUnique`, `findMany`
3. **Update**: `update`, `updateMany`
4. **Delete**: `delete`, `deleteMany`
5. **Relationship Operations**: `connect`, `disconnect`, `set`

## Relationship Operations in Detail

### 1. Connect Operation
Used to establish relationships between existing records.

```typescript
// Connect an employee to an existing department
await prisma.employee.update({
  where: { id: employeeId },
  data: {
    department: {
      connect: { id: departmentId }
    }
  }
});

// Connect multiple projects to an employee
await prisma.employee.update({
  where: { id: employeeId },
  data: {
    projects: {
      connect: [
        { id: projectId1 },
        { id: projectId2 }
      ]
    }
  }
});
```

### 2. Disconnect Operation
Removes relationships without deleting the records.

```typescript
// Disconnect an employee from their department
await prisma.employee.update({
  where: { id: employeeId },
  data: {
    department: {
      disconnect: true
    }
  }
});

// Disconnect specific projects from an employee
await prisma.employee.update({
  where: { id: employeeId },
  data: {
    projects: {
      disconnect: [
        { id: projectId1 },
        { id: projectId2 }
      ]
    }
  }
});
```

### 3. Set Operation
Replaces all existing relationships with new ones.

```typescript
// Replace all projects of an employee with new ones
await prisma.employee.update({
  where: { id: employeeId },
  data: {
    projects: {
      set: [
        { id: newProjectId1 },
        { id: newProjectId2 }
      ]
    }
  }
});

// Remove all project assignments
await prisma.employee.update({
  where: { id: employeeId },
  data: {
    projects: {
      set: [] // Empty array removes all relationships
    }
  }
});
```

### Example: Managing Multiple Relationship Types

```typescript
// Complex update with multiple relationship operations
async function transferEmployee(
  employeeId: number,
  newDepartmentId: number,
  newProjectIds: number[]
) {
  return await prisma.employee.update({
    where: { id: employeeId },
    data: {
      // Change department
      department: {
        connect: { id: newDepartmentId }
      },
      // Replace all project assignments
      projects: {
        set: newProjectIds.map(id => ({ id }))
      }
    },
    include: {
      department: true,
      projects: true
    }
  });
}

// Managing many-to-many relationships through junction table
async function assignProjectToEmployees(
  projectId: number,
  employeeIds: number[]
) {
  return await prisma.project.update({
    where: { id: projectId },
    data: {
      EmployeeProjects: {
        createMany: {
          data: employeeIds.map(employeeId => ({
            employeeId
          })),
          skipDuplicates: true
        }
      }
    }
  });
}
```

### Best Practices for Relationship Operations

1. **Transaction Safety**
```typescript
// Wrap multiple relationship changes in a transaction
const [updatedDepartment, updatedProjects] = await prisma.$transaction([
  prisma.employee.update({
    where: { id: employeeId },
    data: {
      department: {
        connect: { id: newDepartmentId }
      }
    }
  }),
  prisma.employee.update({
    where: { id: employeeId },
    data: {
      projects: {
        set: newProjectIds.map(id => ({ id }))
      }
    }
  })
]);
```

2. **Validation Before Operations**
```typescript
async function validateRelationshipUpdate(
  employeeId: number,
  departmentId: number,
  projectIds: number[]
) {
  // Validate employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  if (!employee) throw new Error('Employee not found');

  // Validate department exists
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  });
  if (!department) throw new Error('Department not found');

  // Validate all projects exist
  const projects = await prisma.project.findMany({
    where: {
      id: {
        in: projectIds
      }
    }
  });
  if (projects.length !== projectIds.length) {
    throw new Error('Some projects not found');
  }
}
```

3. **Handling Cascading Effects**
```typescript
// Consider cascading effects when disconnecting relationships
async function cleanupEmployeeAssignments(employeeId: number) {
  await prisma.$transaction([
    // Remove from projects first
    prisma.employeeProjects.deleteMany({
      where: { employeeId }
    }),
    // Then update employee record
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        department: {
          disconnect: true
        }
      }
    })
  ]);
}
```
