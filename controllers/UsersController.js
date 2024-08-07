import sha1 from 'sha1';
import { ObjectId } from 'mongodb'; // Import ObjectId from mongodb
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * Handles the creation of a new user.
   * @param {Object} req - The request object containing user data.
   * @param {Object} res - The response object for sending responses.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const usersCollection = dbClient.getCollection('users');
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      return res.status(201).json({ id: result.insertedId.toString(), email });
    } catch (error) {
      console.error('Error creating new user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Retrieves the authenticated user's information.
   * @param {Object} req - The request object containing user data.
   * @param {Object} res - The response object for sending responses.
   */
  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const usersCollection = dbClient.getCollection('users');
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id.toString(), email: user.email });
    } catch (error) {
      console.error('Error retrieving user info:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
