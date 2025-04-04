export enum WebSocketEvent {
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  NEW_MESSAGE = 'new_message',
  MESSAGE_UPDATED = 'message_updated',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  CONVERSATION_HISTORY = 'conversation_history',
}

export interface WebSocketMessage {
  type: WebSocketEvent;
  payload: any;
}
