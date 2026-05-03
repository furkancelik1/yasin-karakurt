import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import checkinRoutes from '../modules/checkins/checkin.routes';
import userRoutes from '../modules/users/user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/checkins', checkinRoutes);
router.use('/users', userRoutes);

export default router;