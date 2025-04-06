import axios from 'axios';
import WebSocket from 'ws';

describe('Messages API', () => {
  const apiUrl = 'http://localhost:3000/api';

  // Test message data
  const testMessage = {
    id: '1',
    content: 'Hello, world!',
    sender: {
      id: 'user1',
      name: 'Test User',
    },
    timestamp: new Date().toISOString(),
  };

  describe('GET /api/messages', () => {
    it('should return all messages', async () => {
      const response = await axios.get(`${apiUrl}/messages`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data?.messages)).toBe(true);
    });
  });

  describe('POST /api/messages', () => {
    it('should add a new message', async () => {
      const response = await axios.post(`${apiUrl}/messages`, testMessage);
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data.message.content).toBe(testMessage.content);
      expect(response.data.message.sender.id).toBe(testMessage.sender.id);
    });

    it('should reject messages with missing content', async () => {
      const invalidMessage = {
        id: '2',
        sender: testMessage.sender,
        timestamp: new Date().toISOString(),
      };

      try {
        await axios.post(`${apiUrl}/messages`, invalidMessage);
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
