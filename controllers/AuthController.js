import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  /**
   * Handles user sign-in and generates a new authentication token.
   * @param {Object} req - The request object containing authorization header.
   * @param {Object} res - The response object for sending responses.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    try {
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60); // Store token for 24 hours

      return res.status(200).json({ token }); // Ensure to return the response
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' }); // Ensure to return the response
    }
  }

  /**
   * Handles user sign-out by deleting the authentication token.
   * @param {Object} req - The request object containing token header.
   * @param {Object} res - The response object for sending responses.
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(`auth_${token}`);
      return res.status(204).send(); // Ensure to return the response
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' }); // Ensure to return the response
    }
  }
}

export default AuthController;
