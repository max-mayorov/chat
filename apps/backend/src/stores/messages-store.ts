import { ConversationImpl, Message } from '@chat/domain';
import { DomainFactory } from '@chat/domain';
import { MongoClient, Collection, Db } from 'mongodb';
export type MessagesStore = {
  getMessages: () => Promise<Message[]>;
  addMessage: (message: Message) => Promise<boolean>;
  clearMessages: () => Promise<boolean>;
};

export class InMemoryMessagesStoreImpl implements MessagesStore {
  private conversation: ConversationImpl = DomainFactory.getConversation();

  async getMessages(): Promise<Message[]> {
    console.log('InMemoryMessagesStoreImpl.getMessages() called');
    return this.conversation.messages ?? [];
  }

  async addMessage(message: Message): Promise<boolean> {
    if (!this.conversation) {
      this.conversation = DomainFactory.getConversation();
    }

    this.conversation.addMessage(message);
    return true;
  }

  async clearMessages(): Promise<boolean> {
    this.conversation.messages = [];
    return true;
  }
}

export class MongoMessagesStoreImpl implements MessagesStore {
  private client: MongoClient;
  private db: Db | null = null;
  private collection: Collection<Message> | null = null;
  private readonly mongoUri: string;
  private readonly dbName: string = 'chatApp';
  private readonly collectionName: string = 'messages';

  constructor(
    mongoUri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  ) {
    this.mongoUri = mongoUri;
    this.client = new MongoClient(this.mongoUri);
  }

  /**
   * Initialize the MongoDB connection
   */
  async connect(): Promise<void> {
    try {
      console.log('Connecting to MongoDB...', this.dbName, this.collectionName);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection<Message>(this.collectionName);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Close the MongoDB connection
   */
  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }

  /**
   * Get all messages
   */
  async getMessages(): Promise<Message[]> {
    if (!this.collection) {
      await this.connect();
    }

    try {
      return await this.collection!.find().sort({ timestamp: 1 }).toArray();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Add a message to the database
   */
  async addMessage(message: Message): Promise<boolean> {
    if (!this.collection) {
      await this.connect();
    }

    try {
      const result = await this.collection!.insertOne(message);
      return !!result.acknowledged;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  /**
   * Clear all messages (for testing purposes)
   */
  async clearMessages(): Promise<boolean> {
    if (!this.collection) {
      await this.connect();
    }

    try {
      const result = await this.collection!.deleteMany({});
      return !!result.acknowledged;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  }
}

let messagesStoreImpl: MessagesStore;
console.log('Implementing STORE_TYPE:', process.env.STORE_TYPE);
switch (process.env.STORE_TYPE) {
  case 'mongodb': {
    console.log('Using MongoDB for messages store');
    const mongoStoreImpl = new MongoMessagesStoreImpl();
    mongoStoreImpl.connect().catch((error: any) => {
      console.error('Failed to connect to MongoDB:', error);
    });
    messagesStoreImpl = mongoStoreImpl;
    break;
  }
  case 'inmemory': {
    messagesStoreImpl = new InMemoryMessagesStoreImpl();
    break;
  }
  default: {
    console.error('Invalid STORE_TYPE. Defaulting to in-memory store.');
    messagesStoreImpl = new InMemoryMessagesStoreImpl();
    break;
  }
}

export const messagesStore = messagesStoreImpl;
