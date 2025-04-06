import { Message } from '@chat/domain';

export enum WebSocketEvent {
  NEW_MESSAGE = 'new_message',
  CONVERSATION_HISTORY = 'conversation_history',
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

export type WebSocketMessage = NewMessageEvent | ConversationHistoryEvent;
