import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';
import bcrypt from 'bcryptjs';

interface CreateClientBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = req.user?.sub;
    if (!trainerId) {
      res.status(401).json({ success: false, message: 'Yetkisiz.' });
      return;
    }

    const { email, password, firstName, lastName } = req.body as CreateClientBody;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, message: 'E-posta, şifre, isim ve soyisim gereklidir.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'Bu e-posta ile kullanıcı zaten mevcut.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'CLIENT',
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
        },
      });

      return newUser;
    });

    res.status(201).json({ 
      success: true, 
      message: 'Danışan başarıyla oluşturuldu.',
      data: {
        id: result.id,
        email: result.email,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};