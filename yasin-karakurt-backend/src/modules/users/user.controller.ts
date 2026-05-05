import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !['TRAINER', 'ADMIN'].includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
      return;
    }

    const clients = await prisma.user.findMany({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Danışanlar getirilemedi.' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
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
            height: true,
            weight: true,
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
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Kullanıcı getirilemedi.' });
  }
};
