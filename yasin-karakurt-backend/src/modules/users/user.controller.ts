import { Response, NextFunction } from 'express';
import * as userService from './user.service';
import { AuthRequest } from '../../types';

export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await userService.getProfile(req.user!.sub);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await userService.updateProfile(req.user!.sub, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const listClients = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await userService.getAllClients();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
