import { Router } from 'express';
import {
  createNutritionPlan,
  getActivePlan,
  getNutritionPlan,
  updateNutritionPlan,
  deleteNutritionPlan,
  toggleMealComplete,
} from './nutrition.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.post('/plan', authenticate, authorize('TRAINER', 'ADMIN'), createNutritionPlan);
router.get('/plan/active/:userId', authenticate, getActivePlan);
router.get('/plan/user/:userId', authenticate, getNutritionPlan);
router.patch('/plan/:id', authenticate, authorize('TRAINER', 'ADMIN'), updateNutritionPlan);
router.delete('/plan/:id', authenticate, authorize('TRAINER', 'ADMIN'), deleteNutritionPlan);
router.patch('/meal/:mealId/toggle', authenticate, toggleMealComplete);

export default router;