import { prisma } from '../../config/database';
import { createNotification } from '../notifications/notification.service';
import { NotificationType } from '@prisma/client';

export class NutritionService {
  static async createPlan(data: {
    userId: string;
    title?: string;
    targetCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes?: string;
    meals?: Array<{
      name: string;
      content?: string;
      time?: string;
      order?: number;
    }>;
  }) {
    console.log('[NutritionService.createPlan] Başladı with data:', data);

    const plan = await prisma.$transaction(async (tx) => {
      console.log('[NutritionService] Transaction başladı');

      await tx.nutritionPlan.updateMany({
        where: { userId: data.userId, isActive: true },
        data: { isActive: false },
      });
      console.log('[NutritionService] Eski planlar pasif yapıldı');

      const createdPlan = await tx.nutritionPlan.create({
        data: {
          userId: data.userId,
          title: data.title,
          targetCalories: Number(data.targetCalories) || 0,
          protein: Number(data.protein) || 0,
          carbs: Number(data.carbs) || 0,
          fat: Number(data.fat) || 0,
          notes: data.notes,
          meals: data.meals && data.meals.length > 0 ? {
            create: data.meals.filter(m => m.name && m.name.trim()).map((m, i) => ({
              name: m.name,
              content: m.content || '',
              time: m.time || '',
              order: m.order ?? i,
            })),
          } : undefined,
        },
        include: {
          meals: {
            orderBy: { order: 'asc' },
          },
        },
      });
      console.log('[NutritionService] Plan oluşturuldu:', createdPlan.id);
      return createdPlan;
    });

    console.log('[NutritionService] Bildirim gönderiliyor...');
    await createNotification({
      userId: data.userId,
      title: '🥗 Yeni Beslenme Planın Hazır!',
      message: 'Koçun senin için yeni bir beslenme programı hazırladı. Hemen detaylara göz at.',
      type: 'PROGRAM_ASSIGNED' as NotificationType,
    });

    return plan;
  }

  static async getActivePlan(userId: string) {
    const plan = await prisma.nutritionPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        meals: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return plan;
  }

  static async getPlanById(planId: string) {
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: planId },
      include: {
        meals: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return plan;
  }

  static async updatePlan(planId: string, data: {
    title?: string;
    targetCalories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
    meals?: Array<{
      name: string;
      content?: string;
      time?: string;
      order?: number;
    }>;
  }) {
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.targetCalories !== undefined) updates.targetCalories = data.targetCalories;
    if (data.protein !== undefined) updates.protein = data.protein;
    if (data.carbs !== undefined) updates.carbs = data.carbs;
    if (data.fat !== undefined) updates.fat = data.fat;
    if (data.notes !== undefined) updates.notes = data.notes;

    const plan = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: updates,
      include: {
        meals: { orderBy: { order: 'asc' } },
      },
    });

    if (data.meals) {
      await prisma.meal.deleteMany({ where: { planId } });
      await prisma.meal.createMany({
        data: data.meals.map((m, i) => ({
          planId,
          name: m.name,
          content: m.content || '',
          time: m.time || '',
          order: m.order ?? i,
        })),
      });
    }

    return prisma.nutritionPlan.findUnique({
      where: { id: planId },
      include: { meals: { orderBy: { order: 'asc' } } },
    });
  }

  static async deactivatePlan(planId: string) {
    return prisma.nutritionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });
  }

  static async toggleMealComplete(mealId: string) {
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new Error('Öğün bulunamadı');

    return prisma.meal.update({
      where: { id: mealId },
      data: { isDone: !meal.isDone },
    });
  }
}