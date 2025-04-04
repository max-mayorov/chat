import { Context } from 'koa';
import { messageService } from '../services/index.js';

/**
 * Controller for conversation-related endpoints
 */
export class MessagesController {
  /**
   * Get a conversation by ID
   */
  async getMessages(ctx: Context): Promise<void> {
    const messages = messageService.getMessages();
    ctx.body = { messages };
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

    // Create and add the message
    const message = messageService.createMessage(content, sender);
    const success = messageService.addMessage(message);

    if (!success) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to add message to conversation' };
      return;
    }

    ctx.status = 201;
    ctx.body = { message };
  }
}

// Singleton instance
export const messagesController = new MessagesController();
