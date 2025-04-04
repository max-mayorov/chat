import axios from 'axios';
import { DomainFactory } from '@chat/domain';

describe('Conversation API', () => {
  let conversationId: string;

  // Test data
  const testUser1 = {
    id: '1',
    username: 'testuser1',
    name: 'Test User 1',
    createdAt: new Date(),
  };

  const testUser2 = {
    id: '2',
    username: 'testuser2',
    name: 'Test User 2',
    createdAt: new Date(),
  };

  describe('POST /api/conversations', () => {
    it('should create a new conversation', async () => {
      const response = await axios.post('/api/conversations', {
        participants: [testUser1, testUser2],
        name: 'Test Conversation',
      });

      expect(response.status).toBe(201);
      expect(response.data.conversation).toBeDefined();
      expect(response.data.conversation.name).toBe('Test Conversation');
      expect(response.data.conversation.participants).toHaveLength(2);

      // Save the conversation ID for later tests
      conversationId = response.data.conversation.id;
    });
  });

  describe('GET /api/conversations', () => {
    it('should return all conversations', async () => {
      const response = await axios.get('/api/conversations');

      expect(response.status).toBe(200);
      expect(response.data.conversations).toBeDefined();
      expect(Array.isArray(response.data.conversations)).toBe(true);
      expect(response.data.conversations.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/conversations/:id', () => {
    it('should return a specific conversation', async () => {
      // Skip if no conversation was created
      if (!conversationId) {
        return;
      }

      const response = await axios.get(`/api/conversations/${conversationId}`);

      expect(response.status).toBe(200);
      expect(response.data.conversation).toBeDefined();
      expect(response.data.conversation.id).toBe(conversationId);
    });

    it('should return 404 for non-existent conversation', async () => {
      try {
        await axios.get('/api/conversations/non-existent-id');
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('POST /api/conversations/:id/messages', () => {
    it('should add a message to a conversation', async () => {
      // Skip if no conversation was created
      if (!conversationId) {
        return;
      }

      const response = await axios.post(
        `/api/conversations/${conversationId}/messages`,
        {
          content: 'Hello, world!',
          sender: testUser1,
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.message).toBeDefined();
      expect(response.data.message.content).toBe('Hello, world!');
      expect(response.data.message.sender.id).toBe(testUser1.id);
    });
  });

  describe('POST /api/conversations/:id/users', () => {
    it('should add a user to a conversation', async () => {
      // Skip if no conversation was created
      if (!conversationId) {
        return;
      }

      const newUser = {
        id: '3',
        username: 'testuser3',
        name: 'Test User 3',
        createdAt: new Date(),
      };

      const response = await axios.post(
        `/api/conversations/${conversationId}/users`,
        {
          user: newUser,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Verify the user was added
      const conversationResponse = await axios.get(
        `/api/conversations/${conversationId}`
      );
      const participants = conversationResponse.data.conversation.participants;
      const addedUser = participants.find((p: any) => p.id === newUser.id);
      expect(addedUser).toBeDefined();
    });
  });

  describe('DELETE /api/conversations/:id/users/:userId', () => {
    it('should remove a user from a conversation', async () => {
      // Skip if no conversation was created
      if (!conversationId) {
        return;
      }

      const response = await axios.delete(
        `/api/conversations/${conversationId}/users/${testUser2.id}`
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Verify the user was removed
      const conversationResponse = await axios.get(
        `/api/conversations/${conversationId}`
      );
      const participants = conversationResponse.data.conversation.participants;
      const removedUser = participants.find((p: any) => p.id === testUser2.id);
      expect(removedUser).toBeUndefined();
    });
  });
});
