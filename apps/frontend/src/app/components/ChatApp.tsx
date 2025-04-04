import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Message, DomainFactory } from '@chat/domain';
import { MessageList, MessageInput, UserInput } from './index';
import { apiService, websocketService, WebSocketEvent } from '../services';

export const ChatApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    // Only try to connect if we're not already in local mode
    if (!isLocalMode) {
      try {
        // Set up WebSocket event handlers
        websocketService.onMessage((message, convId) => {
          if (convId === conversationId) {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        });

        websocketService.onConversationHistory((conversation) => {
          setMessages(conversation.messages);
        });

        // Connect to WebSocket server
        websocketService.connect();
        setIsConnected(true);
        setBackendError(null);

        // Clean up on unmount
        return () => {
          if (conversationId) {
            try {
              websocketService.leaveConversation();
            } catch (error) {
              console.error('Error leaving conversation:', error);
            }
          }
          websocketService.disconnect();
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setBackendError('Could not connect to chat server. Using local mode.');
        setIsConnected(false);
        setIsLocalMode(true);
      }
    }
  }, [conversationId, isLocalMode]);

  // Handle setting the username
  const handleSetUsername = async (username: string) => {
    try {
      // Create a user
      const userId = uuidv4();
      const newUser = DomainFactory.createUser(
        userId,
        username,
        username // Using username as name for simplicity
      );
      setUser(newUser);

      // Try to connect to backend if not in local mode
      if (!isLocalMode) {
        try {
          // Create or join a conversation (using a default conversation for simplicity)
          let conversation;
          const conversations = await apiService.getAllConversations();

          if (conversations.length > 0) {
            // Join the first conversation
            conversation = conversations[0];
            await apiService.addUserToConversation(conversation.id, newUser);
          } else {
            // Create a new conversation
            conversation = await apiService.createConversation(
              [newUser],
              'Chat Room'
            );
          }

          setConversationId(conversation.id);

          // Join the conversation via WebSocket
          if (isConnected) {
            websocketService.joinConversation(userId, conversation.id);
          }
        } catch (error) {
          console.error('Error setting up conversation:', error);
          setBackendError(
            'Could not connect to chat server. Using local mode.'
          );
          setIsLocalMode(true);

          // Create a local conversation
          const localConversationId = uuidv4();
          setConversationId(localConversationId);
        }
      } else {
        // Create a local conversation if already in local mode
        const localConversationId = uuidv4();
        setConversationId(localConversationId);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!user || !conversationId) return;

    try {
      // Create a message
      const messageId = uuidv4();
      const newMessage = DomainFactory.createMessage(messageId, content, user);

      // Try to send to backend if not in local mode
      if (!isLocalMode) {
        try {
          // Add message to conversation via API
          await apiService.addMessage(conversationId, content, user);

          // Send message via WebSocket
          if (isConnected) {
            websocketService.sendMessage(newMessage);
          }
        } catch (error) {
          console.error('Error sending message to server:', error);
          setBackendError(
            'Could not connect to chat server. Using local mode.'
          );
          setIsLocalMode(true);
        }
      }

      // Always add to local state (optimistic update or local-only mode)
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden border border-gray-300 rounded-lg shadow-lg">
      <header className="p-4 text-white bg-blue-600">
        <h1 className="text-xl font-bold">Chat App</h1>
        {isLocalMode && (
          <div className="mt-1 text-sm text-yellow-200">
            Using local mode - messages are not saved to the server
          </div>
        )}
      </header>

      {!user ? (
        <UserInput onSetUsername={handleSetUsername} />
      ) : (
        <>
          <MessageList messages={messages} />
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!conversationId}
          />
        </>
      )}
    </div>
  );
};
