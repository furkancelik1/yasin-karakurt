"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayWater = exports.logWater = void 0;
const database_1 = require("../../config/database");
const logWater = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const { amount } = req.body;
        const waterAmount = Number(amount) || 250;
        await database_1.prisma.waterLog.create({
            data: {
                userId,
                amount: waterAmount,
            },
        });
        res.status(201).json({ success: true, message: 'Su kaydedildi.' });
    }
    catch (error) {
        console.error('Su kaydetme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.logWater = logWater;
const getTodayWater = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await database_1.prisma.waterLog.aggregate({
            where: {
                userId,
                date: { gte: today },
            },
            _sum: {
                amount: true,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                total: result._sum.amount || 0
            }
        });
    }
    catch (error) {
        console.error('Su çekme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getTodayWater = getTodayWater;
