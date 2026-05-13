"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionService = void 0;
const database_1 = require("../../config/database");
const notification_service_1 = require("../notifications/notification.service");
class NutritionService {
    static async createPlan(data) {
        console.log('[NutritionService.createPlan] Başladı with data:', data);
        const plan = await database_1.prisma.$transaction(async (tx) => {
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
        await (0, notification_service_1.createNotification)({
            userId: data.userId,
            title: '🥗 Yeni Beslenme Planın Hazır!',
            message: 'Koçun senin için yeni bir beslenme programı hazırladı. Hemen detaylara göz at.',
            type: 'PROGRAM_ASSIGNED',
        });
        return plan;
    }
    static async getActivePlan(userId) {
        const plan = await database_1.prisma.nutritionPlan.findFirst({
            where: { userId, isActive: true },
            include: {
                meals: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        return plan;
    }
    static async getPlanById(planId) {
        const plan = await database_1.prisma.nutritionPlan.findUnique({
            where: { id: planId },
            include: {
                meals: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        return plan;
    }
    static async updatePlan(planId, data) {
        const updates = {};
        if (data.title !== undefined)
            updates.title = data.title;
        if (data.targetCalories !== undefined)
            updates.targetCalories = data.targetCalories;
        if (data.protein !== undefined)
            updates.protein = data.protein;
        if (data.carbs !== undefined)
            updates.carbs = data.carbs;
        if (data.fat !== undefined)
            updates.fat = data.fat;
        if (data.notes !== undefined)
            updates.notes = data.notes;
        const plan = await database_1.prisma.nutritionPlan.update({
            where: { id: planId },
            data: updates,
            include: {
                meals: { orderBy: { order: 'asc' } },
            },
        });
        if (data.meals) {
            await database_1.prisma.meal.deleteMany({ where: { planId } });
            await database_1.prisma.meal.createMany({
                data: data.meals.map((m, i) => ({
                    planId,
                    name: m.name,
                    content: m.content || '',
                    time: m.time || '',
                    order: m.order ?? i,
                })),
            });
        }
        return database_1.prisma.nutritionPlan.findUnique({
            where: { id: planId },
            include: { meals: { orderBy: { order: 'asc' } } },
        });
    }
    static async deactivatePlan(planId) {
        return database_1.prisma.nutritionPlan.update({
            where: { id: planId },
            data: { isActive: false },
        });
    }
    static async toggleMealComplete(mealId) {
        const meal = await database_1.prisma.meal.findUnique({ where: { id: mealId } });
        if (!meal)
            throw new Error('Öğün bulunamadı');
        return database_1.prisma.meal.update({
            where: { id: mealId },
            data: { isDone: !meal.isDone },
        });
    }
}
exports.NutritionService = NutritionService;
