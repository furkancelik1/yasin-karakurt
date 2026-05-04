"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAndSaveImage = processAndSaveImage;
exports.deleteImage = deleteImage;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
/**
 * Buffer'ı alır → Sharp ile yeniden boyutlandırır → WebP'ye çevirir → diske yazar.
 * Döndürdüğü URL'yi Prisma'ya kaydet, S3 geçişinde sadece bu fonksiyon değişir.
 */
async function processAndSaveImage(buffer, opts = {}) {
    const { maxWidth = 1200, maxHeight = 1600, quality = 82, subfolder = 'general', } = opts;
    const dir = path_1.default.join(process.cwd(), env_1.env.UPLOAD_DIR, subfolder);
    await promises_1.default.mkdir(dir, { recursive: true });
    const filename = `${crypto_1.default.randomUUID()}.webp`;
    const filepath = path_1.default.join(dir, filename);
    await (0, sharp_1.default)(buffer)
        .rotate() // EXIF yönünü düzelt
        .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
    })
        .webp({ quality })
        .toFile(filepath);
    return `/${env_1.env.UPLOAD_DIR}/${subfolder}/${filename}`;
}
async function deleteImage(relativePath) {
    try {
        const abs = path_1.default.join(process.cwd(), relativePath);
        await promises_1.default.unlink(abs);
    }
    catch {
        // Dosya zaten yoksa sessizce geç
    }
}
