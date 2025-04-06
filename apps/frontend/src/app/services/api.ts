import { User, Message } from '@chat/domain';

// Use environment variable with fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the backend API
 */
export class ApiService {
  async getMessages(): Promise<Message[]> {
    try {
      const response = await fetch(`${API_URL}/messages`);
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
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

export const apiService = new ApiService();
