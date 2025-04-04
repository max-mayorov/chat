import {
  User,
  UserImpl,
  Message,
  MessageImpl,
  Conversation,
  ConversationImpl,
} from '../models/index.js';

/**
 * Factory for creating domain objects
 */
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
  static createConversation(
    id: string,
    participants: User[],
    name?: string
  ): Conversation {
    return new ConversationImpl({
      id,
      participants,
      messages: [],
      name,
      createdAt: new Date(),
    });
  }
}
