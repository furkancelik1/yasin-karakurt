import { Router } from 'express';
import { logWater, getTodayWater } from './water.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/log', authenticate, logWater);
router.get('/today', authenticate, getTodayWater);

export default router;