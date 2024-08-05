import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis client not connected to the server:', err);
    });
  }

  // Check if the client is alive
  isAlive() {
    return this.client.connected;
  }

  // Get value for a given key
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  // Set value for a given key with expiration
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  // Delete a key
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
