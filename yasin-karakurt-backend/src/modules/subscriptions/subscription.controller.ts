import { Request, Response, NextFunction } from 'express';
import * as subService from './subscription.service';
import { AuthRequest } from '../../types';
import { SubscriptionPlan } from '@prisma/client';

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
    const plan = req.body.plan as SubscriptionPlan | undefined;

    if (!plan || !['BASIC', 'PREMIUM', 'VIP'].includes(plan)) {
      res.status(400).json({ success: false, message: 'Geçerli bir plan seçin: BASIC, PREMIUM, VIP' });
      return;
    }

    const data = await subService.createOrUpdateSubscription(req.user!.sub, plan);

    if (data.error) {
      res.status(502).json({ success: false, message: data.error });
      return;
    }

    res.status(201).json({
      success: true,
      data: { checkoutFormContent: data.checkoutFormContent },
    });
  } catch (err) {
    next(err);
  }
};

export const paymentCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      const failUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=failed&reason=no_token`;
      res.redirect(302, failUrl);
      return;
    }

    const result = await subService.verifySubscriptionPayment(token);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const success = result.status === 'success' || result.status === 'SUCCESS';

    const redirectUrl = success
      ? `${frontendUrl}/dashboard?payment=success`
      : `${frontendUrl}/dashboard?payment=failed&reason=${encodeURIComponent(result.error || 'payment_failed')}`;

    res.redirect(302, redirectUrl);
  } catch (err) {
    const failUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=failed&reason=callback_error`;
    res.redirect(302, failUrl);
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