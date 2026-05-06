import { Router } from 'express';
import {
  getAllCheckins,
  getAllForTrainer,
  getCheckinById,
  updateCheckinStatus,
  reviewCheckin,
  createCheckin,
  getCheckInsByUserId,
  getCheckInStats,
  getClientStats,
  getCheckInSummary
} from './checkin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware'; 

const router = Router();

router.post('/', authenticate, upload.array('photos', 5), createCheckin);

router.get('/stats', authenticate, getCheckInStats);
router.get('/client/:userId/stats', authenticate, authorize('TRAINER', 'ADMIN'), getClientStats);
router.get('/summary/:userId', authenticate, authorize('TRAINER', 'ADMIN'), getCheckInSummary);
router.get('/trainer', authenticate, authorize('TRAINER', 'ADMIN'), getAllForTrainer);
router.get('/client/:userId', authenticate, authorize('TRAINER', 'ADMIN'), getCheckInsByUserId);
router.patch('/:id/review', authenticate, authorize('TRAINER', 'ADMIN'), reviewCheckin);

router.get('/', getAllCheckins);
router.get('/:id', getCheckinById);
router.patch('/:id/status', updateCheckinStatus);

export default router;