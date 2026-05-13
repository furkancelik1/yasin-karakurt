"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySummary = exports.getAllClients = exports.updateProfile = exports.getProfile = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const getProfile = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });
    if (!user)
        throw new error_middleware_1.AppError('Kullanıcı bulunamadı', 404);
    const { password, refreshToken, ...safe } = user;
    void password;
    void refreshToken;
    return safe;
};
exports.getProfile = getProfile;
const updateProfile = async (userId, data) => {
    const updated = await database_1.prisma.profile.update({
        where: { userId },
        data,
    });
    return updated;
};
exports.updateProfile = updateProfile;
const getAllClients = async () => {
    const users = await database_1.prisma.user.findMany({
        where: { role: 'CLIENT' },
        include: { profile: true, subscription: true },
        orderBy: { createdAt: 'desc' },
    });
    return users.map(({ password, refreshToken, ...u }) => { void password; void refreshToken; return u; });
};
exports.getAllClients = getAllClients;
const getDailySummary = async (userId) => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const activePlan = await database_1.prisma.nutritionPlan.findFirst({
        where: { userId, isActive: true },
        include: { meals: { orderBy: { order: 'asc' } } },
    });
    let consumedCalories = 0;
    let targetCalories = 0;
    let totalMeals = 0;
    let completedMeals = 0;
    if (activePlan) {
        targetCalories = activePlan.targetCalories;
        totalMeals = activePlan.meals.length;
        const doneToday = activePlan.meals.filter((m) => m.isDone && m.updatedAt >= todayStart && m.updatedAt <= todayEnd);
        completedMeals = doneToday.length;
        if (totalMeals > 0) {
            consumedCalories = Math.round((completedMeals / totalMeals) * targetCalories);
        }
    }
    const weeklyCompleted = await database_1.prisma.checkIn.count({
        where: {
            userId,
            status: { in: ['COMPLETED', 'REVIEWED'] },
            submittedAt: { gte: weekStart, lte: weekEnd },
        },
    });
    const weeklyTarget = 5;
    const waterLogs = await database_1.prisma.waterLog.findMany({
        where: { userId, date: { gte: todayStart, lte: todayEnd } },
    });
    const waterAmount = waterLogs.reduce((sum, log) => sum + log.amount, 0);
    return {
        consumedCalories,
        targetCalories,
        remainingCalories: targetCalories - consumedCalories,
        meals: { completed: completedMeals, total: totalMeals },
        weeklyProgress: { completed: weeklyCompleted, total: weeklyTarget },
        water: waterAmount,
    };
};
exports.getDailySummary = getDailySummary;
