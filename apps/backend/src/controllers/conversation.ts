import { Context } from 'koa';
import { conversationService, messageService } from '../services/index.js';

/**
 * Controller for conversation-related endpoints
 */
export class ConversationController {
  /**
   * Get all conversations
   */
  async getAllConversations(ctx: Context): Promise<void> {
    const conversations = conversationService.getAllConversations();
    ctx.body = { conversations };
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const conversation = conversationService.getConversation(id);

    if (!conversation) {
      ctx.status = 404;
      ctx.body = { error: `Conversation not found: ${id}` };
      return;
    }

    ctx.body = { conversation };
  }

  /**
   * Get conversations for a user
   */
  async getConversationsForUser(ctx: Context): Promise<void> {
    const { userId } = ctx.params;
    const conversations = conversationService.getConversationsForUser(userId);
    ctx.body = { conversations };
  }

  /**
   * Create a new conversation
   */
  async createConversation(ctx: Context): Promise<void> {
    const { participants, name } = ctx.request.body as any;

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      ctx.status = 400;
      ctx.body = { error: 'Participants are required' };
      return;
    }

    const conversation = conversationService.createConversation(
      participants,
      name
    );
    ctx.status = 201;
    ctx.body = { conversation };
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const { content, sender } = ctx.request.body as any;

    if (!content) {
      ctx.status = 400;
      ctx.body = { error: 'Message content is required' };
      return;
    }

    if (!sender || !sender.id) {
      ctx.status = 400;
      ctx.body = { error: 'Sender is required' };
      return;
    }

    const conversation = conversationService.getConversation(id);
    if (!conversation) {
      ctx.status = 404;
      ctx.body = { error: `Conversation not found: ${id}` };
      return;
    }

    // Create and add the message
    const message = messageService.createMessage(content, sender);
    const success = messageService.addMessageToConversation(id, message);

    if (!success) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to add message to conversation' };
      return;
    }

    ctx.status = 201;
    ctx.body = { message };
  }

  /**
   * Add a user to a conversation
   */
  async addUserToConversation(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const { user } = ctx.request.body as any;

    if (!user || !user.id) {
      ctx.status = 400;
      ctx.body = { error: 'User is required' };
      return;
    }

    const success = conversationService.addUserToConversation(
      user.id,
      id,
      user
    );

    if (!success) {
      ctx.status = 404;
      ctx.body = { error: `Conversation not found: ${id}` };
      return;
    }

    ctx.status = 200;
    ctx.body = { success: true };
  }

  /**
   * Remove a user from a conversation
   */
  async removeUserFromConversation(ctx: Context): Promise<void> {
    const { id, userId } = ctx.params;

    const success = conversationService.removeUserFromConversation(userId, id);

    if (!success) {
      ctx.status = 404;
      ctx.body = { error: `Conversation not found: ${id}` };
      return;
    }

    ctx.status = 200;
    ctx.body = { success: true };
  }
}

// Singleton instance
export const conversationController = new ConversationController();
