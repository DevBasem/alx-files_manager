import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  /**
   * Handles the upload of a new file or creation of a new folder.
   * @param {Object} req - The request object containing file data.
   * @param {Object} res - The response object for sending responses.
   */
  static async postUpload(req, res) {
    // Existing code for postUpload
  }

  /**
   * Retrieves a file document by its ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getShow(req, res) {
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
      const fileId = req.params.id;
      const filesCollection = dbClient.getCollection('files');
      const file = await filesCollection.findOne({ _id: dbClient.mongoClient.ObjectID(fileId), userId: dbClient.mongoClient.ObjectID(userId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Retrieves a list of file documents for a specific parentId and with pagination.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getIndex(req, res) {
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
      const { parentId = 0, page = 0 } = req.query;
      const filesCollection = dbClient.getCollection('files');
      const limit = 20;
      const skip = page * limit;
      const query = {
        userId: dbClient.mongoClient.ObjectID(userId),
        parentId: parentId === '0' ? 0 : dbClient.mongoClient.ObjectID(parentId),
      };

      const files = await filesCollection.find(query).skip(skip).limit(limit).toArray();

      return res.json(files.map(file => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      })));
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
