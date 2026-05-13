"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySummaryHandler = exports.uploadProfileImage = exports.getUserById = exports.getClients = exports.changePassword = exports.updateMyProfile = exports.getMyProfile = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const user_service_1 = require("./user.service");
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                profile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        dateOfBirth: true,
                        gender: true,
                        avatarUrl: true,
                        fitnessGoal: true,
                        height: true,
                        weight: true,
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Profil getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const { firstName, lastName, phone, dateOfBirth, gender, fitnessGoal, height, weight } = req.body;
        const existingProfile = await database_1.prisma.profile.findUnique({
            where: { userId },
        });
        let profile;
        if (existingProfile) {
            profile = await database_1.prisma.profile.update({
                where: { userId },
                data: {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(phone !== undefined && { phone }),
                    ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                    ...(gender && { gender }),
                    ...(fitnessGoal !== undefined && { fitnessGoal }),
                    ...(height && { height }),
                    ...(weight && { weight }),
                },
            });
        }
        else {
            profile = await database_1.prisma.profile.create({
                data: {
                    userId,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    phone,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    gender,
                    fitnessGoal,
                    height,
                    weight,
                },
            });
        }
        res.status(200).json({ success: true, data: profile });
    }
    catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.updateMyProfile = updateMyProfile;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'Mevcut şifre ve yeni şifre gereklidir.' });
            return;
        }
        const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!PASSWORD_REGEX.test(newPassword)) {
            res.status(400).json({ success: false, message: 'Yeni şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir.' });
            return;
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            return;
        }
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid) {
            res.status(401).json({ success: false, message: 'Mevcut şifreniz hatalı.' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi' });
    }
    catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.changePassword = changePassword;
const getClients = async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (!userRole) {
            res.status(401).json({ success: false, message: 'Kullanıcı rolü bulunamadı.' });
            return;
        }
        if (!['TRAINER', 'ADMIN'].includes(userRole)) {
            res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
            return;
        }
        const clients = await database_1.prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        fitnessGoal: true,
                    },
                },
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                        endDate: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: clients });
    }
    catch (error) {
        console.error('Danışan getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getClients = getClients;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true,
                profile: true,
                subscription: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Kullanıcı getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getUserById = getUserById;
const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const file = req.file;
        if (!file || !file.path) {
            res.status(400).json({ success: false, message: 'Dosya yüklenmedi.' });
            return;
        }
        const result = await cloudinary_1.default.uploader.upload(file.path, {
            folder: 'yasin-karakurt/profile',
            transformation: [
                { aspect_ratio: '1:1', gravity: 'face', width: 500, crop: 'fill' },
            ],
        });
        const existingProfile = await database_1.prisma.profile.findUnique({
            where: { userId },
        });
        let profile;
        if (existingProfile) {
            if (existingProfile.avatarUrl) {
                const publicId = existingProfile.avatarUrl.split('/').pop()?.replace(/\.[^/.]+$/, '');
                if (publicId) {
                    await cloudinary_1.default.uploader.destroy(`yasin-karakurt/profile/${publicId}`).catch(() => { });
                }
            }
            profile = await database_1.prisma.profile.update({
                where: { userId },
                data: { avatarUrl: result.secure_url },
            });
        }
        else {
            profile = await database_1.prisma.profile.create({
                data: {
                    userId,
                    firstName: '',
                    lastName: '',
                    avatarUrl: result.secure_url,
                },
            });
        }
        res.status(200).json({ success: true, data: { avatarUrl: result.secure_url } });
    }
    catch (error) {
        console.error('Fotoğraf yükleme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.uploadProfileImage = uploadProfileImage;
const getDailySummaryHandler = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const summary = await (0, user_service_1.getDailySummary)(userId);
        res.status(200).json({ success: true, data: summary });
    }
    catch (error) {
        console.error('Günlük özet getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getDailySummaryHandler = getDailySummaryHandler;
