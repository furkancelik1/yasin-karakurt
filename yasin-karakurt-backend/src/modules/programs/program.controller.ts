import { Response, NextFunction } from 'express';
import * as programService from './program.service';
import { AuthRequest } from '../../types';

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await programService.createProgram({ ...req.body, trainerId: req.user!.sub });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await programService.getProgramById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const myPrograms = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await programService.getProgramsByClient(req.user!.sub);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await programService.updateProgram(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
