import { Router } from 'express';
import checkinRoutes from '../modules/checkins/checkin.routes';

const router = Router();

// /api/v1/checkins adresine gelen istekleri checkin modülüne yönlendirir
router.use('/checkins', checkinRoutes);

// Varsa diğer rotaların da buraya gelecek
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

export default router;