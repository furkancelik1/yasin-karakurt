import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';

export const logWater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Yetkisiz.' });
      return;
    }

    const { amount } = req.body as { amount: number };
    const waterAmount = Number(amount) || 250;

    await prisma.waterLog.create({
      data: {
        userId,
        amount: waterAmount,
      },
    });

    res.status(201).json({ success: true, message: 'Su kaydedildi.' });
  } catch (error) {
    console.error('Su kaydetme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getTodayWater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Yetkisiz.' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.waterLog.aggregate({
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
  } catch (error) {
    console.error('Su çekme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};