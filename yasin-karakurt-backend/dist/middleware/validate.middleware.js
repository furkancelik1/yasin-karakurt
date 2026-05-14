"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
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
exports.validate = validate;
