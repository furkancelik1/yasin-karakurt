import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token gerekli' });
      return;
    }
    const result = await authService.refreshTokens(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.logout(req.user!.sub);
    res.json({ success: true, message: 'Çıkış yapıldı' });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: { profile: true },
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      return;
    }
    const { password, refreshToken, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};
