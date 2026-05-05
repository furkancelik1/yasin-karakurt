import { Response, NextFunction } from 'express';
import path from 'path';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';
import { ProgramType, ProgramContentType } from '@prisma/client';

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

    if (!userId || !type || !title) {
      res.status(400).json({ success: false, message: 'Eksik bilgi.' });
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

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error('Program atama hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getMyPrograms = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub;
    console.log('[getMyPrograms] User ID from JWT:', userId);
    
    const programs = await prisma.userProgram.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[getMyPrograms] Found programs:', programs.length);
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    console.error('Program getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

export const getUserPrograms = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const programs = await prisma.userProgram.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
    
    await prisma.userProgram.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: 'Program silindi.' });
  } catch (error) {
    console.error('Program silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};