import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import authenticateToken from '../middleware/auth';

const authRouter = Router();

authRouter.use('/disconnect', authenticateToken);

authRouter.get('/connect', AuthController.getConnect);

authRouter.get('/disconnect', AuthController.getDisconnect);

export default authRouter;
