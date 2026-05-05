import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import checkinRoutes from '../modules/checkins/checkin.routes';
import userRoutes from '../modules/users/user.routes';
import programRoutes from '../modules/programs/program.routes';
import { getDashboardStats } from '../modules/dashboard/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/checkins', checkinRoutes);
router.use('/users', userRoutes);
router.use('/programs', programRoutes);
router.get('/dashboard/stats', authenticate, getDashboardStats);

export default router;