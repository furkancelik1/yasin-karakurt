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
exports.getCheckInsByUserId = exports.reviewCheckin = exports.updateCheckinStatus = exports.getCheckinById = exports.getAllForTrainer = exports.getAllCheckins = exports.createCheckin = void 0;
const path_1 = __importDefault(require("path"));
const error_middleware_1 = require("../../middleware/error.middleware");
const database_1 = require("../../config/database");
const CheckInService = __importStar(require("./checkin.service"));
const createCheckin = async (req, res) => {
    try {
        const userPayload = req.user;
        const userId = userPayload?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Oturum bilgisi bulunamadı.' });
            return;
        }
        const { weight, notes } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ success: false, message: 'En az bir fotoğraf yüklemelisiniz.' });
            return;
        }
        const photoUrls = files
            .map((file) => {
            const fullPath = file.path;
            if (!fullPath)
                return null;
            return '/uploads/checkins/' + path_1.default.basename(fullPath);
        })
            .filter((url) => typeof url === 'string' && url.length > 0);
        if (photoUrls.length === 0) {
            res.status(400).json({ success: false, message: 'Fotoğraflar yüklenirken bir sorun oluştu.' });
            return;
        }
        const parsedWeight = weight ? parseFloat(weight) : null;
        if (weight && isNaN(parsedWeight)) {
            res.status(400).json({ success: false, message: 'Geçersiz kilo değeri.' });
            return;
        }
        const newCheckin = await database_1.prisma.checkIn.create({
            data: {
                userId,
                weight: parsedWeight,
                notes: notes || '',
                status: 'PENDING',
                photos: {
                    create: photoUrls.map((url) => ({
                        url
                    }))
                }
            },
            include: {
                photos: true
            }
        });
        res.status(201).json({
            success: true,
            message: 'Gelişim formu başarıyla iletildi!',
            data: newCheckin
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
        const previousCheckin = await database_1.prisma.checkIn.findFirst({
            where: {
                userId: checkin.userId,
                submittedAt: { lt: checkin.submittedAt },
            },
            orderBy: { submittedAt: 'desc' },
            include: { photos: true },
        });
        res.status(200).json({ success: true, data: { checkin, previousCheckin } });
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
        const { trainerNote, status } = req.body;
        const updated = await CheckInService.reviewCheckIn(id, { trainerNote, status });
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
