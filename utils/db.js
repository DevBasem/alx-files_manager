import { MongoClient } from 'mongodb';

// Environment variables or default values
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

class DBClient {
  constructor() {
    this.db = null;
    this.client = null;
    this.connected = false;

    // Connect to MongoDB
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.error('MongoDB connection error:', error);
        this.connected = false;
        return;
      }

      this.client = client;
      this.db = client.db(database);
      this.connected = true;

      // Ensure collections are created
      this.db.createCollection('users', (err) => {
        if (err && err.codeName !== 'NamespaceExists') {
          console.error('Error creating users collection:', err);
        }
      });

      this.db.createCollection('files', (err) => {
        if (err && err.codeName !== 'NamespaceExists') {
          console.error('Error creating files collection:', err);
        }
      });

      console.log('MongoDB client connected');
    });
  }

  // Check if the client is connected
  async isAlive() {
    return this.connected;
  }

  // Get the number of documents in the users collection
  async nbUsers() {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return this.db.collection('users').countDocuments();
  }

  // Get a user by query
  async getUser(query) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    console.log('QUERY IN DB.JS', query);
    const user = await this.db.collection('users').findOne(query);
    console.log('GET USER IN DB.JS', user);
    return user;
  }

  // Get the number of documents in the files collection
  async nbFiles() {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return this.db.collection('files').countDocuments();
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
