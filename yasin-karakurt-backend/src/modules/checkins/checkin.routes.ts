import { Router } from 'express';
import {
  getAllCheckins,
  getAllForTrainer,
  getCheckinById,
  updateCheckinStatus,
  reviewCheckin,
  createCheckin,
  getCheckInsByUserId
} from './checkin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware'; 

const router = Router();

// Trainer-specific routes
router.get('/trainer', authenticate, authorize('TRAINER', 'ADMIN'), getAllForTrainer);
router.get('/client/:userId', authenticate, authorize('TRAINER', 'ADMIN'), getCheckInsByUserId);
router.patch('/:id/review', authenticate, authorize('TRAINER', 'ADMIN'), reviewCheckin);

// Danışan (Client) için POST rotası
router.post('/', authenticate, upload.array('photos', 5), createCheckin); 

// General routes
router.get('/', getAllCheckins);
router.get('/:id', getCheckinById);
router.patch('/:id/status', updateCheckinStatus);

export default router;