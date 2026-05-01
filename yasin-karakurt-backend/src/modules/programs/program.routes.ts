import { Router } from 'express';
import * as programController from './program.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my', programController.myPrograms);
router.get('/:id', programController.getById);
router.post('/', authorize('TRAINER', 'ADMIN'), programController.create);
router.patch('/:id', authorize('TRAINER', 'ADMIN'), programController.update);

export default router;
