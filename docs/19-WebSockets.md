# WebSockets in NestJS: A Comprehensive Guide

## Table of Contents

1. [Introduction to WebSockets](#introduction-to-websockets)
2. [Setting Up WebSockets in NestJS](#setting-up-websockets-in-nestjs)
3. [Basic Gateway Implementation](#basic-gateway-implementation)
4. [Gateway Lifecycle Hooks](#gateway-lifecycle-hooks)
5. [Message Handling Patterns](#message-handling-patterns)
   - [Simple Responses](#simple-responses)
   - [Extracting Specific Data](#extracting-specific-data)
   - [Multiple Responses with Observables](#multiple-responses-with-observables)
   - [Asynchronous Responses](#asynchronous-responses)
6. [Working with Namespaces](#working-with-namespaces)
7. [Dependency Injection with Gateways](#dependency-injection-with-gateways)
8. [Client Implementation](#client-implementation)
9. [Best Practices](#best-practices)
10. [Complete Example](#complete-example)

## Introduction to WebSockets

WebSockets provide a persistent, full-duplex communication channel between a client and server over a single TCP connection. Unlike HTTP, which follows a request-response pattern, WebSockets allow both the client and server to send messages independently, enabling real-time applications.

Use cases for WebSockets include:
- Chat applications
- Live notifications
- Real-time dashboards
- Collaborative editing
- Gaming applications
- Live sports updates

## Setting Up WebSockets in NestJS

To use WebSockets in a NestJS application, you first need to install the required packages:

```bash
npm install --save @nestjs/websockets @nestjs/platform-socket.io
# or
pnpm add @nestjs/websockets @nestjs/platform-socket.io
```

NestJS has support for two WebSocket libraries out of the box:
- `socket.io`: A popular WebSocket library with additional features like fallback mechanisms
- `ws`: A lightweight WebSocket implementation

In this guide, we'll focus on using `socket.io`.

## Basic Gateway Implementation

In NestJS, WebSocket endpoints are defined using Gateway classes. A Gateway is simply a class decorated with the `@WebSocketGateway()` decorator.

Here's a basic example of a WebSocket gateway:

```typescript
import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  private logger: Logger = new Logger('EventsGateway');

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
    this.logger.log(`Received message: ${data} from client ${client.id}`);
    return data; // Echo the message back as acknowledgment
  }

  @SubscribeMessage('broadcast')
  handleBroadcast(@MessageBody() data: string): void {
    this.logger.log(`Broadcasting message: ${data}`);
    this.server.emit('broadcast', data);
  }
}
```

The key components are:

- `@WebSocketGateway()`: Marks the class as a WebSocket gateway
- `@WebSocketServer()`: Injects the Socket.io server instance
- `@SubscribeMessage()`: Defines a handler for a specific message event
- `@MessageBody()`: Extracts the payload from the client's message
- `@ConnectedSocket()`: Provides access to the client socket instance

After creating a gateway, you need to register it in a module:

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
})
export class EventsModule {}
```

And then import that module in your app module:

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule],
})
export class AppModule {}
```

## Gateway Lifecycle Hooks

NestJS provides lifecycle hooks for WebSocket gateways that allow you to perform actions when gateways are initialized or when clients connect or disconnect.

There are three lifecycle hooks available:

1. `OnGatewayInit`: Calls the `afterInit()` method after the gateway is initialized
2. `OnGatewayConnection`: Calls the `handleConnection()` method when a client connects
3. `OnGatewayDisconnect`: Calls the `handleDisconnect()` method when a client disconnects

Here's an example implementing all three hooks:

```typescript
import { 
  WebSocketGateway, 
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('EventsGateway');

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
```

## Message Handling Patterns

NestJS provides several patterns for handling WebSocket messages:

### Simple Responses

The simplest pattern is returning data directly from the handler function:

```typescript
@SubscribeMessage('message')
handleMessage(@MessageBody() data: string): string {
  return data; // Echo the message back as acknowledgment
}
```

When a client sends a message to the 'message' event, they'll receive the same data back as an acknowledgment.

### Extracting Specific Data

You can extract specific properties from the message payload:

```typescript
@SubscribeMessage('identify')
handleIdentify(@MessageBody('name') name: string): string {
  return `Hello, ${name}!`;
}
```

This extracts only the 'name' property from the message payload.

### Multiple Responses with Observables

For more complex scenarios, you can return a `WsResponse` object or an Observable that emits multiple `WsResponse` objects:

```typescript
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { WsResponse } from '@nestjs/websockets';

@SubscribeMessage('countdown')
handleCountdown(@MessageBody() count: number): Observable<WsResponse<number>> {
  const countdownArray = Array.from({ length: count }, (_, i) => count - i);
  
  return from(countdownArray).pipe(
    map(item => ({ 
      event: 'countdown', 
      data: item 
    }))
  );
}
```

This will send multiple countdown responses to the client, one after another.

### Asynchronous Responses

You can also use async/await for asynchronous operations:

```typescript
@SubscribeMessage('asyncOperation')
async handleAsync(@MessageBody() data: any): Promise<WsResponse<string>> {
  // Simulate an async operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    event: 'asyncResult',
    data: `Processed ${JSON.stringify(data)} asynchronously`
  };
}
```

## Working with Namespaces

Socket.io supports dividing your application into different namespaces, which act as separate communication channels. 

To create a gateway for a specific namespace, provide the namespace option:

```typescript
@WebSocketGateway({
  namespace: 'advanced',
  cors: {
    origin: '*',
  },
})
export class AdvancedGateway {
  // ...gateway implementation
}
```

Clients connect to this namespace using:

```javascript
const advancedSocket = io('http://localhost:3000/advanced');
```

Namespaces help organize your code and separate concerns. For example, you might have different namespaces for:
- Chat functionality
- Notifications
- Real-time data updates

## Dependency Injection with Gateways

One of the powerful features of NestJS is dependency injection, and it works seamlessly with gateways. You can inject services into your gateways:

```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway()
@Injectable()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
    this.eventsService.addUser(client.id, username);
    
    // Notify everyone about the new user
    this.server.emit('userJoined', username);
    
    // Send updated user list to all clients
    this.server.emit('users', this.eventsService.getAllUsers());
  }
}
```

This allows you to keep your business logic in services, making your code more maintainable and testable.

## Client Implementation

Here's a simple HTML/JavaScript client implementation that connects to both the default and 'advanced' namespaces:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NestJS WebSocket Client</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <h1>NestJS WebSocket Test Client</h1>
    
    <div>
        <h2>Basic Gateway</h2>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Type a message...">
        <button id="sendButton">Send</button>
        <button id="broadcastButton">Broadcast</button>
    </div>
    
    <div>
        <h2>Advanced Gateway</h2>
        <div id="advancedMessages"></div>
        <input type="text" id="nameInput" placeholder="Your name">
        <button id="identifyButton">Identify</button>
        <input type="number" id="countInput" value="5">
        <button id="countdownButton">Start Countdown</button>
    </div>

    <script>
        // Connect to the default namespace
        const socket = io('http://localhost:3000');
        
        // Connect to the advanced namespace
        const advancedSocket = io('http://localhost:3000/advanced');
        
        // Basic socket functions
        socket.on('connect', () => {
            addMessage('Connected to server');
        });
        
        socket.on('broadcast', (data) => {
            addMessage(`Broadcast received: ${data}`);
        });
        
        // Advanced socket functions
        advancedSocket.on('identified', (data) => {
            addAdvancedMessage(`Server response: ${data}`);
        });
        
        advancedSocket.on('countdown', (count) => {
            addAdvancedMessage(`Countdown: ${count}`);
        });
        
        // UI Event Handlers
        document.getElementById('sendButton').addEventListener('click', () => {
            const message = document.getElementById('messageInput').value;
            if (message) {
                socket.emit('message', message, (response) => {
                    addMessage(`Ack received: ${response}`);
                });
            }
        });
        
        document.getElementById('broadcastButton').addEventListener('click', () => {
            const message = document.getElementById('messageInput').value;
            if (message) {
                socket.emit('broadcast', message);
            }
        });
        
        document.getElementById('identifyButton').addEventListener('click', () => {
            const name = document.getElementById('nameInput').value;
            if (name) {
                advancedSocket.emit('identify', { name });
            }
        });
        
        document.getElementById('countdownButton').addEventListener('click', () => {
            const count = parseInt(document.getElementById('countInput').value) || 5;
            advancedSocket.emit('countdown', count);
        });
        
        // Helper functions
        function addMessage(message) {
            const messagesDiv = document.getElementById('messages');
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messagesDiv.appendChild(messageElement);
        }
        
        function addAdvancedMessage(message) {
            const messagesDiv = document.getElementById('advancedMessages');
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messagesDiv.appendChild(messageElement);
        }
    </script>
</body>
</html>
```

This client demonstrates:
- Connecting to different namespaces
- Sending and receiving messages
- Handling acknowledgments
- Working with different response patterns

## Best Practices

### 1. Structure

Organize your gateways by logical domains rather than by functionality. For example, create separate gateways for chat, notifications, and real-time updates.

### 2. Error Handling

Always implement error handling in your gateway methods:

```typescript
@SubscribeMessage('riskyOperation')
async handleRiskyOperation(@MessageBody() data: any): Promise<WsResponse<string>> {
  try {
    // Potentially risky operation
    const result = await this.someService.process(data);
    return { event: 'success', data: result };
  } catch (error) {
    return { event: 'error', data: error.message };
  }
}
```

### 3. Authentication

Implement authentication for your WebSocket connections:

```typescript
@WebSocketGateway()
export class AuthenticatedGateway implements OnGatewayConnection {
  constructor(private authService: AuthService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const user = await this.authService.verifyToken(token);
      client.data.user = user; // Store user info in socket instance
    } catch (error) {
      client.disconnect(); // Disconnect if authentication fails
    }
  }
}
```

### 4. Use Guards

You can apply guards to your WebSocket handlers to protect them:

```typescript
@UseGuards(WsAuthGuard)
@SubscribeMessage('secureOperation')
handleSecureOperation(@MessageBody() data: any): string {
  // Only authenticated users can access this
  return 'Secure data';
}
```

### 5. Room Management

For more targeted broadcasts, use Socket.io rooms:

```typescript
@SubscribeMessage('joinRoom')
handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket): void {
  client.join(room);
  client.emit('roomJoined', room);
}

@SubscribeMessage('messageToRoom')
handleRoomMessage(
  @MessageBody() payload: { room: string, message: string },
  @ConnectedSocket() client: Socket
): void {
  client.to(payload.room).emit('roomMessage', {
    room: payload.room,
    message: payload.message,
    sender: client.id
  });
}
```

## Complete Example

Here's a complete example of a chat system with user tracking using NestJS WebSockets:

### events.service.ts

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  private readonly users: Map<string, string> = new Map();

  addUser(clientId: string, username: string): void {
    this.users.set(clientId, username);
  }

  removeUser(clientId: string): void {
    this.users.delete(clientId);
  }

  getUser(clientId: string): string | undefined {
    return this.users.get(clientId);
  }

  getAllUsers(): string[] {
    return Array.from(this.users.values());
  }
}
```

### events.gateway.ts

```typescript
import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
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

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.eventsService.removeUser(client.id);
    
    // Broadcast updated user list
    this.server.emit('users', this.eventsService.getAllUsers());
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
    this.logger.log(`Received message: ${data} from client ${client.id}`);
    return data; // Echo the message back as acknowledgment
  }

  @SubscribeMessage('broadcast')
  handleBroadcast(@MessageBody() data: string): void {
    this.logger.log(`Broadcasting message: ${data}`);
    this.server.emit('broadcast', data);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
    this.eventsService.addUser(client.id, username);
    
    // Notify everyone about the new user
    this.server.emit('userJoined', username);
    
    // Send updated user list to all clients
    this.server.emit('users', this.eventsService.getAllUsers());
  }
}
```

### advanced.gateway.ts

```typescript
import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody,
  WsResponse
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@WebSocketGateway({
  namespace: 'advanced',
  cors: {
    origin: '*',
  },
})
export class AdvancedGateway {
  private logger: Logger = new Logger('AdvancedGateway');

  // Simple response with data extraction
  @SubscribeMessage('identify')
  handleIdentify(@MessageBody('name') name: string): WsResponse<string> {
    this.logger.log(`Received identification request for: ${name}`);
    return { event: 'identified', data: `Hello, ${name}!` };
  }

  // Multiple responses using Observable
  @SubscribeMessage('countdown')
  handleCountdown(@MessageBody() count: number): Observable<WsResponse<number>> {
    this.logger.log(`Starting countdown from: ${count}`);
    
    // Create an array of numbers from count down to 1
    const countdownArray = Array.from({ length: count }, (_, i) => count - i);
    
    return from(countdownArray).pipe(
      map(item => ({ 
        event: 'countdown', 
        data: item 
      }))
    );
  }
  
  // Async response with promise
  @SubscribeMessage('asyncOperation')
  async handleAsync(@MessageBody() data: any): Promise<WsResponse<string>> {
    this.logger.log('Received async operation request');
    
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      event: 'asyncResult',
      data: `Processed ${JSON.stringify(data)} asynchronously`
    };
  }
}
```

### events.module.ts

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AdvancedGateway } from './advanced.gateway';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService, EventsGateway, AdvancedGateway],
  exports: [EventsGateway, AdvancedGateway, EventsService]
})
export class EventsModule {}
```

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

This complete example demonstrates:
- User tracking using a service
- Basic and advanced message handling
- Multiple response patterns
- Namespace usage
- Dependency injection
- Lifecycle hooks

By using WebSockets in NestJS, you can build real-time applications with the same structured, maintainable approach that NestJS provides for HTTP applications.