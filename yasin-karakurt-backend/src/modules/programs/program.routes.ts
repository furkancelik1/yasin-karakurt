import { Router } from 'express';
import * as programController from './program.controller';
import * as userProgramController from './userProgram.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/my', programController.myPrograms);
router.get('/:id', programController.getById);
router.post('/', authorize('TRAINER', 'ADMIN'), programController.create);
router.patch('/:id', authorize('TRAINER', 'ADMIN'), programController.update);

router.get('/client/:userId', authorize('TRAINER', 'ADMIN'), userProgramController.getUserPrograms);
router.delete('/:id', authorize('TRAINER', 'ADMIN'), userProgramController.deleteUserProgram);

router.post('/assign', authorize('TRAINER', 'ADMIN'), upload.single('file'), userProgramController.assignProgram);

router.get('/my/programs', userProgramController.getMyPrograms);

export default router;
