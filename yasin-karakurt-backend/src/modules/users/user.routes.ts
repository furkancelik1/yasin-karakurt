import { Router } from 'express';
import { getClients, getUserById } from './user.controller';
import { getMyPrograms } from '../programs/userProgram.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/clients', authenticate, authorize('TRAINER', 'ADMIN'), getClients);
router.get('/program', authenticate, getMyPrograms);
router.get('/:id', authenticate, authorize('TRAINER', 'ADMIN'), getUserById);

export default router;
