import { Response } from 'express';
import { AuthRequest } from '../../types';
import { NutritionService } from './nutrition.service';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../config/database';

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
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!userId) {
      res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
      return;
    }

    // IDOR koruması: Sadece ADMIN/TRAINER başkaları için plan oluşturabilir
    if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
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
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getActivePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!userId || userId === 'me') {
      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
        return;
      }
      const plan = await NutritionService.getActivePlan(currentUserId);
      res.status(200).json({ success: true, data: plan });
      return;
    }

    // IDOR koruması: Client sadece kendi planını görebilir
    if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
      return;
    }

    const plan = await NutritionService.getActivePlan(userId);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!userId || userId === 'me') {
      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
        return;
      }
      const plan = await NutritionService.getActivePlan(currentUserId);
      res.status(200).json({ success: true, data: plan });
      return;
    }

    // IDOR koruması: Client sadece kendi planını görebilir
    if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
      return;
    }

    const plan = await NutritionService.getActivePlan(userId);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const updateNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!id) {
      res.status(400).json({ success: false, message: 'Plan ID gerekli.' });
      return;
    }

    // Planın sahibini bul
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPlan) {
      res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
      return;
    }

    // IDOR koruması: Sadece plan sahibi veya ADMIN/TRAINER güncelleyebilir
    if (existingPlan.userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu planı güncelleme yetkiniz yok.' });
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
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const deleteNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!id) {
      res.status(400).json({ success: false, message: 'Plan ID gerekli.' });
      return;
    }

    // Planın sahibini bul
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPlan) {
      res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
      return;
    }

    // IDOR koruması: Sadece plan sahibi veya ADMIN/TRAINER silebilir
    if (existingPlan.userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu planı silme yetkiniz yok.' });
      return;
    }

    await NutritionService.deactivatePlan(id);
    res.status(200).json({ success: true, message: 'Plan silindi.' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const toggleMealComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mealId } = req.params;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!mealId) {
      res.status(400).json({ success: false, message: 'Öğün ID gerekli.' });
      return;
    }

    // Öğünün sahibi olan planı bul
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { plan: { select: { userId: true } } },
    });

    if (!meal) {
      res.status(404).json({ success: false, message: 'Öğün bulunamadı.' });
      return;
    }

    // IDOR koruması: Sadece plan sahibi veya ADMIN/TRAINER değiştirebilir
    if (meal.plan.userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu öğünü değiştirme yetkiniz yok.' });
      return;
    }

    const updated = await NutritionService.toggleMealComplete(mealId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};