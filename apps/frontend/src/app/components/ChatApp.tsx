import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Message, DomainFactory } from '@chat/domain';
import { MessageList, MessageInput, UserInput } from './index';
import { apiService } from '../services';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WebSocketEvent, WebSocketMessage } from '../services/websocket';

export const ChatApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Use environment variable with fallback for local development
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket disconnected'),
    onError: (event) => console.error('WebSocket error:', event),
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    shouldReconnect: () => true,
  });

  const isConnected = readyState === ReadyState.OPEN;

  const renderConnectionStatus = () => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return (
          <p className="text-sm text-yellow-200">Connecting to server...</p>
        );
      case ReadyState.OPEN:
        return <p className="text-sm text-green-200">Connected to server</p>;
      case ReadyState.CLOSING:
        return <p className="text-sm text-orange-200">Closing connection...</p>;
      case ReadyState.CLOSED:
      case ReadyState.UNINSTANTIATED:
      default:
        return <p className="text-sm text-red-200">Disconnected from server</p>;
    }
  };

  useEffect(() => {
    if (lastJsonMessage) {
      console.log('Received WebSocket message:', lastJsonMessage);
      const { type, payload } = lastJsonMessage as WebSocketMessage;

      switch (type) {
        case WebSocketEvent.NEW_MESSAGE:
          setMessages((prevMessages) => [...prevMessages, payload.message]);
          break;
        case WebSocketEvent.CONVERSATION_HISTORY:
          setMessages(payload.messages);
          break;
        default:
          console.log('Unhandled WebSocket message type:', type);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    async function fetchMessages() {
      const retrievedMessages = await apiService.getMessages();
      if (retrievedMessages.length > messages.length) {
        setMessages(messages);
      }
    }
    fetchMessages();
  }, []);

  // Handle setting the username
  const handleSetUsername = async (username: string) => {
    // Create a user
    const userId = uuidv4();
    const newUser = DomainFactory.createUser(
      userId,
      username,
      username // Using username as name for simplicity
    );
    setUser(newUser);
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const messageId = uuidv4();
    const newMessage = DomainFactory.createMessage(messageId, content, user);

    // Add message to conversation via API

    if (isConnected) {
      sendJsonMessage({
        type: WebSocketEvent.NEW_MESSAGE,
        payload: { message: newMessage },
      });
    } else {
      await apiService.addMessage(content, user);
    }

    // Always add to local state (optimistic update or local-only mode)
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden border border-gray-300 rounded-lg shadow-lg">
      <header className="p-4 text-white bg-blue-600">
        <h1 className="text-xl font-bold">Chat App</h1>
        {renderConnectionStatus()}
      </header>

      {!user ? (
        <UserInput onSetUsername={handleSetUsername} />
      ) : (
        <>
          <MessageList messages={messages} />
          <MessageInput onSendMessage={handleSendMessage} />
        </>
      )}
    </div>
  );
};
