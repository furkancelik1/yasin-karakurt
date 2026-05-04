import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';

interface DashboardStats {
  activeClients: number;
  pendingReviews: number;
  todaySubmissions: number;
}

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeClients, pendingReviews, todaySubmissions] = await Promise.all([
      prisma.user.count({
        where: { role: 'CLIENT', isActive: true },
      }),
      prisma.checkIn.count({
        where: { status: 'PENDING' },
      }),
      prisma.checkIn.count({
        where: {
          submittedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    const stats: DashboardStats = {
      activeClients,
      pendingReviews,
      todaySubmissions,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};