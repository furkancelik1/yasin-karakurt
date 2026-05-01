import { Router } from 'express';
import { getClients } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// /api/v1/users/clients -> Sadece giriş yapmış ADMIN'ler
router.get('/clients', authenticate, getClients);

export default router;