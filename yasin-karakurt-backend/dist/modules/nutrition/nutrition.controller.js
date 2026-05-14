"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMealComplete = exports.deleteNutritionPlan = exports.updateNutritionPlan = exports.getNutritionPlan = exports.getActivePlan = exports.createNutritionPlan = void 0;
const nutrition_service_1 = require("./nutrition.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const database_1 = require("../../config/database");
const createNutritionPlan = async (req, res) => {
    try {
        const body = req.body;
        const userId = body.userId;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
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
        const meals = [];
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
        const plan = await nutrition_service_1.NutritionService.createPlan({
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
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.createNutritionPlan = createNutritionPlan;
const getActivePlan = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        if (!userId || userId === 'me') {
            if (!currentUserId) {
                res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
                return;
            }
            const plan = await nutrition_service_1.NutritionService.getActivePlan(currentUserId);
            res.status(200).json({ success: true, data: plan });
            return;
        }
        // IDOR koruması: Client sadece kendi planını görebilir
        if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
            res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
            return;
        }
        const plan = await nutrition_service_1.NutritionService.getActivePlan(userId);
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getActivePlan = getActivePlan;
const getNutritionPlan = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        if (!userId || userId === 'me') {
            if (!currentUserId) {
                res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
                return;
            }
            const plan = await nutrition_service_1.NutritionService.getActivePlan(currentUserId);
            res.status(200).json({ success: true, data: plan });
            return;
        }
        // IDOR koruması: Client sadece kendi planını görebilir
        if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
            res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
            return;
        }
        const plan = await nutrition_service_1.NutritionService.getActivePlan(userId);
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getNutritionPlan = getNutritionPlan;
const updateNutritionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        if (!id) {
            res.status(400).json({ success: false, message: 'Plan ID gerekli.' });
            return;
        }
        // Planın sahibini bul
        const existingPlan = await database_1.prisma.nutritionPlan.findUnique({
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
        const updateData = {};
        if (body.title !== undefined)
            updateData.title = body.title;
        if (body.targetCalories !== undefined)
            updateData.targetCalories = Number(body.targetCalories);
        if (body.protein !== undefined)
            updateData.protein = Number(body.protein);
        if (body.carbs !== undefined)
            updateData.carbs = Number(body.carbs);
        if (body.fat !== undefined)
            updateData.fat = Number(body.fat);
        if (body.notes !== undefined)
            updateData.notes = body.notes;
        const plan = await nutrition_service_1.NutritionService.updatePlan(id, updateData);
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.updateNutritionPlan = updateNutritionPlan;
const deleteNutritionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        if (!id) {
            res.status(400).json({ success: false, message: 'Plan ID gerekli.' });
            return;
        }
        // Planın sahibini bul
        const existingPlan = await database_1.prisma.nutritionPlan.findUnique({
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
        await nutrition_service_1.NutritionService.deactivatePlan(id);
        res.status(200).json({ success: true, message: 'Plan silindi.' });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.deleteNutritionPlan = deleteNutritionPlan;
const toggleMealComplete = async (req, res) => {
    try {
        const { mealId } = req.params;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        if (!mealId) {
            res.status(400).json({ success: false, message: 'Öğün ID gerekli.' });
            return;
        }
        // Öğünün sahibi olan planı bul
        const meal = await database_1.prisma.meal.findUnique({
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
        const updated = await nutrition_service_1.NutritionService.toggleMealComplete(mealId);
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.toggleMealComplete = toggleMealComplete;
