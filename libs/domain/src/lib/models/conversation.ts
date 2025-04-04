import { Message } from './message.js';

/**
 * Represents a chat conversation
 */
export interface Conversation {
  messages: Message[];
}

/**
 * Conversation implementation with methods
 */
export class ConversationImpl implements Conversation {
  messages: Message[];

  constructor(conversation: Conversation) {
    this.messages = [...conversation.messages];
  }

  /**
   * Adds a message to the conversation
   */
  addMessage(message: Message): void {
    this.messages.push(message);
  }
}
