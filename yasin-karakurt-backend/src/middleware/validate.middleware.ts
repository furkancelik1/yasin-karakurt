import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flatErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(flatErrors).flat()?.[0] || 'Geçersiz istek verisi';

      res.status(400).json({
        success: false,
        message: firstError,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
