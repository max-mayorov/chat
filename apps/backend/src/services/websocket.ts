import { WebSocket } from 'ws';
import { Message } from '@chat/domain';
import { conversationStore } from '../models/index.js';
import { Context } from 'koa';
import { messageService } from './message.js';

/**
 * WebSocket event types
 */
export enum WebSocketEvent {
  NEW_MESSAGE = 'new_message',
  CONVERSATION_HISTORY = 'conversation_history',
}

export interface WebSocketMessage {
  type: WebSocketEvent;
  payload: any;
}

/**
 * WebSocket service for real-time communication
 */
export class WebSocketController {
  private clients: WebSocket[] = [];

  async handleConnection(ctx: Context): Promise<void> {
    console.log('WebSocket connection established');
    const ws = ctx.websocket;
    // Initialize client connection
    this.clients.push(ws);

    // Handle messages
    ws.on('message', (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        this.handleMessage(ws, message);
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

    this.sendConversationHistory(ws);
  }

  private sendConversationHistory(ws: WebSocket): void {
    const conversationHistory = messageService.getMessages();
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
  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case WebSocketEvent.NEW_MESSAGE:
        this.handleNewMessage(ws, message.payload);
        break;
      default:
        this.sendErrorToClient(ws, `Unknown message type: ${message.type}`);
    }
  }

  private handleNewMessage(ws: WebSocket, payload: { message: Message }): void {
    const { message } = payload;
    // Add message to conversation
    const success = conversationStore.addMessage(message);
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
      type: WebSocketEvent.NEW_MESSAGE,
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
