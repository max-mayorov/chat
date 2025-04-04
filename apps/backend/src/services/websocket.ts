import { WebSocket } from 'ws';
import { Message } from '@chat/domain';
import { conversationStore } from '../models/index.js';
import { Context } from 'koa';

/**
 * WebSocket event types
 */
export enum WebSocketEvent {
  NEW_MESSAGE = 'new_message',
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
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    console.log('Received message:', message);
    switch (message.type) {
      case WebSocketEvent.NEW_MESSAGE:
        console.log('New message:', message.payload);
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
    console.log('Adding message to conversation:', message, success);
    if (success) {
      // Broadcast message to all clients
      this.broadcastToAll({
        type: WebSocketEvent.NEW_MESSAGE,
        payload: {
          message,
        },
      });
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
    console.log('Broadcasting message:', message);
    this.clients.forEach((client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export const webSocketController = new WebSocketController();
