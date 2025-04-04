import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { createServer } from 'http';
import { errorHandler } from './middleware/index.js';
import { conversationController } from './controllers/index.js';
import { WebSocketService } from './services/index.js';

// Environment variables
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Create Koa app
const app = new Koa();

// Create HTTP server
const server = createServer(app.callback());

// Create WebSocket service
const webSocketService = new WebSocketService(server);

// Set up middleware
app.use(errorHandler);
app.use(cors());
app.use(bodyParser());

// Set up routes
const router = new Router({ prefix: '/api' });

// Conversation routes
router.get(
  '/conversations',
  conversationController.getAllConversations.bind(conversationController)
);
router.get(
  '/conversations/:id',
  conversationController.getConversation.bind(conversationController)
);
router.post(
  '/conversations',
  conversationController.createConversation.bind(conversationController)
);
router.post(
  '/conversations/:id/messages',
  conversationController.addMessage.bind(conversationController)
);
router.post(
  '/conversations/:id/users',
  conversationController.addUserToConversation.bind(conversationController)
);
router.delete(
  '/conversations/:id/users/:userId',
  conversationController.removeUserFromConversation.bind(conversationController)
);
router.get(
  '/users/:userId/conversations',
  conversationController.getConversationsForUser.bind(conversationController)
);

// Register routes
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

// Start server
server.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ websocket ] ws://${host}:${port}`);
});
