import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  /**
   * Handles GET /status endpoint.
   * @param {import("express").Request} req - The request object.
   * @param {import("express").Response} res - The response object.
   */
  static async getStatus(req, res) {
    try {
      const redisStatus = redisClient.isAlive();
      const dbStatus = dbClient.isAlive();

      res.status(200).json({
        redis: redisStatus,
        db: dbStatus,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handles GET /stats endpoint.
   * @param {import("express").Request} req - The request object.
   * @param {import("express").Response} res - The response object.
   */
  static async getStats(req, res) {
    try {
      const userCount = await dbClient.nbUsers();
      const fileCount = await dbClient.nbFiles();

      res.status(200).json({
        users: userCount,
        files: fileCount,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
