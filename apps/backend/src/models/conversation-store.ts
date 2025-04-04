import { ConversationImpl, Message } from '@chat/domain';

/**
 * In-memory store for conversations
 */
export class ConversationStore {
  private conversations: Map<string, ConversationImpl> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> Set of conversationIds

  /**
   * Get a conversation by ID
   */
  getConversation(id: string): ConversationImpl | undefined {
    return this.conversations.get(id);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): ConversationImpl[] {
    return Array.from(this.conversations.values());
  }

  /**
   * Get conversations for a user
   */
  getConversationsForUser(userId: string): ConversationImpl[] {
    const conversationIds =
      this.userConnections.get(userId) || new Set<string>();
    return Array.from(conversationIds)
      .map((id) => this.conversations.get(id))
      .filter((conv): conv is ConversationImpl => conv !== undefined);
  }

  /**
   * Add a conversation
   */
  addConversation(conversation: ConversationImpl): void {
    this.conversations.set(conversation.id, conversation);

    // Update user connections
    conversation.participants.forEach((user) => {
      this.addUserToConversation(user.id, conversation.id);
    });
  }

  /**
   * Add a message to a conversation
   */
  addMessageToConversation(conversationId: string, message: Message): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return false;
    }

    conversation.addMessage(message);
    return true;
  }

  /**
   * Add a user to a conversation
   */
  addUserToConversation(userId: string, conversationId: string): void {
    // Update user connections map
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set<string>());
    }
    this.userConnections.get(userId)?.add(conversationId);
  }

  /**
   * Remove a user from a conversation
   */
  removeUserFromConversation(userId: string, conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.removeParticipant(userId);
    }

    // Update user connections map
    this.userConnections.get(userId)?.delete(conversationId);
  }
}

// Singleton instance
export const conversationStore = new ConversationStore();
