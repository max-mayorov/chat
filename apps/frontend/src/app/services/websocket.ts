import { User, Message, Conversation } from '@chat/domain';

/**
 * WebSocket event types from the backend
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
 * Callback types for WebSocket events
 */
type MessageCallback = (message: Message) => void;
type ConversationCallback = (conversation: Conversation) => void;
type UserCallback = (userId: string) => void;

/**
 * Service for WebSocket communication
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private conversationHistoryCallbacks: ConversationCallback[] = [];
  private userJoinedCallbacks: UserCallback[] = [];
  private userLeftCallbacks: UserCallback[] = [];

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws) {
      return;
    }

    // Use environment variable with fallback for local development
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };
    console.log('WebSocket URL:', wsUrl); // Log the WebSocket URL
    this.ws.onmessage = (event) => {
      try {
        console.log('WebSocket message received:', event.data);
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.ws = null;
      // Attempt to reconnect after a delay
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case WebSocketEvent.NEW_MESSAGE:
        this.messageCallbacks.forEach((callback) =>
          callback(message.payload.message)
        );
        break;
      case WebSocketEvent.CONVERSATION_HISTORY:
        this.conversationHistoryCallbacks.forEach((callback) =>
          callback(message.payload.conversation)
        );
        break;
      case WebSocketEvent.USER_JOINED:
        this.userJoinedCallbacks.forEach((callback) =>
          callback(message.payload.userId)
        );
        break;
      case WebSocketEvent.USER_LEFT:
        this.userLeftCallbacks.forEach((callback) =>
          callback(message.payload.userId)
        );
        break;
      default:
        console.log('Unhandled WebSocket message type:', message.type);
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  /**
   * Send a new message
   */
  sendMessage(message: Message): void {
    this.send({
      type: WebSocketEvent.NEW_MESSAGE,
      payload: { message },
    });
  }

  /**
   * Register a callback for new messages
   */
  onMessage(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register a callback for conversation history
   */
  onConversationHistory(callback: ConversationCallback): void {
    this.conversationHistoryCallbacks.push(callback);
  }

  /**
   * Register a callback for user joined events
   */
  onUserJoined(callback: UserCallback): void {
    this.userJoinedCallbacks.push(callback);
  }

  /**
   * Register a callback for user left events
   */
  onUserLeft(callback: UserCallback): void {
    this.userLeftCallbacks.push(callback);
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
