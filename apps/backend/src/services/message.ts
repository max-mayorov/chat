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
  addMessageToConversation(conversationId: string, message: Message): boolean {
    return conversationStore.addMessageToConversation(conversationId, message);
  }

  /**
   * Get messages for a conversation
   */
  getMessagesForConversation(conversationId: string): Message[] {
    const conversation = conversationStore.getConversation(conversationId);
    return conversation ? conversation.messages : [];
  }
}

// Singleton instance
export const messageService = new MessageService();
