"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Artık diskStorage yerine memoryStorage kullanıyoruz
const storage = multer_1.default.memoryStorage();
const ALLOWED_MIME = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
]);
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        // 10MB limit (isteğe bağlı)
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.has(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Sadece JPEG, PNG ve WebP dosyaları kabul edilir'));
        }
    },
});
