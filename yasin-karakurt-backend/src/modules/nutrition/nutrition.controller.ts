import { Response } from 'express';
import { AuthRequest } from '../../types';
import { NutritionService } from './nutrition.service';

interface NutritionBody {
  userId: string;
  title?: string;
  targetCalories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  meals?: Array<{ name?: string; content?: string; time?: string; order?: number }>;
}

interface MealInput {
  name: string;
  content: string;
  time: string;
  order: number;
}

export const createNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as NutritionBody;
    const userId = body.userId;

    if (!userId) {
      res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
      return;
    }

    const targetCalories = Number(body.targetCalories) || 0;
    const protein = Number(body.protein) || 0;
    const carbs = Number(body.carbs) || 0;
    const fat = Number(body.fat) || 0;
    
    const meals: MealInput[] = [];
    if (body.meals) {
      for (const m of body.meals) {
        if (m.name && m.name.trim()) {
          meals.push({
            name: m.name,
            content: m.content || '',
            time: m.time || '',
            order: m.order || 0,
          });
        }
      }
    }

    const plan = await NutritionService.createPlan({
      userId,
      title: body.title,
      targetCalories,
      protein,
      carbs,
      fat,
      notes: body.notes,
      meals: meals.length > 0 ? meals : undefined,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getActivePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'me') {
      if (!req.user?.sub) {
        res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
        return;
      }
      const plan = await NutritionService.getActivePlan(req.user.sub);
      res.status(200).json({ success: true, data: plan });
      return;
    }

    const plan = await NutritionService.getActivePlan(userId);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'me') {
      if (!req.user?.sub) {
        res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
        return;
      }
      const plan = await NutritionService.getActivePlan(req.user.sub);
      res.status(200).json({ success: true, data: plan });
      return;
    }

    const plan = await NutritionService.getActivePlan(userId);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const updateNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    if (!id) {
      res.status(400).json({ success: false, message: 'Plan ID gerekli.' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.targetCalories !== undefined) updateData.targetCalories = Number(body.targetCalories);
    if (body.protein !== undefined) updateData.protein = Number(body.protein);
    if (body.carbs !== undefined) updateData.carbs = Number(body.carbs);
    if (body.fat !== undefined) updateData.fat = Number(body.fat);
    if (body.notes !== undefined) updateData.notes = body.notes;

    const plan = await NutritionService.updatePlan(id, updateData);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const deleteNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: 'Plan ID gerekli.' });
      return;
    }

    await NutritionService.deactivatePlan(id);
    res.status(200).json({ success: true, message: 'Plan silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const toggleMealComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mealId } = req.params;

    if (!mealId) {
      res.status(400).json({ success: false, message: 'Öğün ID gerekli.' });
      return;
    }

    const updated = await NutritionService.toggleMealComplete(mealId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};