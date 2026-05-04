import { Response } from 'express';
import path from 'path';
import { CheckInStatus } from '@prisma/client';
import { AuthRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../config/database';
import * as CheckInService from './checkin.service';

export const createCheckin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPayload = req.user;
    const userId = userPayload?.sub;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Oturum bilgisi bulunamadı.' });
      return;
    }

    const { weight, notes } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'En az bir fotoğraf yüklemelisiniz.' });
      return;
    }

    const photoUrls = files
      .map((file: any) => {
        const fullPath = file.path;
        if (!fullPath) return null;
        return '/uploads/checkins/' + path.basename(fullPath);
      })
      .filter((url): url is string => typeof url === 'string' && url.length > 0);

    if (photoUrls.length === 0) {
      res.status(400).json({ success: false, message: 'Fotoğraflar yüklenirken bir sorun oluştu.' });
      return;
    }

    const parsedWeight = weight ? parseFloat(weight) : null;
    if (weight && isNaN(parsedWeight as number)) {
      res.status(400).json({ success: false, message: 'Geçersiz kilo değeri.' });
      return;
    }

    const newCheckin = await prisma.checkIn.create({
      data: {
        userId,
        weight: parsedWeight,
        notes: notes || '',
        status: 'PENDING',
        photos: {
          create: photoUrls.map((url) => ({
            url
          }))
        }
      },
      include: {
        photos: true 
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Gelişim formu başarıyla iletildi!', 
      data: newCheckin 
    });

  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error('Check-in oluşturulurken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getAllCheckins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const checkins = await CheckInService.getTrainerCheckins();
    res.status(200).json({ success: true, data: checkins });
  } catch (error) {
    console.error('Check-inler çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getAllForTrainer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const checkins = await CheckInService.getTrainerCheckins();
    res.status(200).json({ success: true, data: checkins });
  } catch (error) {
    console.error('Trainer check-inleri çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getCheckinById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const checkin = await CheckInService.getCheckInById(id);

    const previousCheckin = await prisma.checkIn.findFirst({
      where: {
        userId: checkin.userId,
        submittedAt: { lt: checkin.submittedAt },
      },
      orderBy: { submittedAt: 'desc' },
      include: { photos: true },
    });

    res.status(200).json({ success: true, data: { checkin, previousCheckin } });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error('Check-in detayı çekilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const updateCheckinStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: CheckInStatus };

    const validStatuses: CheckInStatus[] = ['PENDING', 'REVIEWED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Geçersiz statü değeri.' });
      return;
    }

    const updated = await prisma.checkIn.update({
      where: { id },
      data: {
        status,
        reviewedAt: status === 'REVIEWED' || status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Statü güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const reviewCheckin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { trainerNote, status } = req.body as { trainerNote?: string; status?: CheckInStatus };

    const updated = await CheckInService.reviewCheckIn(id, { trainerNote, status });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error('Check-in incelenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};