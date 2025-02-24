# NestJS MongoDB Mongoose Blog Tutorial

This document serves as a walk‑through for setting up the blog project and using the key modules: Users, Posts, and Comments.

---

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [pnpm](https://pnpm.io/) package manager
- MongoDB running (locally or via Docker)
- NestJS CLI: `npm install -g @nestjs/cli`

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


### 1. Create a New NestJS Project

Generate the project and change to its directory:

```bash
nest new nest-mongodb-mongoose
cd nest-mongodb-mongoose
```

2. Install required dependencies:

```bash
npm install @nestjs/mongoose mongoose
```

## Database Connection

1. Update `app.module.ts`:

```typescript
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/blog')
  ]
})
```

## Creating the User Module

1. Generate the user module:

```bash
nest g module user
nest g controller user
nest g service user
```

2. Create user schema (`user/schemas/user.schema.ts`):

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

## Creating the Post Module

1. Generate the post module:

```bash
nest g module post
nest g controller post
nest g service post
```

2. Create post schema (`post/schemas/post.schema.ts`):

```typescript
@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;
}
```

## Creating the Comment Module

1. Generate the comment module:

```bash
nest g module comment
nest g controller comment
nest g service comment
```

2. Create comment schema (`comment/schemas/comment.schema.ts`):

```typescript
@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: Post;
}
```

## API Endpoints

### User Endpoints

```typescript
// Create user
POST /user
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}

// Get user
GET /user/:id
```

### Post Endpoints

```typescript
// Create post
POST /post
{
  "title": "My First Blog Post",
  "content": "This is the content of my post",
  "author": "userId"
}

// Get all posts
GET /post

// Get single post
GET /post/:id
```

### Comment Endpoints

```typescript
// Create comment
POST /comment
{
  "content": "Great post!",
  "author": "userId",
  "post": "postId"
}

// Get comments for post
GET /comment/post/:postId
```

## Example Usage

1. Create a user:

```bash
curl -X POST http://localhost:3000/user -H "Content-Type: application/json" -d '{"username":"john_doe","email":"john@example.com","password":"secret123"}'
```

2. Create a post:

```bash
curl -X POST http://localhost:3000/post -H "Content-Type: application/json" -d '{"title":"My First Post","content":"Hello World!","author":"userId"}'
```

3. Add a comment:

```bash
curl -X POST http://localhost:3000/comment -H "Content-Type: application/json" -d '{"content":"Great post!","author":"userId","post":"postId"}'
```

## Testing

Run tests using:

```bash
npm run test
```

For e2e tests:

```bash
npm run test:e2e
```

## Additional Notes

- Make sure MongoDB is running locally on port 27017
- Use proper error handling in production
- Implement authentication and authorization
- Add input validation using DTOs
- Consider implementing pagination for lists
