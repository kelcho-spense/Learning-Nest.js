# WebSocket Chat Application with NestJS

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Overview

This project is a real-time chat application built with NestJS and WebSockets (using Socket.IO). It supports:

- Group chats
- Private messaging
- User presence detection
- Real-time message delivery

## Prerequisites

- Node.js (v18+)
- pnpm (or npm/yarn)
- Basic knowledge of TypeScript, NestJS, and WebSockets

## Getting Started

```bash
# Install dependencies
$ pnpm install

# Run the application
$ pnpm run start:dev
```

Then open your browser and navigate to http://localhost:3000 to use the application.

## Building the Application Step by Step

### 1. Create a New NestJS Project

```bash
# Install NestJS CLI
$ npm i -g @nestjs/cli

# Create a new project
$ nest new gatewayapp
$ cd gatewayapp
```

### 2. Install WebSocket Dependencies

```bash
$ pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### 3. Create the Events Module Structure

```bash
$ nest generate module events
$ nest generate service events
```

### 4. Create the WebSocket Gateway

Create a gateway file at `src/events/events.gateway.ts`:

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsResponse
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('EventsGateway');
  
  constructor(private readonly eventsService: EventsService) {}

  @WebSocketServer()
  server: Server;

  // Gateway lifecycle hooks
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const username = this.eventsService.getUser(client.id);
    this.eventsService.removeUser(client.id);
  
    // Broadcast updated user list
    this.server.emit('users', this.eventsService.getAllUsers());
  
    if (username) {
      this.server.emit('userLeft', username);
    }
  }

  // Message handlers
  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
    this.eventsService.addUser(client.id, username);
  
    // Notify everyone about the new user
    this.server.emit('userJoined', username);
  
    // Send updated user list to all clients
    this.server.emit('users', this.eventsService.getAllUsers());
  }

  // Add other message handlers for creating groups, joining groups, sending messages, etc.
}
```

### 5. Implement the Events Service

The events service manages users, groups, and messages:

```typescript
@Injectable()
export class EventsService {
  private readonly users: Map<string, string> = new Map();
  private readonly userObjects: Map<string, User> = new Map();
  private readonly groups: Map<string, ChatGroup> = new Map();
  private readonly clientGroups: Map<string, string[]> = new Map();

  // User management methods
  addUser(clientId: string, username: string): void {
    this.users.set(clientId, username);
    this.userObjects.set(clientId, { clientId, username });
    this.clientGroups.set(clientId, []);
  }

  removeUser(clientId: string): void {
    // Handle user removal and cleanup
  }

  // Group management methods
  createGroup(groupId: string, groupName: string, creatorClientId: string): ChatGroup {
    // Create and return a new group
  }

  joinGroup(groupId: string, clientId: string): ChatGroup {
    // Add user to group and return the updated group
  }

  // Data retrieval methods
  getAllUsers(): string[] {
    return Array.from(this.users.values());
  }

  // Add other methods for managing users, groups, and messages
}
```

### 6. Create the HTML/CSS Frontend

Create a simple HTML file with Socket.IO client to connect to the WebSocket server:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chat Application</title>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <div class="login-container" id="login-container">
    <h2>Join Chat</h2>
    <input type="text" id="username-input" placeholder="Enter your username">
    <button id="login-button">Join</button>
  </div>

  <div class="chat-container" id="chat-container" style="display: none;">
    <!-- Chat interface elements -->
  </div>

  <script>
    const socket = io('http://localhost:3000');
  
    // Connect to the WebSocket server
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    // Handle login and other events
    document.getElementById('login-button').addEventListener('click', () => {
      const username = document.getElementById('username-input').value.trim();
      if (username) {
        socket.emit('join', username);
        // Show chat interface, hide login
      }
    });

    // Handle incoming messages and other events
    socket.on('userJoined', (username) => {
      console.log(`${username} joined the chat`);
    });
  
    // Add more event handlers for messages, groups, etc.
  </script>
</body>
</html>
```

### 7. Update the Main Application File

Update the `main.ts` file to serve the static HTML file:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### 8. Configure the App Module

Update `app.module.ts` to include the events module and serve the static files:

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    EventsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
      exclude: ['/api*'],
    }),
  ],
})
export class AppModule {}
```

## Features

- **User Authentication**: Simple username-based authentication
- **Group Chats**: Create and join group chats
- **Private Messaging**: Send messages directly to other users
- **Real-time Updates**: Instantly see new messages and user status changes
- **User Presence**: See who's online and when users join or leave

## Project Structure

```
gatewayapp/
├── src/
│   ├── events/
│   │   ├── events.gateway.ts    # WebSocket gateway with message handlers
│   │   ├── events.service.ts    # Service managing users, groups, and messages
│   │   └── events.module.ts     # Module configuration
│   ├── app.module.ts            # Main application module
│   └── main.ts                  # Application entry point
├── index.html                   # Frontend interface
└── package.json                 # Project dependencies
```

## Next Steps

- Add message persistence with a database
- Implement user authentication with JWT
- Add file sharing capabilities
- Implement typing indicators
- Add read receipts for messages

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebSockets in NestJS](https://docs.nestjs.com/websockets/gateways)

## Understanding WebSockets

### What Are WebSockets?

WebSockets provide a persistent connection between a client and server, allowing for bi-directional, real-time data transfer. Unlike traditional HTTP:

- **HTTP**: Request-response model. The client sends a request, the server responds, and the connection closes.
- **WebSockets**: Full-duplex communication. After initial handshake, both client and server can send messages at any time without needing to re-establish the connection.

### How WebSockets Work

1. **Connection Establishment**:
   - The client initiates a regular HTTP request with an "Upgrade" header to switch to WebSocket protocol
   - The server confirms the protocol switch
   - The HTTP connection is upgraded to a WebSocket connection that remains open

2. **Data Exchange**:
   - Both client and server can send messages at any time
   - Messages can be sent without waiting for a response
   - No need to constantly re-establish the connection

3. **Real-time Updates**:
   - Server can push data to clients the moment it becomes available
   - Clients don't need to poll the server for updates

### Socket.IO in This Application

[Socket.IO](https://socket.io/) is a library that enables real-time, bidirectional communication between web clients and servers. In our application:

#### Server-Side (NestJS)

1. **Gateway Class**: `EventsGateway` serves as our WebSocket server, handling connections and messages.
   ```typescript
   @WebSocketGateway({
     cors: { origin: '*' } // Allow connections from any origin
   })
   export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
     // ...implementation
   }
   ```

2. **Lifecycle Hooks**:
   - `afterInit()`: Called once when the gateway is initialized
   - `handleConnection()`: Called when a client connects
   - `handleDisconnect()`: Called when a client disconnects

3. **Message Handlers**: Methods decorated with `@SubscribeMessage()` handle specific message types:
   ```typescript
   @SubscribeMessage('join')
   handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
     // Handle join message
   }
   ```

4. **Broadcasting**: The server can send messages to all connected clients or specific clients:
   ```typescript
   // To all clients
   this.server.emit('userJoined', username);
   
   // To a specific client
   client.emit('privateMessage', message);
   
   // To a group of clients in a "room"
   this.server.to(`group:${groupId}`).emit('groupMessage', messageData);
   ```

#### Client-Side (Browser)

1. **Connection**: The browser connects to the WebSocket server:
   ```javascript
   const socket = io('http://localhost:3000');
   
   socket.on('connect', () => {
     console.log('Connected to server');
   });
   ```

2. **Sending Messages**: The client can send messages to the server:
   ```javascript
   socket.emit('join', username);
   socket.emit('groupMessage', { groupId, message });
   ```

3. **Receiving Messages**: The client sets up listeners for different message types:
   ```javascript
   socket.on('userJoined', (username) => {
     addSystemMessage(`${username} joined the chat`);
   });
   
   socket.on('groupMessage', (data) => {
     addChatMessage(data);
   });
   ```

### Message Flow in Chat Application

1. **User Authentication**:
   - User enters username in browser
   - Browser sends 'join' message to server
   - Server registers user and broadcasts 'userJoined' to all clients
   - Server sends updated user list to all clients

2. **Group Chat**:
   - User creates a group: 'createGroup' message to server
   - Server creates group and broadcasts 'groupCreated' to all clients
   - User joins a group: 'joinGroup' message to server
   - Server adds user to group and notifies group members
   - User sends message: 'groupMessage' message to server
   - Server broadcasts message to all users in that group

3. **Private Messaging**:
   - User selects another user to chat with
   - User sends 'privateMessage' to server with recipient
   - Server forwards message only to the intended recipient

### Benefits of WebSockets in This Chat App

1. **Instantaneous Communication**: Messages appear immediately without refreshing
2. **Reduced Server Load**: No constant polling for new messages
3. **Lower Latency**: Persistent connection eliminates TCP handshake overhead
4. **Real-time Updates**: User presence, typing indicators, and message delivery status
5. **Efficient**: Less bandwidth usage compared to HTTP polling

### WebSocket Rooms (Socket.IO Feature)

Rooms are an important Socket.IO concept used in this application:

- **What**: A room is a server-side concept that allows grouping of connected clients
- **Why**: Useful for broadcasting messages to a subset of clients (e.g., everyone in a chat room)
- **How**: 
  ```typescript
  // Server: Add a client to a room
  client.join(`group:${groupId}`);
  
  // Server: Send message to all in a room
  this.server.to(`group:${groupId}`).emit('groupMessage', message);
  
  // Server: Remove a client from a room
  client.leave(`group:${groupId}`);
  ```

### Error Handling in WebSockets

Unlike HTTP where errors are sent as status codes, WebSockets use custom events:

```typescript
// Server-side error handling
@SubscribeMessage('joinGroup')
handleJoinGroup(@MessageBody() data): WsResponse<any> {
  try {
    // Join group logic
    return { event: 'joinedGroup', data: result };
  } catch (error) {
    return { event: 'error', data: { message: error.message } };
  }
}

// Client-side error handling
socket.on('error', (error) => {
  alert(error.message);
});
```
