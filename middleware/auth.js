import { ObjectId } from 'mongodb';
import AuthTokenHandler from '../utils/tokens';
import UsersCollection from '../utils/users';

async function authenticateToken(req, res, next) {
  const { method, path } = req;
  if (method === 'GET' && path.toLowerCase().match(/\/files\/.*\/data\/?/)) return next();
  const token = req.get('X-Token');
  let userId = await AuthTokenHandler.getUserByToken(token);

  userId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  const user = await UsersCollection.getUser({ _id: userId });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  req.user = user;
  return next();
}

export default authenticateToken;
