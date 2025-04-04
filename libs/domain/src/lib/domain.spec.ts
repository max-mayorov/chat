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

    it('should edit message content', () => {
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

      message.edit('Updated content');
      expect(message.content).toBe('Updated content');
    });
  });

  describe('Conversation', () => {
    it('should create a conversation', () => {
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
        id: '1',
        participants: [user1, user2],
        messages: [],
        name: 'Group Chat',
        createdAt: new Date(),
      });

      expect(conversation.id).toBe('1');
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.messages).toHaveLength(0);
      expect(conversation.name).toBe('Group Chat');
    });

    it('should add and remove participants', () => {
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

      const user3 = new UserImpl({
        id: '3',
        username: 'bob_smith',
        name: 'Bob Smith',
        createdAt: new Date(),
      });

      const conversation = new ConversationImpl({
        id: '1',
        participants: [user1, user2],
        messages: [],
        createdAt: new Date(),
      });

      // Add a new participant
      conversation.addParticipant(user3);
      expect(conversation.participants).toHaveLength(3);

      // Try to add the same participant again (should not duplicate)
      conversation.addParticipant(user3);
      expect(conversation.participants).toHaveLength(3);

      // Remove a participant
      conversation.removeParticipant(user2.id);
      expect(conversation.participants).toHaveLength(2);
      expect(
        conversation.participants.find((p) => p.id === user2.id)
      ).toBeUndefined();
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
        id: '1',
        participants: [user1, user2],
        messages: [],
        createdAt: new Date(),
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

    it('should create a conversation with factory', () => {
      const user1 = DomainFactory.createUser('1', 'john_doe', 'John Doe');
      const user2 = DomainFactory.createUser('2', 'jane_doe', 'Jane Doe');

      const conversation = DomainFactory.createConversation(
        '1',
        [user1, user2],
        'Group Chat'
      );

      expect(conversation.id).toBe('1');
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.messages).toHaveLength(0);
      expect(conversation.name).toBe('Group Chat');
      expect(conversation.createdAt).toBeInstanceOf(Date);
    });
  });
});
