import { WebSocket } from 'ws';
import { Message } from '@chat/domain';
import { messagesStore } from '../stores';
import { Context } from 'koa';
import { messageService } from './message';

export enum WebSocketEvent {
  ERROR = 'error',
  NEW_MESSAGE = 'new_message',
  CONVERSATION_HISTORY = 'conversation_history',
  CLEAR_MESSAGES = 'clear_messages',
}

export interface ErrorPayload {
  error: string;
}
export interface NewMessagePayload {
  message: Message;
}
export interface ConversationHistoryPayload {
  messages: Message[];
}

export interface NewMessageEvent {
  type: WebSocketEvent.NEW_MESSAGE;
  payload: NewMessagePayload;
}

export interface ConversationHistoryEvent {
  type: WebSocketEvent.CONVERSATION_HISTORY;
  payload: ConversationHistoryPayload;
}

export interface ErrorEvent {
  type: WebSocketEvent.ERROR;
  payload: ErrorPayload;
}

export interface ClearMessagesEvent {
  type: WebSocketEvent.CLEAR_MESSAGES;
  payload: undefined;
}

export type WebSocketMessage =
  | NewMessageEvent
  | ConversationHistoryEvent
  | ErrorEvent
  | ClearMessagesEvent;

export class WebSocketController {
  private clients: WebSocket[] = [];

  async handleConnection(ctx: Context): Promise<void> {
    console.log('WebSocket connection established');
    const ws = ctx.websocket;
    // Initialize client connection
    this.clients.push(ws);

    // Handle messages
    ws.on('message', async (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.sendErrorToClient(ws, 'Invalid message format');
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      this.handleClientDisconnect(ws);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.handleClientDisconnect(ws);
    });

    await this.sendConversationHistory(ws);
  }

  private async sendConversationHistory(ws: WebSocket): Promise<void> {
    const conversationHistory = await messageService.getMessages();
    this.sendToClient(ws, {
      type: WebSocketEvent.CONVERSATION_HISTORY,
      payload: {
        messages: conversationHistory,
      },
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(
    ws: WebSocket,
    message: WebSocketMessage
  ): Promise<void> {
    switch (message.type) {
      case WebSocketEvent.NEW_MESSAGE:
        await this.handleNewMessage(ws, message.payload);
        break;
      case WebSocketEvent.CLEAR_MESSAGES:
        await messagesStore.clearMessages();
        this.broadcastToAll({
          type: WebSocketEvent.CONVERSATION_HISTORY,
          payload: { messages: [] },
        });
        break;
      default:
        this.sendErrorToClient(ws, `Unknown message type: ${message.type}`);
    }
  }

  private async handleNewMessage(
    ws: WebSocket,
    payload: NewMessagePayload
  ): Promise<void> {
    const { message } = payload;
    // Add message to conversation
    const success = await messagesStore.addMessage(message);
    if (success) {
      // Broadcast message to all clients
      this.broadcastToAll(
        {
          type: WebSocketEvent.NEW_MESSAGE,
          payload: {
            message,
          },
        },
        ws
      );
    } else {
      this.sendErrorToClient(ws, `Failed to add message to conversation`);
    }
  }

  /**
   * Handle client disconnection
   */
  private handleClientDisconnect(ws: WebSocket): void {
    this.clients = this.clients.filter((client) => client !== ws);
    console.log('Client disconnected');
  }

  /**
   * Send a message to a specific client
   */
  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send an error message to a client
   */
  private sendErrorToClient(ws: WebSocket, errorMessage: string): void {
    this.sendToClient(ws, {
      type: WebSocketEvent.ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }

  /**
   * Broadcast a message to all clients
   */
  private broadcastToAll(message: WebSocketMessage, exclude?: WebSocket): void {
    this.clients.forEach((client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export const webSocketController = new WebSocketController();
