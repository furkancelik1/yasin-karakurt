import { Router } from 'express';
import { getClients } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/clients', authenticate, authorize('TRAINER', 'ADMIN'), getClients);

export default router;
