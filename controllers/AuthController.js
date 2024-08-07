import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class AuthController {
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

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

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
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
