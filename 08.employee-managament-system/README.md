<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Employee Management System

### Tech Stack

* Nest
* Prisma ORM
* PostgresSQL

### Prisma ORM Cheat Sheet

## Project setup

```bash
pnpm add prisma @prisma/client
```

## Prisma ORM Commands

```
# set up your Prisma ORM project by creating your Prisma Schema
npx prisma init
```

## Docker Compose Commands

* Start Services

  ```
  docker-compose up

  ```
* Start Services in Detached Mode (in background)

  ```
  docker-compose up -d
  ```
* Check running Containers

  ```
  docker-compose ps
  ```
* Stop Services

  ```
  docker-compose down

  ```
* Rebuild and Restart Services

  ```
  docker-compose up --build
  ```
* Build Images

  ```
  docker-compose build
  ```

## Prisma Migration Commands

```bash
# Running migration 

npx prisma migrate dev --name init

# 1. This command generates and applies a new migration based on your Prisma schema changes 
# (This command also includes checks for applying migrations in a controlled manner, ensuring data integrity)

npx prisma db push

# 2. This command is used to push your current Prisma schema to the database directly 
# (It can overwrite data if your schema changes affect existing tables or columns, so it’s best for early-stage development or prototyping.)
```

### **PostgreSQL CLI**

Here are the CLI commands to check the created tables in your PostgreSQL database. First, connect to the database container, then use psql to inspect the tables:

1. **Connect to the PostgreSQL container:**

```bash
docker exec -it employee-db-container psql -U postgres -d employee-db
```

2. **Once inside psql, you can use these commands to inspect your database:**

```bash
-- List all tables in the current schema
\dt

-- List all schemas
\dn

-- Show all tables with their sizes and descriptions
\dt+

-- Exit psql
\q
```

## Nest CLI Compile and run the project

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode
pnpm run start:prod
```

## Nest CLI Generating Files

```bash
# Generate a New Module
nest g module <module-name>

# Generate a New Controller
nest g controller <controller-name>

# Generate a New Service
nest g service <service-name>

# Generate a New Resource (Module + Controller + Service)
nest g middleware <middleware-name>

# Generate a New Middleware
nest g middleware <middleware-name>

# Generate a New Guard
nest g guard <guard-name>

# Generate a New Interface
nest g interface <interface-name>

# Generate a New Enum
nest g enum <enum-name>
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
