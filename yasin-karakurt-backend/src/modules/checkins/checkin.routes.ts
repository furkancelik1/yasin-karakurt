import { Router } from 'express';
import {
  getAllCheckins,
  getAllForTrainer,
  getCheckinById,
  updateCheckinStatus,
  reviewCheckin,
  createCheckin // 1. POST işlemini yapacak controller fonksiyonunu ekle
} from './checkin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
// 2. Fotoğraf yüklemek için upload middleware'ini dahil et (yolunu kendi projene göre teyit et)
import { upload } from '../../middleware/upload.middleware'; 

const router = Router();

// Trainer-specific routes
router.get('/trainer', authenticate, authorize('TRAINER'), getAllForTrainer);
router.patch('/:id/review', authenticate, authorize('TRAINER'), reviewCheckin);

// Danışan (Client) için POST rotası - EKSİK OLAN BUYDU!
// "photos" frontend'den gelen formData'daki key adıyla aynı olmalı.
router.post('/', authenticate, upload.array('photos', 5), createCheckin); 

// General routes
router.get('/', getAllCheckins);
router.get('/:id', getCheckinById);
router.patch('/:id/status', updateCheckinStatus);

export default router;