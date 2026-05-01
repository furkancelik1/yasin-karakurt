import { Router } from 'express';
import * as subController from './subscription.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my', subController.getMy);
router.post('/initiate', subController.initiate);
router.post('/cancel', subController.cancel);

export default router;
