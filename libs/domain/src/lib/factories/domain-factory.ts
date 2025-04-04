import {
  User,
  UserImpl,
  Message,
  MessageImpl,
  ConversationImpl,
} from '../models/index.js';

/**
 * Factory for creating domain objects
 */
const conversation = new ConversationImpl({
  messages: [],
});
export class DomainFactory {
  /**
   * Creates a new user
   */
  static createUser(
    id: string,
    username: string,
    name: string,
    avatar?: string
  ): User {
    return new UserImpl({
      id,
      username,
      name,
      avatar,
      createdAt: new Date(),
    });
  }

  /**
   * Creates a new message
   */
  static createMessage(id: string, content: string, sender: User): Message {
    return new MessageImpl({
      id,
      content,
      sender,
      timestamp: new Date(),
    });
  }

  /**
   * Creates a new conversation
   */
  static getConversation(): ConversationImpl {
    return conversation;
  }
}
