import { v4 as uuidv4 } from 'uuid';
import { User, Message, DomainFactory } from '@chat/domain';
import { conversationStore } from '../models/index.js';

/**
 * Service for managing messages
 */
export class MessageService {
  /**
   * Create a new message
   */
  createMessage(content: string, sender: User): Message {
    const messageId = uuidv4();
    return DomainFactory.createMessage(messageId, content, sender);
  }

  /**
   * Add a message to a conversation
   */
  addMessage(message: Message): boolean {
    return conversationStore.addMessage(message);
  }

  /**
   * Get messages for a conversation
   */
  getMessages(): Message[] {
    const messages = conversationStore.getMessages();
    return messages;
  }
}

// Singleton instance
export const messageService = new MessageService();
