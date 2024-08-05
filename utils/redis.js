import redis from 'redis';

/**
 * RedisClient class for interacting with a Redis database.
 */
class RedisClient {
  /**
   * Initializes a new instance of RedisClient.
   */
  constructor() {
    this.client = redis.createClient();

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis client not connected to the server:', err);
    });
  }

  /**
   * Check if the Redis client is alive.
   * @returns {boolean} - True if the client is connected, otherwise false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Retrieves the value associated with the specified key.
   * @param {string} key - The key to get the value for.
   * @returns {Promise<string|null>} - A promise that resolves with the value or null if not found.
   */
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

  /**
   * Sets the value for the specified key with an expiration time.
   * @param {string} key - The key to set the value for.
   * @param {string} value - The value to set.
   * @param {number} duration - The expiration time in seconds.
   * @returns {Promise<string>} - A promise that resolves with the reply from Redis.
   */
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

  /**
   * Deletes the specified key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} - A promise that resolves with the number of keys removed (1 if successful, 0 otherwise).
   */
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
