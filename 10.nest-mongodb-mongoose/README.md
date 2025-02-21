<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Docker Mongo Commands

When you start the `mongo` image, you can adjust the initialization of the MongoDB instance by passing one or more environment variables on the `docker run` command line. Do note that none of the variables below will have any effect if you start the container with a data directory that already contains a database: any pre-existing database will always be left untouched on container startup.

##### `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`

These variables, used in conjunction, create a new user and set that user's password. This user is created in the `admin `[authentication database⁠](https://docs.mongodb.com/manual/core/security-users/#user-authentication-database) and given [the role of `root`⁠](https://docs.mongodb.com/manual/reference/built-in-roles/#root), which is [a &#34;superuser&#34; role⁠](https://docs.mongodb.com/manual/core/security-built-in-roles/#superuser-roles).

The following is an example of using these two variables to create a MongoDB instance and then using the `mongosh` cli (use `mongo` with `4.x` versions) to connect against the `admin` authentication database.

```bash
$ docker run -d --network some-network --name some-mongo \
	-e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
	-e MONGO_INITDB_ROOT_PASSWORD=secret \
	-e MONGO_INITDB_DATABASE=testdb
	mongo

$ docker run -it --rm --network some-network mongo \
	mongosh --host some-mongo \
		-u mongoadmin \
		-p secret \
		--authenticationDatabase admin \
		some-db
> db.getName();
some-db
```

Both variables are required for a user to be created. If both are present then MongoDB will start with authentication enabled (`mongod --auth`).

Authentication in MongoDB is fairly complex, so more complex user setup is explicitly left to the user via `/docker-entrypoint-initdb.d/` (see the *Initializing a fresh instance* and *Authentication* sections below for more details).

##### `MONGO_INITDB_DATABASE`

This variable allows you to specify the name of a database to be used for creation scripts in `/docker-entrypoint-initdb.d/*.js` (see *Initializing a fresh instance* below). MongoDB is fundamentally designed for "create on first use", so if you do not insert data with your JavaScript files, then no database is created.






# BLOG APPLICATION STRUCTURE

In a blogging API, the `Post` resource is central, as it represents individual blog entries. However, a comprehensive blogging platform typically requires additional resources to manage various aspects of the system. Here are some key resources you might consider implementing:

**1. Users:**

* **Purpose:** Manage user accounts, including authors and readers.
* **Operations:**
  * **Create:** Register new users.
  * **Read:** Retrieve user profiles.
  * **Update:** Modify user information.
  * **Delete:** Remove user accounts.
* **Implementation:**
  * **Schema:** Define user attributes such as username, email, password (hashed), and role (e.g., author, reader).
  * **Authentication:** Implement JWT (JSON Web Token) for secure user authentication.
  * **Authorization:** Ensure that users can only perform actions permitted by their roles.

**2. Categories:**

* **Purpose:** Organize posts into thematic groups.
* **Operations:**
  * **Create:** Add new categories.
  * **Read:** List all categories.
  * **Update:** Edit category details.
  * **Delete:** Remove categories.
* **Implementation:**
  * **Schema:** Include fields like name and description.
  * **Association:** Link posts to categories to facilitate filtering and organization.

**3. Comments:**

* **Purpose:** Enable readers to engage with posts through comments.
* **Operations:**
  * **Create:** Post new comments.
  * **Read:** Retrieve comments for a specific post.
  * **Update:** Edit existing comments.
  * **Delete:** Remove comments.
* **Implementation:**
  * **Schema:** Include fields for content, author (referencing the User), and timestamps.
  * **Nested Comments:** Support threaded discussions by allowing comments to reference parent comments.

**4. Tags:**

* **Purpose:** Assign keywords to posts for better searchability.
* **Operations:**
  * **Create:** Add new tags.
  * **Read:** List all tags.
  * **Update:** Modify tag details.
  * **Delete:** Remove tags.
* **Implementation:**
  * **Schema:** Define tag name and description.
  * **Association:** Many-to-many relationship between posts and tags to allow multiple tags per post and vice versa.

**5. Media:**

* **Purpose:** Manage images, videos, and other media associated with posts.
* **Operations:**
  * **Upload:** Add new media files.
  * **Read:** Retrieve media details.
  * **Update:** Modify media information.
  * **Delete:** Remove media files.
* **Implementation:**
  * **Schema:** Include fields for file type, size, URL, and associated post.
  * **Storage:** Decide between local storage or cloud services (e.g., AWS S3) for media files.

**6. Likes and Dislikes:**

* **Purpose:** Allow users to express approval or disapproval of posts and comments.
* **Operations:**
  * **Create:** Add a like or dislike.
  * **Read:** Retrieve counts of likes and dislikes.
  * **Delete:** Remove a like or dislike.
* **Implementation:**
  * **Schema:** Track user ID, post/comment ID, and type (like or dislike).
  * **Validation:** Ensure users can only like or dislike once per post or comment.

**7. Notifications:**

* **Purpose:** Inform users about activities related to their posts or comments.
* **Operations:**
  * **Create:** Generate new notifications.
  * **Read:** Retrieve user notifications.
  * **Update:** Mark notifications as read.
  * **Delete:** Remove notifications.
* **Implementation:**
  * **Schema:** Include fields for type, message, associated user, and read status.
  * **Triggers:** Automatically create notifications for events like new comments on a user's post.

By incorporating these resources, you can build a robust and feature-rich blogging API that supports a wide range of functionalities, enhancing both user experience and system scalability.
