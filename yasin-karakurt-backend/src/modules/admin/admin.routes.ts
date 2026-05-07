import { Router } from 'express';
import { createClient } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.post('/clients', authenticate, authorize('TRAINER', 'ADMIN'), createClient);

export default router;