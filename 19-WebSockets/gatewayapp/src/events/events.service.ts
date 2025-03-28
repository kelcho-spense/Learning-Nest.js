import { Injectable } from '@nestjs/common';

interface User {
  clientId: string;
  username: string;
}

interface ChatGroup {
  id: string;
  name: string;
  createdBy: string;
  members: string[]; // client IDs
}

@Injectable()
export class EventsService {
  private readonly users: Map<string, string> = new Map();
  private readonly userObjects: Map<string, User> = new Map();
  private readonly groups: Map<string, ChatGroup> = new Map();
  private readonly clientGroups: Map<string, string[]> = new Map(); // clientId -> groupIds

  addUser(clientId: string, username: string): void {
    this.users.set(clientId, username);
    this.userObjects.set(clientId, { clientId, username });
    this.clientGroups.set(clientId, []);
  }

  removeUser(clientId: string): void {
    // Remove from all groups
    const userGroups = this.clientGroups.get(clientId) || [];
    userGroups.forEach(groupId => {
      const group = this.groups.get(groupId);
      if (group) {
        group.members = group.members.filter(id => id !== clientId);
      }
    });

    this.users.delete(clientId);
    this.userObjects.delete(clientId);
    this.clientGroups.delete(clientId);
  }

  getUser(clientId: string): string | undefined {
    return this.users.get(clientId);
  }

  getUserObject(clientId: string): User | undefined {
    return this.userObjects.get(clientId);
  }

  getAllUsers(): string[] {
    return Array.from(this.users.values());
  }

  getAllUserObjects(): User[] {
    return Array.from(this.userObjects.values());
  }

  createGroup(groupId: string, groupName: string, creatorClientId: string): ChatGroup {
    if (this.groups.has(groupId)) {
      throw new Error(`Group with ID ${groupId} already exists`);
    }

    const group: ChatGroup = {
      id: groupId,
      name: groupName,
      createdBy: creatorClientId,
      members: [creatorClientId],
    };

    this.groups.set(groupId, group);

    // Add group to creator's joined groups
    const creatorGroups = this.clientGroups.get(creatorClientId) || [];
    creatorGroups.push(groupId);
    this.clientGroups.set(creatorClientId, creatorGroups);

    return group;
  }

  joinGroup(groupId: string, clientId: string): ChatGroup {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    if (!group.members.includes(clientId)) {
      group.members.push(clientId);

      // Add group to user's joined groups
      const userGroups = this.clientGroups.get(clientId) || [];
      userGroups.push(groupId);
      this.clientGroups.set(clientId, userGroups);
    }

    return group;
  }

  leaveGroup(groupId: string, clientId: string): void {
    const group = this.groups.get(groupId);
    if (!group) {
      return;
    }

    group.members = group.members.filter(id => id !== clientId);

    // If group is empty, delete it
    if (group.members.length === 0) {
      this.groups.delete(groupId);
    }

    // Remove group from user's joined groups
    const userGroups = this.clientGroups.get(clientId) || [];
    this.clientGroups.set(
      clientId,
      userGroups.filter(id => id !== groupId)
    );
  }

  getGroup(groupId: string): ChatGroup | undefined {
    return this.groups.get(groupId);
  }

  getAllGroups(): ChatGroup[] {
    return Array.from(this.groups.values());
  }

  getGroupMembers(groupId: string): User[] {
    const group = this.groups.get(groupId);
    if (!group) {
      return [];
    }

    return group.members
      .map(clientId => this.userObjects.get(clientId))
      .filter(user => user !== undefined) as User[];
  }

  getUserGroups(clientId: string): ChatGroup[] {
    const groupIds = this.clientGroups.get(clientId) || [];
    return groupIds
      .map(groupId => this.groups.get(groupId))
      .filter(group => group !== undefined) as ChatGroup[];
  }
}