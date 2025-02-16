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
pnpm add prisma
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

## Compile and run the project

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode
pnpm run start:prod
```

## Run tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
