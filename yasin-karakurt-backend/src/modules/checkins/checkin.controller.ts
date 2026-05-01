import { Response, NextFunction } from 'express';
import * as checkInService from './checkin.service';
import { AuthRequest } from '../../types';

export const submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await checkInService.submitCheckIn({ ...req.body, userId: req.user!.sub });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await checkInService.getCheckInById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const myCheckIns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await checkInService.getMyCheckIns(req.user!.sub);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const review = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await checkInService.reviewCheckIn(req.params.id, req.user!.sub, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
