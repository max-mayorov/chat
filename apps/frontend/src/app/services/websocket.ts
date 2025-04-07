import { Message } from '@chat/domain';

export enum WebSocketEvent {
  NEW_MESSAGE = 'new_message',
  CONVERSATION_HISTORY = 'conversation_history',
  CLEAR_MESSAGES = 'clear_messages',
  ERROR = 'error',
}

export interface NewMessageEvent {
  type: WebSocketEvent.NEW_MESSAGE;
  payload: {
    message: Message;
  };
}

export interface ConversationHistoryEvent {
  type: WebSocketEvent.CONVERSATION_HISTORY;
  payload: {
    messages: Message[];
  };
}

export interface ClearMessagesEvent {
  type: WebSocketEvent.CLEAR_MESSAGES;
  payload: undefined;
}

export interface ErrorEvent {
  type: WebSocketEvent.ERROR;
  payload: {
    error: string;
  };
}

export type WebSocketMessage =
  | NewMessageEvent
  | ConversationHistoryEvent
  | ClearMessagesEvent
  | ErrorEvent;
