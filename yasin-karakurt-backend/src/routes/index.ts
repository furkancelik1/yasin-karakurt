import { Router } from 'express';
import checkinRoutes from '../modules/checkins/checkin.routes';
import authRoutes from '../modules/auth/auth.routes'; // 1. EKSİK: Auth rotasını import etmeliyiz

const router = Router();

// /api/v1/checkins adresine gelen istekleri checkin modülüne yönlendirir
router.use('/checkins', checkinRoutes);

// 2. EKSİK: Auth rotasını yorum satırından çıkarıp aktif hale getiriyoruz
router.use('/auth', authRoutes);

// İleride users rotasını da kullanacağında burayı da açarsın
// import userRoutes from '../modules/users/user.routes';
// router.use('/users', userRoutes);

export default router;