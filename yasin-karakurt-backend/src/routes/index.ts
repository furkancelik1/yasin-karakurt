import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import programRoutes from '../modules/programs/program.routes';
import checkInRoutes from '../modules/checkins/checkin.routes';
import subscriptionRoutes from '../modules/subscriptions/subscription.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/programs', programRoutes);
router.use('/check-ins', checkInRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
