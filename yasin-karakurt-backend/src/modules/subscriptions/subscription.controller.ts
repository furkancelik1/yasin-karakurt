import { Response, NextFunction } from 'express';
import * as subService from './subscription.service';
import { AuthRequest } from '../../types';

export const getMy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await subService.getMySubscription(req.user!.sub);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const initiate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { plan } = req.body;
    const data = await subService.createOrUpdateSubscription(req.user!.sub, plan);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await subService.cancelSubscription(req.user!.sub);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
