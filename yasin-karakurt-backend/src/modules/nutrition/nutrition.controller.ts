import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';
import { NutritionService } from './nutrition.service';

export const createNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    console.log('[createNutritionPlan] Request body:', JSON.stringify(body, null, 2));

    const userId = body.userId as string;

    if (!userId) {
      console.log('[createNutritionPlan] HATA: userId yok');
      res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
      return;
    }

    const targetCalories = Number(body.targetCalories) || 0;
    const protein = Number(body.protein) || 0;
    const carbs = Number(body.carbs) || 0;
    const fat = Number(body.fat) || 0;
    const title = body.title as string | undefined;
    const notes = body.notes as string | undefined;
    
    const rawMeals = body.meals as Array<{ name?: string; content?: string; time?: string; order?: number }> | undefined;
    const meals: Array<{ name: string; content: string; time: string; order: number }> = [];
    
    if (rawMeals && rawMeals.length > 0) {
      for (const m of rawMeals) {
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
    const finalMeals = meals.length > 0 ? meals : undefined;

    console.log('[createNutritionPlan] Veriler:', { userId, targetCalories, protein, carbs, fat, finalMeals });

    const plan = await NutritionService.createPlan({
      userId,
      title,
      targetCalories,
      protein,
      carbs,
      fat,
      notes,
      meals: finalMeals,
    });

    console.log('[createNutritionPlan] Plan oluşturuldu:', plan.id);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error('[createNutritionPlan] HATA:', error);
    console.error('[createNutritionPlan] Stack:', error instanceof Error ? error.stack : 'N/A');
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
    console.error('Aktif plan çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
      return;
    }

    const plan = await NutritionService.getActivePlan(userId);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Beslenme planı çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const updateNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, targetCalories, protein, carbs, fat, notes, meals } = req.body as {
      title?: string;
      targetCalories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      notes?: string;
      meals?: Array<{ name: string; content?: string; time?: string; order?: number }>;
    };

    const plan = await NutritionService.updatePlan(id, {
      title,
      targetCalories,
      protein,
      carbs,
      fat,
      notes,
      meals,
    });

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Beslenme planı güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const deleteNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await NutritionService.deactivatePlan(id);

    res.status(200).json({ success: true, message: 'Beslenme planı silindi.' });
  } catch (error) {
    console.error('Beslenme planı silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const toggleMealComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mealId } = req.params;

    const updated = await NutritionService.toggleMealComplete(mealId);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Öğün güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};