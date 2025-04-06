import { User } from './user.js';

/**
 * Represents a chat message
 */
export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
}

/**
 * Message implementation with methods
 */
export class MessageImpl implements Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;

  constructor(message: Message) {
    this.id = message.id;
    this.content = message.content;
    this.sender = message.sender;
    this.timestamp = message.timestamp;
  }
}
