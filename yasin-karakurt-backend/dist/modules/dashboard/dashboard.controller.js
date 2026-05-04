"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const database_1 = require("../../config/database");
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [activeClients, pendingReviews, todaySubmissions] = await Promise.all([
            database_1.prisma.user.count({
                where: { role: 'CLIENT', isActive: true },
            }),
            database_1.prisma.checkIn.count({
                where: { status: 'PENDING' },
            }),
            database_1.prisma.checkIn.count({
                where: {
                    submittedAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
        ]);
        const stats = {
            activeClients,
            pendingReviews,
            todaySubmissions,
        };
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getDashboardStats = getDashboardStats;
