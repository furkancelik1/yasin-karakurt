import multer from 'multer';

// Artık diskStorage yerine memoryStorage kullanıyoruz
const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
]);

export const upload = multer({
  storage,
  limits: {
    // 10MB limit (isteğe bağlı)
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG ve WebP dosyaları kabul edilir'));
    }
  },
});