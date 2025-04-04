import Koa, { Context } from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import websockify from 'koa-websocket';
import cors from '@koa/cors';
import { errorHandler } from './middleware/index.js';
import { conversationController } from './controllers/index.js';
import { webSocketController } from './services/websocket.js';

// Environment variables
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = websockify(new Koa());

// Set up middleware
app.use(errorHandler);
app.use(cors());
app.use(bodyParser());

// Set up routes
const router = new Router({ prefix: '/api' });
const wsRouter = new Router({ prefix: '/' });

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

wsRouter.get(
  '/',
  webSocketController.handleConnection.bind(webSocketController)
);
app.ws.use(wsRouter.routes());
app.ws.use(wsRouter.allowedMethods());

// Error handling
app.on('error', (err: Error, ctx: Context) => {
  console.error('Server error:', { err, ctx });
});

app.listen(port, host, () => {
  console.log(`Server is running on port ${port}`);
});
