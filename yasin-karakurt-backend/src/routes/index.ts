import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import checkinRoutes from '../modules/checkins/checkin.routes';
import userRoutes from '../modules/users/user.routes';
import programRoutes from '../modules/programs/program.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import nutritionRoutes from '../modules/nutrition/nutrition.routes';
import waterRoutes from '../modules/water/water.routes';
import adminRoutes from '../modules/admin/admin.routes';

// YENİ EKLENEN SATIR: Abonelik rotalarını içe aktar
import subscriptionRoutes from '../modules/subscriptions/subscription.routes';

import { getDashboardStats } from '../modules/dashboard/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/checkins', checkinRoutes);
router.use('/users', userRoutes);
router.use('/programs', programRoutes);
router.use('/notifications', notificationRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/water', waterRoutes);
router.use('/admin', adminRoutes);

// YENİ EKLENEN SATIR: Gelen istekleri abonelik rotasına yönlendir
router.use('/subscriptions', subscriptionRoutes);

router.get('/dashboard/stats', authenticate, getDashboardStats);

export default router;