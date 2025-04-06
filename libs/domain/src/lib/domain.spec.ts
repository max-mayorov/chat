import {
  UserImpl,
  MessageImpl,
  ConversationImpl,
  DomainFactory,
} from './domain.js';

describe('Domain Model', () => {
  describe('User', () => {
    it('should create a user', () => {
      const user = new UserImpl({
        id: '1',
        username: 'john_doe',
        name: 'John Doe',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
      });

      expect(user.id).toBe('1');
      expect(user.username).toBe('john_doe');
      expect(user.name).toBe('John Doe');
      expect(user.avatar).toBe('avatar.jpg');
    });

    it('should update user profile', () => {
      const user = new UserImpl({
        id: '1',
        username: 'john_doe',
        name: 'John Doe',
        createdAt: new Date(),
      });

      user.updateProfile({ name: 'John Updated', avatar: 'new-avatar.jpg' });

      expect(user.name).toBe('John Updated');
      expect(user.avatar).toBe('new-avatar.jpg');
    });
  });

  describe('Message', () => {
    it('should create a message', () => {
      const user = new UserImpl({
        id: '1',
        username: 'john_doe',
        name: 'John Doe',
        createdAt: new Date(),
      });

      const message = new MessageImpl({
        id: '1',
        content: 'Hello, world!',
        sender: user,
        timestamp: new Date(),
      });

      expect(message.id).toBe('1');
      expect(message.content).toBe('Hello, world!');
      expect(message.sender).toBe(user);
    });
  });

  describe('Conversation', () => {
    it('should create a conversation', () => {
      const conversation = new ConversationImpl({
        messages: [],
      });

      expect(conversation.messages).toHaveLength(0);
    });

    it('should add messages to the conversation', () => {
      const user1 = new UserImpl({
        id: '1',
        username: 'john_doe',
        name: 'John Doe',
        createdAt: new Date(),
      });

      const user2 = new UserImpl({
        id: '2',
        username: 'jane_doe',
        name: 'Jane Doe',
        createdAt: new Date(),
      });

      const conversation = new ConversationImpl({
        messages: [],
      });

      const message1 = new MessageImpl({
        id: '1',
        content: 'Hello!',
        sender: user1,
        timestamp: new Date(),
      });

      const message2 = new MessageImpl({
        id: '2',
        content: 'Hi there!',
        sender: user2,
        timestamp: new Date(),
      });

      conversation.addMessage(message1);
      expect(conversation.messages).toHaveLength(1);

      conversation.addMessage(message2);
      expect(conversation.messages).toHaveLength(2);
    });
  });

  describe('DomainFactory', () => {
    it('should create a user with factory', () => {
      const user = DomainFactory.createUser(
        '1',
        'john_doe',
        'John Doe',
        'avatar.jpg'
      );

      expect(user.id).toBe('1');
      expect(user.username).toBe('john_doe');
      expect(user.name).toBe('John Doe');
      expect(user.avatar).toBe('avatar.jpg');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create a message with factory', () => {
      const user = DomainFactory.createUser('1', 'john_doe', 'John Doe');
      const message = DomainFactory.createMessage('1', 'Hello, world!', user);

      expect(message.id).toBe('1');
      expect(message.content).toBe('Hello, world!');
      expect(message.sender).toBe(user);
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should get a conversation with factory', () => {
      const conversation = DomainFactory.getConversation();
      expect(conversation.messages).toHaveLength(0);
    });
  });
});
