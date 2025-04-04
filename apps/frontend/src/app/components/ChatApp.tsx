import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Message, DomainFactory } from '@chat/domain';
import { MessageList, MessageInput, UserInput } from './index';
import { apiService, websocketService } from '../services';

export const ChatApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Set up WebSocket event handlers
    websocketService.onMessage((message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    websocketService.onConversationHistory((conversation) => {
      console.log('Received conversation:', conversation);

      setMessages(conversation.messages);
    });

    // Connect to WebSocket server
    websocketService.connect();
    setIsConnected(true);
    setBackendError(null);

    // Clean up on unmount
    return () => {
      websocketService.disconnect();
    };
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
    await apiService.addMessage(content, user);

    if (isConnected) {
      websocketService.sendMessage(newMessage);
    }

    // Always add to local state (optimistic update or local-only mode)
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden border border-gray-300 rounded-lg shadow-lg">
      <header className="p-4 text-white bg-blue-600">
        <h1 className="text-xl font-bold">Chat App</h1>
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
