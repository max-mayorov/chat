import { User, Message, Conversation } from '@chat/domain';

// Use environment variable with fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the backend API
 */
export class ApiService {
  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${API_URL}/conversation`);
    const data = await response.json();
    return data.conversation;
  }

  async addMessage(content: string, sender: User): Promise<Message> {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, sender }),
    });
    const data = await response.json();
    return data.message;
  }
}

// Singleton instance
export const apiService = new ApiService();
