import { Response, NextFunction } from 'express';
import path from 'path';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';
import { ProgramType, ProgramContentType } from '@prisma/client';
import { createNotification } from '../notifications/notification.service';

interface CreateUserProgramBody {
  userId: string;
  type: ProgramType;
  title: string;
  content?: string;
  contentType?: ProgramContentType;
  fileUrl?: string;
}

export const assignProgram = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, type, title, content, contentType } = req.body as CreateUserProgramBody;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    if (!userId || !type || !title) {
      res.status(400).json({ success: false, message: 'Eksik bilgi.' });
      return;
    }

    // IDOR koruması: Sadece ADMIN/TRAINER başkalarına program atayabilir
    if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Başka bir kullanıcıya program atamak için yetkiniz yok.' });
      return;
    }

    let fileUrl: string | null = null;
    if (req.file) {
      fileUrl = '/uploads/programs/' + path.basename(req.file.path);
    }

    const program = await prisma.userProgram.create({
      data: {
        userId,
        type,
        title,
        content: content || null,
        contentType: contentType || (fileUrl ? 'FILE' : 'TEXT'),
        fileUrl,
      },
    });

    await createNotification({
      userId,
      title: type === 'TRAINING' ? 'Yeni Antrenman Programı' : 'Yeni Beslenme Planı',
      message: `Size "${title}" programı atandı. Programınızı inceleyebilirsiniz.`,
      type: 'PROGRAM_ASSIGNED',
    });

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error('Program atama hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getMyPrograms = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const userRole = req.user!.role;
    
    let programs;

    if (userRole === 'ADMIN' || userRole === 'TRAINER') {
      programs = await prisma.userProgram.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: {
            select: { email: true, profile: { select: { firstName: true, lastName: true } } }
          }
        }
      });
    } else {
      programs = await prisma.userProgram.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    console.error('Program getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getUserPrograms = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    // IDOR koruması: Client sadece kendi programlarını görebilir
    if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
      return;
    }

    const programs = await prisma.userProgram.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    console.error('Program getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const deleteUserProgram = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.sub;
    const currentUserRole = req.user!.role as string;

    // Programın sahibini bul
    const existingProgram = await prisma.userProgram.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProgram) {
      res.status(404).json({ success: false, message: 'Program bulunamadı.' });
      return;
    }

    // IDOR koruması: Sadece program sahibi veya ADMIN/TRAINER silebilir
    if (existingProgram.userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
      res.status(403).json({ success: false, message: 'Bu programı silme yetkiniz yok.' });
      return;
    }

    await prisma.userProgram.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: 'Program silindi.' });
  } catch (error) {
    console.error('Program silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};