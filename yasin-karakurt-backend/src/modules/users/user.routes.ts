import { Router } from 'express';
import { getClients, getUserById, getMyProfile, updateMyProfile, changePassword, uploadProfileImage } from './user.controller';
import { getMyPrograms } from '../programs/userProgram.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../config/cloudinary';

const router = Router();

router.get('/clients', authenticate, authorize('TRAINER', 'ADMIN'), getClients);
router.get('/program', authenticate, getMyPrograms);
router.get('/profile', authenticate, getMyProfile);
router.patch('/profile', authenticate, updateMyProfile);
router.patch('/profile-image', authenticate, upload.single('avatar'), uploadProfileImage);
router.put('/password', authenticate, changePassword);
router.get('/:id', authenticate, authorize('TRAINER', 'ADMIN'), getUserById);

export default router;