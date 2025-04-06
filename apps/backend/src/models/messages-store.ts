import { ConversationImpl, Message } from '@chat/domain';
import { DomainFactory } from '@chat/domain';

/**
 * In-memory store for conversations
 */
export class MessagesStore {
  private conversation: ConversationImpl = DomainFactory.getConversation();

  /**
   * Get a conversation by ID
   */
  getMessages(): Message[] {
    return this.conversation.messages ?? [];
  }

  addMessage(message: Message): boolean {
    if (!this.conversation) {
      this.conversation = DomainFactory.getConversation();
    }

    this.conversation.addMessage(message);
    return true;
  }
}

// Singleton instance
export const messagesStore = new MessagesStore();
