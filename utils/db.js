import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // Read environment variables or use default values
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // Create the MongoDB client
    this.client = new MongoClient(`mongodb://${host}:${port}`, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;

    // Connect to MongoDB
    this.client.connect()
      .then(() => {
        console.log('MongoDB client connected');
        this.db = this.client.db(database);
      })
      .catch(err => {
        console.error('MongoDB client connection error:', err);
      });
  }

  // Check if the client is connected
  async isAlive() {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (err) {
      return false;
    }
  }

  // Get the number of documents in the users collection
  async nbUsers() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    const usersCollection = this.db.collection('users');
    return usersCollection.countDocuments();
  }

  // Get the number of documents in the files collection
  async nbFiles() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    const filesCollection = this.db.collection('files');
    return filesCollection.countDocuments();
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
