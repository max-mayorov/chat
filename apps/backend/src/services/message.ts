import { v4 as uuidv4 } from 'uuid';
import { User, Message, DomainFactory } from '@chat/domain';
import { messagesStore } from '../stores';

export class MessageService {
  createMessage(content: string, sender: User): Message {
    const messageId = uuidv4();
    return DomainFactory.createMessage(messageId, content, sender);
  }

  async addMessage(message: Message): Promise<boolean> {
    return await messagesStore.addMessage(message);
  }

  async getMessages(): Promise<Message[]> {
    const messages = await messagesStore.getMessages();
    return messages;
  }

  async clearMessages(): Promise<boolean> {
    return await messagesStore.clearMessages();
  }
}

// Singleton instance
export const messageService = new MessageService();
