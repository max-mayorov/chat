import axios from 'axios';
import WebSocket from 'ws';
import { DomainFactory } from '@chat/domain';

describe('WebSocket API', () => {
  let conversationId: string;
  let ws: WebSocket;

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

  // Create a conversation before running the tests
  beforeAll(async () => {
    try {
      const response = await axios.post('/api/conversations', {
        participants: [testUser1, testUser2],
        name: 'WebSocket Test Conversation',
      });

      conversationId = response.data.conversation.id;
    } catch (error) {
      console.error('Failed to create test conversation:', error);
    }
  });

  // Close WebSocket connection after each test
  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  describe('WebSocket Connection', () => {
    it('should establish a WebSocket connection', (done) => {
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const wsUrl = baseUrl.replace('http', 'ws');

      ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        done();
      });

      ws.on('error', (error) => {
        fail(`WebSocket connection failed: ${error.message}`);
        done();
      });
    });
  });

  describe('WebSocket Events', () => {
    it('should join a conversation and receive history', (done) => {
      if (!conversationId) {
        fail('No conversation ID available for testing');
        done();
        return;
      }

      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const wsUrl = baseUrl.replace('http', 'ws');

      ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        // Join the conversation
        ws.send(
          JSON.stringify({
            type: 'join_conversation',
            payload: {
              userId: testUser1.id,
              conversationId,
            },
          })
        );
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());

        if (message.type === 'conversation_history') {
          expect(message.payload).toBeDefined();
          expect(message.payload.conversation).toBeDefined();
          expect(message.payload.conversation.id).toBe(conversationId);
          done();
        }
      });

      ws.on('error', (error) => {
        fail(`WebSocket error: ${error.message}`);
        done();
      });
    });

    it('should send and receive messages in real-time', (done) => {
      if (!conversationId) {
        fail('No conversation ID available for testing');
        done();
        return;
      }

      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const wsUrl = baseUrl.replace('http', 'ws');

      // Create two WebSocket connections
      const ws1 = new WebSocket(wsUrl);
      const ws2 = new WebSocket(wsUrl);

      let ws1Ready = false;
      let ws2Ready = false;

      // First user joins the conversation
      ws1.on('open', () => {
        ws1.send(
          JSON.stringify({
            type: 'join_conversation',
            payload: {
              userId: testUser1.id,
              conversationId,
            },
          })
        );
      });

      // Second user joins the conversation
      ws2.on('open', () => {
        ws2.send(
          JSON.stringify({
            type: 'join_conversation',
            payload: {
              userId: testUser2.id,
              conversationId,
            },
          })
        );
      });

      // Handle messages for first user
      ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());

        if (message.type === 'conversation_history') {
          ws1Ready = true;

          // If both users are ready, send a test message
          if (ws1Ready && ws2Ready) {
            ws1.send(
              JSON.stringify({
                type: 'new_message',
                payload: {
                  message: {
                    id: 'test-message-id',
                    content: 'Hello from WebSocket test!',
                    sender: testUser1,
                    timestamp: new Date(),
                  },
                },
              })
            );
          }
        }

        // First user should not receive their own message back
      });

      // Handle messages for second user
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());

        if (message.type === 'conversation_history') {
          ws2Ready = true;

          // If both users are ready, first user will send a message
          if (ws1Ready && ws2Ready) {
            // Do nothing, ws1 will send the message
          }
        }

        if (message.type === 'new_message') {
          expect(message.payload).toBeDefined();
          expect(message.payload.message).toBeDefined();
          expect(message.payload.message.content).toBe(
            'Hello from WebSocket test!'
          );
          expect(message.payload.message.sender.id).toBe(testUser1.id);

          // Clean up
          ws1.close();
          ws2.close();
          done();
        }
      });

      // Handle errors
      ws1.on('error', (error) => {
        fail(`WebSocket 1 error: ${error.message}`);
        ws1.close();
        ws2.close();
        done();
      });

      ws2.on('error', (error) => {
        fail(`WebSocket 2 error: ${error.message}`);
        ws1.close();
        ws2.close();
        done();
      });

      // Store ws1 for cleanup
      ws = ws1;
    });
  });
});
