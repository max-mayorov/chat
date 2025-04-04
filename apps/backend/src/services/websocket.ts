import { WebSocket } from 'ws';
import { Message } from '@chat/domain';
import { conversationStore } from '../models/index.js';
import { Context } from 'koa';

/**
 * WebSocket event types
 */
export enum WebSocketEvent {
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  NEW_MESSAGE = 'new_message',
  MESSAGE_UPDATED = 'message_updated',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  CONVERSATION_HISTORY = 'conversation_history',
}

/**
 * WebSocket message format
 */
export interface WebSocketMessage {
  type: WebSocketEvent;
  payload: any;
}

/**
 * Client connection with metadata
 */
interface ClientConnection {
  ws: WebSocket;
  userId: string;
  conversationId?: string;
}

/**
 * WebSocket service for real-time communication
 */
export class WebSocketController {
  private clients: Map<WebSocket, ClientConnection> = new Map();
  private conversationClients: Map<string, Set<WebSocket>> = new Map(); // conversationId -> Set of WebSocket connections

  async handleConnection(ctx: Context): Promise<void> {
    console.log('WebSocket connection established');
    const ws = ctx.websocket;
    // Initialize client connection
    this.clients.set(ws, { ws, userId: '' });

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
      case WebSocketEvent.JOIN_CONVERSATION:
        this.handleJoinConversation(ws, message.payload);
        break;
      case WebSocketEvent.LEAVE_CONVERSATION:
        this.handleLeaveConversation(ws);
        break;
      case WebSocketEvent.NEW_MESSAGE:
        console.log('New message:', message.payload);
        this.handleNewMessage(ws, message.payload);
        break;
      default:
        this.sendErrorToClient(ws, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle client joining a conversation
   */
  private handleJoinConversation(
    ws: WebSocket,
    payload: { userId: string; conversationId: string }
  ): void {
    const { userId, conversationId } = payload;

    // Get client connection
    const clientConnection = this.clients.get(ws);
    if (!clientConnection) {
      return;
    }

    // Update client connection
    clientConnection.userId = userId;
    clientConnection.conversationId = conversationId;

    // Add to conversation clients
    if (!this.conversationClients.has(conversationId)) {
      this.conversationClients.set(conversationId, new Set<WebSocket>());
    }
    this.conversationClients.get(conversationId)?.add(ws);

    // Get conversation history
    const conversation = conversationStore.getConversation(conversationId);
    if (conversation) {
      // Send conversation history to client
      this.sendToClient(ws, {
        type: WebSocketEvent.CONVERSATION_HISTORY,
        payload: {
          conversation,
        },
      });

      // Notify other participants
      this.broadcastToConversation(
        conversationId,
        {
          type: WebSocketEvent.USER_JOINED,
          payload: {
            userId,
            conversationId,
          },
        },
        ws
      ); // Exclude the joining client
    } else {
      this.sendErrorToClient(ws, `Conversation not found: ${conversationId}`);
    }
  }

  /**
   * Handle client leaving a conversation
   */
  private handleLeaveConversation(ws: WebSocket): void {
    const clientConnection = this.clients.get(ws);
    if (!clientConnection || !clientConnection.conversationId) {
      return;
    }

    const { userId, conversationId } = clientConnection;

    // Remove from conversation clients
    this.conversationClients.get(conversationId)?.delete(ws);

    // Update client connection
    clientConnection.conversationId = undefined;

    // Notify other participants
    this.broadcastToConversation(conversationId, {
      type: WebSocketEvent.USER_LEFT,
      payload: {
        userId,
        conversationId,
      },
    });
  }

  /**
   * Handle new message from client
   */
  private handleNewMessage(ws: WebSocket, payload: { message: Message }): void {
    const clientConnection = this.clients.get(ws);
    console.log('Client connection:', clientConnection);
    if (!clientConnection || !clientConnection.conversationId) {
      this.sendErrorToClient(ws, 'Not joined to any conversation');
      return;
    }

    const { conversationId } = clientConnection;
    const { message } = payload;

    // Add message to conversation
    const success = conversationStore.addMessageToConversation(
      conversationId,
      message
    );
    console.log(
      'Adding message to conversation:',
      conversationId,
      message,
      success
    );
    if (success) {
      // Broadcast message to all clients in the conversation
      this.broadcastToConversation(conversationId, {
        type: WebSocketEvent.NEW_MESSAGE,
        payload: {
          message,
          conversationId,
        },
      });
    } else {
      this.sendErrorToClient(
        ws,
        `Failed to add message to conversation: ${conversationId}`
      );
    }
  }

  /**
   * Handle client disconnection
   */
  private handleClientDisconnect(ws: WebSocket): void {
    const clientConnection = this.clients.get(ws);
    if (clientConnection && clientConnection.conversationId) {
      // Remove from conversation clients
      this.conversationClients.get(clientConnection.conversationId)?.delete(ws);

      // Notify other participants if in a conversation
      if (clientConnection.userId && clientConnection.conversationId) {
        this.broadcastToConversation(clientConnection.conversationId, {
          type: WebSocketEvent.USER_LEFT,
          payload: {
            userId: clientConnection.userId,
            conversationId: clientConnection.conversationId,
          },
        });
      }
    }

    // Remove client
    this.clients.delete(ws);
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
   * Broadcast a message to all clients in a conversation
   */
  private broadcastToConversation(
    conversationId: string,
    message: WebSocketMessage,
    exclude?: WebSocket
  ): void {
    const clients = this.conversationClients.get(conversationId);
    if (clients) {
      clients.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }
}

export const webSocketController = new WebSocketController();
