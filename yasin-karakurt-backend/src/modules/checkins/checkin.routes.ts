import { Router } from 'express';
import * as checkInController from './checkin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my', checkInController.myCheckIns);
router.post('/', checkInController.submit);
router.get('/:id', checkInController.getById);
router.patch('/:id/review', authorize('TRAINER', 'ADMIN'), checkInController.review);

export default router;
