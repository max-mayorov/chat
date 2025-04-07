import { Context } from 'koa';
import { messageService } from '../services/index.js';
import { Message } from '@chat/domain';

export class MessagesController {
  async getMessages(ctx: Context): Promise<void> {
    const messages = await messageService.getMessages();
    ctx.body = { messages };
  }

  async clearMessages(ctx: Context): Promise<void> {
    const success = await messageService.clearMessages();
    if (!success) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to add message to conversation' };
      return;
    }
    ctx.body = { success };
  }

  async addMessage(ctx: Context): Promise<void> {
    const { content, sender } = ctx.request.body as Message;

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

    const message = messageService.createMessage(content, sender);
    const success = await messageService.addMessage(message);

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
