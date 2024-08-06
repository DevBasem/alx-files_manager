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
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const filesCollection = dbClient.getCollection('files');
      let parentFile = null;
      
      if (parentId !== 0) {
        parentFile = await filesCollection.findOne({ _id: dbClient.mongoClient.ObjectID(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const newFile = {
        userId: dbClient.mongoClient.ObjectID(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? '0' : dbClient.mongoClient.ObjectID(parentId).toString(),
        localPath: null,
      };

      if (type !== 'folder') {
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
        const localPath = path.join(FOLDER_PATH, uuidv4());

        await fs.mkdir(FOLDER_PATH, { recursive: true });
        await fs.writeFile(localPath, Buffer.from(data, 'base64'));

        newFile.localPath = localPath;
      }

      const result = await filesCollection.insertOne(newFile);
      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId: newFile.parentId,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
