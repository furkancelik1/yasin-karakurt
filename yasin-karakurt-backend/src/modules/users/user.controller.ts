import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getClients = async (req: Request, res: Response) => {
  try {
    // Sadece ADMIN yetkisi olanlar görebilir güvenlik kontrolü
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Bu işlem için yetkiniz yok.' });
    }

    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          select: { goal: true, weight: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: clients });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Danışanlar getirilemedi.' });
  }
};