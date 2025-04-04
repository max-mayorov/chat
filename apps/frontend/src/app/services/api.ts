import { User, Message, Conversation } from '@chat/domain';

// Use environment variable with fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the backend API
 */
export class ApiService {
  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/conversations`);
    const data = await response.json();
    return data.conversations;
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${API_URL}/conversations/${id}`);
    const data = await response.json();
    return data.conversation;
  }

  /**
   * Get conversations for a user
   */
  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/users/${userId}/conversations`);
    const data = await response.json();
    return data.conversations;
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    participants: User[],
    name?: string
  ): Promise<Conversation> {
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participants, name }),
    });
    const data = await response.json();
    return data.conversation;
  }

  /**
   * Add a user to a conversation
   */
  async addUserToConversation(
    conversationId: string,
    user: User
  ): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      }
    );
    const data = await response.json();
    return data.success;
  }

  /**
   * Remove a user from a conversation
   */
  async removeUserFromConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/users/${userId}`,
      {
        method: 'DELETE',
      }
    );
    const data = await response.json();
    return data.success;
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    content: string,
    sender: User
  ): Promise<Message> {
    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, sender }),
      }
    );
    const data = await response.json();
    return data.message;
  }
}

// Singleton instance
export const apiService = new ApiService();
