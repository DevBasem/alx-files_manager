import { MongoClient } from 'mongodb';

class DBClient {
  /**
   * Initializes a new instance of DBClient
   */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017; // Fixed typo from BD_PORT to DB_PORT
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;
    this.mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
    this.db = null;

    // Connect to MongoDB
    this.mongoClient.connect((error) => {
      if (error) {
        console.error('MongoDB connection error:', error);
      } else {
        this.db = this.mongoClient.db(database);
        console.log('MongoDB client connected');
      }
    });
  }

  /**
   * Check MongoDB client's connection status
   * @returns {boolean} MongoDB client connection status
   */
  isAlive() {
    return !!this.db;
  }

  /**
   * Retrieves specified collection from the database
   * @param {string} collectionName - Name of the collection to retrieve
   * @returns {import("mongodb").Collection} - Collection object
   */
  getCollection(collectionName) {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection(collectionName);
  }

  /**
   * Retrieves the number of documents in the 'users' collection
   * @returns {number} - Number of documents in 'users' collection
   */
  async nbUsers() {
    const usersCollection = this.getCollection('users');
    return usersCollection.countDocuments();
  }

  /**
   * Retrieves the number of documents in the 'files' collection
   * @returns {number} - Number of documents in 'files' collection
   */
  async nbFiles() {
    const filesCollection = this.getCollection('files');
    return filesCollection.countDocuments();
  }

  /**
   * Closes connection to MongoDB client
   */
  async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      console.log('MongoDB client disconnected');
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
