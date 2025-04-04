import { User } from './user.js';
import { Message } from './message.js';

/**
 * Represents a chat conversation
 */
export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  name?: string;
  createdAt: Date;
}

/**
 * Conversation implementation with methods
 */
export class ConversationImpl implements Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  name?: string;
  createdAt: Date;

  constructor(conversation: Conversation) {
    this.id = conversation.id;
    this.participants = [...conversation.participants];
    this.messages = [...conversation.messages];
    this.name = conversation.name;
    this.createdAt = conversation.createdAt;
  }

  /**
   * Adds a message to the conversation
   */
  addMessage(message: Message): void {
    this.messages.push(message);
  }

  /**
   * Adds a participant to the conversation
   */
  addParticipant(user: User): void {
    if (!this.participants.some((participant) => participant.id === user.id)) {
      this.participants.push(user);
    }
  }

  /**
   * Removes a participant from the conversation
   */
  removeParticipant(userId: string): void {
    this.participants = this.participants.filter(
      (participant) => participant.id !== userId
    );
  }
}
