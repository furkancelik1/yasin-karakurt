"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckInSummary = exports.getClientStats = exports.getCheckInStats = exports.getCheckInsByUserId = exports.reviewCheckin = exports.updateCheckinStatus = exports.getCheckinById = exports.getAllForTrainer = exports.getAllCheckins = exports.createCheckin = void 0;
const error_middleware_1 = require("../../middleware/error.middleware");
const database_1 = require("../../config/database");
const CheckInService = __importStar(require("./checkin.service"));
const notification_service_1 = require("../notifications/notification.service");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const stream_1 = require("stream");
// Helper function to upload file to Cloudinary
const uploadToCloudinary = (fileBuffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: 'yasin-karakurt/checkins',
            filename: filename,
            resource_type: 'image',
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({ url: result?.secure_url || '' });
            }
        });
        stream_1.Readable.from(fileBuffer).pipe(uploadStream);
    });
};
const createCheckin = async (req, res) => {
    try {
        const userPayload = req.user;
        const userId = userPayload?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Oturum bilgisi bulunamadı.' });
            return;
        }
        const { weight, bodyFat, sleepHours, energyLevel, stressLevel, hungerLevel, notes, programId, weekNumber, } = req.body;
        // Handle file uploads using multer (already processed by upload.array middleware)
        const files = req.files || [];
        const hasMetrics = weight || bodyFat || sleepHours || energyLevel || stressLevel || hungerLevel || notes;
        const hasPhotos = files && files.length > 0;
        if (!hasMetrics && !hasPhotos) {
            res.status(400).json({
                success: false,
                message: 'En az bir metrik (kilo, uyku, enerji, stres, açlık veya not) veya fotoğraf eklemelisiniz.'
            });
            return;
        }
        if (weight && (weight < 20 || weight > 300)) {
            res.status(400).json({ success: false, message: 'Kilo değeri 20-300 kg arasında olmalı.' });
            return;
        }
        if (bodyFat && (bodyFat < 2 || bodyFat > 70)) {
            res.status(400).json({ success: false, message: 'Vücut yağ oranı 2-70% arasında olmalı.' });
            return;
        }
        const photoUrls = [];
        if (files && files.length > 0) {
            // Upload each file to Cloudinary
            const uploadPromises = files.map(async (file) => {
                try {
                    const result = await uploadToCloudinary(file.buffer, file.originalname);
                    const angle = file.originalname.toLowerCase().includes('front') ? 'front'
                        : file.originalname.toLowerCase().includes('side') ? 'side'
                            : file.originalname.toLowerCase().includes('back') ? 'back'
                                : 'other';
                    return { url: result.url, angle };
                }
                catch (error) {
                    console.error('Cloudinary upload error:', error);
                    // Return a placeholder or throw error - for now we'll skip failed uploads
                    return null;
                }
            });
            const results = await Promise.all(uploadPromises);
            // Filter out null results (failed uploads)
            const validResults = results.filter((result) => result !== null);
            photoUrls.push(...validResults);
        }
        const newCheckin = await database_1.prisma.checkIn.create({
            data: {
                userId,
                programId: programId || null,
                weekNumber: weekNumber ? parseInt(weekNumber) : null,
                weight: weight ? parseFloat(weight) : null,
                bodyFat: bodyFat ? parseFloat(bodyFat) : null,
                sleepHours: sleepHours ? parseInt(sleepHours) : null,
                energyLevel: energyLevel ? parseInt(energyLevel) : null,
                stressLevel: stressLevel ? parseInt(stressLevel) : null,
                hungerLevel: hungerLevel ? parseInt(hungerLevel) : null,
                notes: notes || null,
                status: 'PENDING',
                photos: photoUrls.length > 0 ? { create: photoUrls } : undefined,
            },
            include: {
                photos: true,
                user: { include: { profile: true } },
            },
        });
        const trainers = await database_1.prisma.user.findMany({
            where: { role: { in: ['TRAINER', 'ADMIN'] } },
            select: { id: true },
        });
        await Promise.all(trainers.map(trainer => (0, notification_service_1.createNotification)({
            userId: trainer.id,
            title: 'Yeni Form Gönderildi!',
            message: `${newCheckin.user.profile?.firstName || 'Bir danışan'} yeni haftalık form gönderdi.`,
            type: 'CHECKIN_REMINDER',
        })));
        res.status(201).json({
            success: true,
            message: 'Gelişim formu başarıyla iletildi!',
            data: newCheckin,
        });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Check-in oluşturulurken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.createCheckin = createCheckin;
const getAllCheckins = async (req, res) => {
    try {
        const checkins = await CheckInService.getTrainerCheckins();
        res.status(200).json({ success: true, data: checkins });
    }
    catch (error) {
        console.error('Check-inler çekilirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getAllCheckins = getAllCheckins;
const getAllForTrainer = async (req, res) => {
    try {
        const checkins = await CheckInService.getTrainerCheckins();
        res.status(200).json({ success: true, data: checkins });
    }
    catch (error) {
        console.error('Trainer check-inleri çekilirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getAllForTrainer = getAllForTrainer;
const getCheckinById = async (req, res) => {
    try {
        const { id } = req.params;
        const checkin = await CheckInService.getCheckInById(id);
        // Tek sorguda tüm verileri çek (N+1 önleme)
        const [previousCheckin, allCheckIns] = await Promise.all([
            database_1.prisma.checkIn.findFirst({
                where: {
                    userId: checkin.userId,
                    submittedAt: { lt: checkin.submittedAt },
                },
                orderBy: { submittedAt: 'desc' },
                select: { id: true, submittedAt: true, weight: true, photos: true },
            }),
            database_1.prisma.checkIn.findMany({
                where: { userId: checkin.userId },
                select: {
                    id: true,
                    weight: true,
                    bodyFat: true,
                    submittedAt: true,
                    photos: { select: { id: true, url: true, angle: true } },
                },
                orderBy: { submittedAt: 'desc' },
                take: 10,
            }),
        ]);
        res.status(200).json({ success: true, data: { checkin, previousCheckin, allCheckIns } });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Check-in detayı çekilirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getCheckinById = getCheckinById;
const updateCheckinStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['PENDING', 'REVIEWED', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: 'Geçersiz statü değeri.' });
            return;
        }
        const updated = await database_1.prisma.checkIn.update({
            where: { id },
            data: {
                status,
                reviewedAt: status === 'REVIEWED' || status === 'COMPLETED' ? new Date() : undefined,
            },
        });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        console.error('Statü güncellenirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.updateCheckinStatus = updateCheckinStatus;
const reviewCheckin = async (req, res) => {
    try {
        const { id } = req.params;
        const { trainerNote, status, rating, coachNotes } = req.body;
        const checkin = await database_1.prisma.checkIn.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!checkin) {
            res.status(404).json({ success: false, message: 'Check-in bulunamadı.' });
            return;
        }
        const updated = await CheckInService.reviewCheckIn(id, {
            trainerNote,
            status,
            rating,
            coachNotes,
        });
        await (0, notification_service_1.createNotification)({
            userId: checkin.userId,
            title: 'Haftalık Form İncelendi!',
            message: coachNotes || trainerNote
                ? `Koçunuz formunuzu inceledi: "${coachNotes || trainerNote}"`
                : 'Koçunuz haftalık formunuzu inceledi ve onayladı.',
            type: 'CHECKIN_REMINDER',
        });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Check-in incelenirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.reviewCheckin = reviewCheckin;
const getCheckInsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
            return;
        }
        const checkins = await CheckInService.getCheckInsByUserId(userId);
        res.status(200).json({ success: true, data: checkins });
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Check-inler çekilirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getCheckInsByUserId = getCheckInsByUserId;
const getCheckInStats = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Oturum gerekli.' });
            return;
        }
        const checkins = await database_1.prisma.checkIn.findMany({
            where: { userId },
            select: {
                id: true,
                weight: true,
                bodyFat: true,
                energyLevel: true,
                sleepHours: true,
                submittedAt: true,
                photos: {
                    select: {
                        id: true,
                        url: true,
                        angle: true,
                    },
                },
            },
            orderBy: { submittedAt: 'asc' },
            take: 10,
        });
        const data = checkins.map((c) => {
            const date = c.submittedAt ? new Date(c.submittedAt) : new Date();
            const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
            return {
                id: c.id,
                date: `${date.getDate().toString().padStart(2, '0')} ${monthNames[date.getMonth()]}`,
                weight: c.weight,
                bodyFat: c.bodyFat,
                energy: c.energyLevel,
                sleep: c.sleepHours,
                submittedAt: c.submittedAt,
                photos: c.photos,
            };
        });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error('Stats çekilirken hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getCheckInStats = getCheckInStats;
const getClientStats = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
            return;
        }
        const stats = await CheckInService.getClientStats(userId);
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        console.error('Client stats error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getClientStats = getClientStats;
const getCheckInSummary = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ success: false, message: 'Kullanıcı ID gerekli.' });
            return;
        }
        const checkins = await database_1.prisma.checkIn.findMany({
            where: { userId },
            select: {
                weight: true,
                bodyFat: true,
                sleepHours: true,
                energyLevel: true,
                rating: true,
                submittedAt: true,
            },
            orderBy: { submittedAt: 'asc' },
            take: 10,
        });
        if (checkins.length === 0) {
            res.status(200).json({ success: true, data: null });
            return;
        }
        const firstWeight = checkins[0]?.weight;
        const lastWeight = checkins[checkins.length - 1]?.weight;
        const totalChange = firstWeight && lastWeight ? +(lastWeight - firstWeight).toFixed(1) : null;
        const recent4 = checkins.slice(-4);
        const avgSleep = recent4.filter(c => c.sleepHours).length > 0
            ? +(recent4.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recent4.filter(c => c.sleepHours).length).toFixed(1)
            : null;
        const avgEnergy = recent4.filter(c => c.energyLevel).length > 0
            ? +(recent4.reduce((sum, c) => sum + (c.energyLevel || 0), 0) / recent4.filter(c => c.energyLevel).length).toFixed(1)
            : null;
        const weeksSinceFirst = Math.ceil((new Date().getTime() - new Date(checkins[0].submittedAt).getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1;
        const continuityScore = Math.min(100, Math.round((checkins.length / weeksSinceFirst) * 100));
        const latestRating = checkins[checkins.length - 1]?.rating || checkins.reverse().find(c => c.rating)?.rating || null;
        res.status(200).json({
            success: true,
            data: {
                totalChange,
                currentWeight: lastWeight,
                avgSleep,
                avgEnergy,
                continuityScore,
                latestRating,
                checkinCount: checkins.length,
            }
        });
    }
    catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getCheckInSummary = getCheckInSummary;
