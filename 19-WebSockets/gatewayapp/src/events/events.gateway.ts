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

  constructor(private readonly eventsService: EventsService) { }

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
    const username = this.eventsService.getUser(client.id);
    this.eventsService.removeUser(client.id);

    // Broadcast updated user list
    this.server.emit('users', this.eventsService.getAllUsers());

    if (username) {
      this.server.emit('userLeft', username);
    }
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

  @SubscribeMessage('createGroup')
  handleCreateGroup(
    @MessageBody('groupId') groupId: string,
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<any> {
    try {
      const group = this.eventsService.createGroup(groupId, name, client.id);

      // Notify everyone about the new group
      this.server.emit('groupCreated', group);

      return { event: 'groupCreated', data: group };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody('groupId') groupId: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<any> {
    try {
      const group = this.eventsService.joinGroup(groupId, client.id);

      // Get the user who joined
      const user = this.eventsService.getUserObject(client.id);

      // Join the Socket.IO room for this group
      client.join(`group:${groupId}`);

      // Notify group members about the new member
      this.server.to(`group:${groupId}`).emit('userJoinedGroup', {
        group,
        user,
      });

      // Send group members to the user who just joined
      const members = this.eventsService.getGroupMembers(groupId);
      return {
        event: 'joinedGroup',
        data: {
          group,
          members,
        }
      };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(
    @MessageBody('groupId') groupId: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<any> {
    try {
      // Get the user who is leaving
      const user = this.eventsService.getUserObject(client.id);

      this.eventsService.leaveGroup(groupId, client.id);

      // Leave the Socket.IO room for this group
      client.leave(`group:${groupId}`);

      // Notify group members about the member who left
      this.server.to(`group:${groupId}`).emit('userLeftGroup', {
        groupId,
        user,
      });

      return { event: 'leftGroup', data: { groupId } };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('getGroups')
  handleGetGroups(): WsResponse<any> {
    const groups = this.eventsService.getAllGroups();
    return { event: 'allGroups', data: groups };
  }

  @SubscribeMessage('getUserGroups')
  handleGetUserGroups(@ConnectedSocket() client: Socket): WsResponse<any> {
    const groups = this.eventsService.getUserGroups(client.id);
    return { event: 'userGroups', data: groups };
  }

  @SubscribeMessage('groupMessage')
  handleGroupMessage(
    @MessageBody('groupId') groupId: string,
    @MessageBody('message') message: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<any> {
    const user = this.eventsService.getUserObject(client.id);
    if (!user) {
      return { event: 'error', data: { message: 'User not found' } };
    }

    const group = this.eventsService.getGroup(groupId);
    if (!group) {
      return { event: 'error', data: { message: 'Group not found' } };
    }

    // Check if user is a member of the group
    if (!group.members.includes(client.id)) {
      return { event: 'error', data: { message: 'You are not a member of this group' } };
    }

    const messageData = {
      groupId,
      message,
      sender: user,
      timestamp: new Date().toISOString(),
    };

    // Send message to all members of the group
    this.server.to(`group:${groupId}`).emit('groupMessage', messageData);

    return { event: 'messageSent', data: messageData };
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody('to') recipientClientId: string,
    @MessageBody('message') message: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<any> {
    const sender = this.eventsService.getUserObject(client.id);
    const recipient = this.eventsService.getUserObject(recipientClientId);

    if (!sender) {
      return { event: 'error', data: { message: 'Sender not found' } };
    }

    if (!recipient) {
      return { event: 'error', data: { message: 'Recipient not found' } };
    }

    const messageData = {
      message,
      sender,
      recipient,
      timestamp: new Date().toISOString(),
    };

    // Send to recipient
    this.server.to(recipientClientId).emit('privateMessage', messageData);

    // Send confirmation to sender
    return { event: 'privateMessageSent', data: messageData };
  }

  @SubscribeMessage('getUsers')
  handleGetUsers(): WsResponse<any> {
    const users = this.eventsService.getAllUserObjects();
    return { event: 'allUsers', data: users };
  }
}