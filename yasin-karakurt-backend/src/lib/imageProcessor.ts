import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { env } from '../config/env';

interface ProcessOptions {
  maxWidth?:  number;
  maxHeight?: number;
  quality?:   number;
  subfolder?: string;
}

/**
 * Buffer'ı alır → Sharp ile yeniden boyutlandırır → WebP'ye çevirir → diske yazar.
 * Döndürdüğü URL'yi Prisma'ya kaydet, S3 geçişinde sadece bu fonksiyon değişir.
 */
export async function processAndSaveImage(
  buffer: Buffer,
  opts: ProcessOptions = {}
): Promise<string> {
  const {
    maxWidth  = 1200,
    maxHeight = 1600,
    quality   = 82,
    subfolder = 'general',
  } = opts;

  const dir = path.join(process.cwd(), env.UPLOAD_DIR, subfolder);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}.webp`;
  const filepath = path.join(dir, filename);

  await sharp(buffer)
    .rotate()                                               // EXIF yönünü düzelt
    .resize(maxWidth, maxHeight, {
      fit:               'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(filepath);

  return `/${env.UPLOAD_DIR}/${subfolder}/${filename}`;
}

export async function deleteImage(relativePath: string): Promise<void> {
  try {
    const abs = path.join(process.cwd(), relativePath);
    await fs.unlink(abs);
  } catch {
    // Dosya zaten yoksa sessizce geç
  }
}
