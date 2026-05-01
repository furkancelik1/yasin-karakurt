import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMyProfile);
router.patch('/me', userController.updateMyProfile);
router.get('/clients', authorize('TRAINER', 'ADMIN'), userController.listClients);

export default router;
