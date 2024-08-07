import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// Default folder path
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH, { recursive: true });
}

class FilesController {
  /**
   * Handles the file upload and folder creation.
   * @param {Object} req - The request object containing file data.
   * @param {Object} res - The response object for sending responses.
   */
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: dbClient.mongoClient.ObjectID(parentId) });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    try {
      let localPath = '';
      if (type === 'file' || type === 'image') {
        const fileUUID = crypto.randomUUID();
        localPath = path.join(FOLDER_PATH, fileUUID);
        const fileBuffer = Buffer.from(data, 'base64');
        fs.writeFileSync(localPath, fileBuffer);
      }

      const newFile = {
        userId,
        name,
        type,
        parentId: parentId !== 0 ? dbClient.mongoClient.ObjectID(parentId) : 0,
        isPublic,
        localPath: type === 'file' || type === 'image' ? localPath : undefined,
      };

      const result = await dbClient.db.collection('files').insertOne(newFile);

      return res.status(201).json({ id: result.insertedId, ...newFile });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
