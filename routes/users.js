import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import authenticateToken from '../middleware/auth';

const usersRouter = Router();
usersRouter.use('/users/me', authenticateToken);

usersRouter.post('/users', UsersController.postNew);

usersRouter.get('/users/me', AuthController.getMe);

export default usersRouter;
