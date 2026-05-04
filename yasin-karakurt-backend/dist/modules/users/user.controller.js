"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClients = void 0;
const database_1 = require("../../config/database");
const getClients = async (req, res) => {
    try {
        if (!req.user || !['TRAINER', 'ADMIN'].includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
            return;
        }
        const clients = await database_1.prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        fitnessGoal: true,
                    },
                },
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                        endDate: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: clients });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Danışanlar getirilemedi.' });
    }
};
exports.getClients = getClients;
