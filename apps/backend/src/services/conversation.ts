import { v4 as uuidv4 } from 'uuid';
import { User, Message, ConversationImpl, DomainFactory } from '@chat/domain';
import { conversationStore } from '../models/index.js';

/**
 * Service for managing conversations
 */
export class ConversationService {
  /**
   * Get all conversations
   */
  getAllConversations(): ConversationImpl[] {
    return conversationStore.getAllConversations();
  }

  /**
   * Get a conversation by ID
   */
  getConversation(id: string): ConversationImpl | undefined {
    return conversationStore.getConversation(id);
  }

  /**
   * Get conversations for a user
   */
  getConversationsForUser(userId: string): ConversationImpl[] {
    return conversationStore.getConversationsForUser(userId);
  }

  /**
   * Create a new conversation
   */
  createConversation(participants: User[], name?: string): ConversationImpl {
    const conversationId = uuidv4();
    const conversation = DomainFactory.createConversation(
      conversationId,
      participants,
      name
    ) as ConversationImpl;

    conversationStore.addConversation(conversation);
    return conversation;
  }

  /**
   * Add a user to a conversation
   */
  addUserToConversation(
    userId: string,
    conversationId: string,
    user: User
  ): boolean {
    const conversation = conversationStore.getConversation(conversationId);
    if (!conversation) {
      return false;
    }

    conversation.addParticipant(user);
    conversationStore.addUserToConversation(userId, conversationId);
    return true;
  }

  /**
   * Remove a user from a conversation
   */
  removeUserFromConversation(userId: string, conversationId: string): boolean {
    const conversation = conversationStore.getConversation(conversationId);
    if (!conversation) {
      return false;
    }

    conversation.removeParticipant(userId);
    conversationStore.removeUserFromConversation(userId, conversationId);
    return true;
  }
}

// Singleton instance
export const conversationService = new ConversationService();
