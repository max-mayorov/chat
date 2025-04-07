import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Message, DomainFactory } from '@chat/domain';
import { MessageList, MessageInput, UserInput } from './index';
import { apiService } from '../services';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WebSocketEvent, WebSocketMessage } from '../services/websocket';
import toast, { Toaster } from 'react-hot-toast';

export const ChatApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  // Use environment variable with fallback for local development
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => {
      console.log('WebSocket disconnected');
    },
    onError: (event) => {
      console.error('WebSocket error:', event);
    },
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
      const { type, payload } = lastJsonMessage as WebSocketMessage;

      switch (type) {
        case WebSocketEvent.NEW_MESSAGE:
          setMessages((prevMessages) => [...prevMessages, payload.message]);
          break;
        case WebSocketEvent.CONVERSATION_HISTORY:
          setMessages(payload.messages);
          break;
        case WebSocketEvent.ERROR:
          toast.error('Failed to fetch messages. Check your connection.', {
            duration: 4000,
            position: 'top-right',
          });
          console.error('WebSocket error:', payload.error);
          break;
        default:
          console.log('Unhandled WebSocket message type:', type);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    const fetchMessages = async () => {
      let retrievedMessages: Message[] = [];
      try {
        retrievedMessages = await apiService.getMessages();
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('Failed to fetch messages. Check your connection.', {
          duration: 4000,
          position: 'top-right',
        });
        setMessages((prevMessages) =>
          retrievedMessages.length > prevMessages.length
            ? retrievedMessages
            : prevMessages
        );
      }
    };
    fetchMessages();
  }, []);

  const handleSetUsername = async (username: string) => {
    // Create a user
    const userId = uuidv4();
    const newUser = DomainFactory.createUser(
      userId,
      username,
      username // Using username as name for simplicity
    );
    setUser(newUser);
    toast.success(`Welcome, ${username}!`, {
      position: 'top-right',
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const messageId = uuidv4();
    const newMessage = DomainFactory.createMessage(messageId, content, user);

    // Add message to conversation via API
    try {
      if (isConnected) {
        sendJsonMessage({
          type: WebSocketEvent.NEW_MESSAGE,
          payload: { message: newMessage },
        });
      } else {
        await apiService.addMessage(content, user);
      }
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error, newMessage);
      toast.error('Failed to send message. Please try again.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  // Handle clearing all messages
  const handleClearMessages = async () => {
    if (!user) return;

    try {
      setIsClearing(true);
      if (isConnected) {
        sendJsonMessage({
          type: WebSocketEvent.CLEAR_MESSAGES,
        });
      } else {
        await apiService.clearMessages();
      }
      setMessages([]);
      toast.success('All messages cleared', {
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast.error('Failed to clear messages. Please try again.', {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden border border-gray-300 rounded-lg shadow-lg">
      <Toaster />

      <header className="flex items-center justify-between p-4 text-white bg-blue-600">
        <div>
          <h1 className="text-xl font-bold">Chat App</h1>
          {renderConnectionStatus()}
        </div>
        {user && (
          <button
            onClick={handleClearMessages}
            disabled={isClearing}
            className="px-4 py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? 'Clearing...' : 'Clear Messages'}
          </button>
        )}
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
