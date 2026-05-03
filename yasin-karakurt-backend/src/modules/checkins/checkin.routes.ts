import { Router } from 'express';
import {
  getAllCheckins,
  getAllForTrainer,
  getCheckinById,
  updateCheckinStatus,
  reviewCheckin,
} from './checkin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Trainer-specific routes — specific paths before parameterized routes
router.get('/trainer', authenticate, authorize('TRAINER'), getAllForTrainer);
router.patch('/:id/review', authenticate, authorize('TRAINER'), reviewCheckin);

// General routes
router.get('/', getAllCheckins);
router.get('/:id', getCheckinById);
router.patch('/:id/status', updateCheckinStatus);

export default router;
