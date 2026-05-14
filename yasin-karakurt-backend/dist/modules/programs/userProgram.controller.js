"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserProgram = exports.getUserPrograms = exports.getMyPrograms = exports.assignProgram = void 0;
const path_1 = __importDefault(require("path"));
const database_1 = require("../../config/database");
const notification_service_1 = require("../notifications/notification.service");
const assignProgram = async (req, res, next) => {
    try {
        const { userId, type, title, content, contentType } = req.body;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        if (!userId || !type || !title) {
            res.status(400).json({ success: false, message: 'Eksik bilgi.' });
            return;
        }
        // IDOR koruması: Sadece ADMIN/TRAINER başkalarına program atayabilir
        if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
            res.status(403).json({ success: false, message: 'Başka bir kullanıcıya program atamak için yetkiniz yok.' });
            return;
        }
        let fileUrl = null;
        if (req.file) {
            fileUrl = '/uploads/programs/' + path_1.default.basename(req.file.path);
        }
        const program = await database_1.prisma.userProgram.create({
            data: {
                userId,
                type,
                title,
                content: content || null,
                contentType: contentType || (fileUrl ? 'FILE' : 'TEXT'),
                fileUrl,
            },
        });
        await (0, notification_service_1.createNotification)({
            userId,
            title: type === 'TRAINING' ? 'Yeni Antrenman Programı' : 'Yeni Beslenme Planı',
            message: `Size "${title}" programı atandı. Programınızı inceleyebilirsiniz.`,
            type: 'PROGRAM_ASSIGNED',
        });
        res.status(201).json({ success: true, data: program });
    }
    catch (error) {
        console.error('Program atama hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.assignProgram = assignProgram;
const getMyPrograms = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const userRole = req.user.role;
        let programs;
        if (userRole === 'ADMIN' || userRole === 'TRAINER') {
            programs = await database_1.prisma.userProgram.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    user: {
                        select: { email: true, profile: { select: { firstName: true, lastName: true } } }
                    }
                }
            });
        }
        else {
            programs = await database_1.prisma.userProgram.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
        }
        res.status(200).json({ success: true, data: programs });
    }
    catch (error) {
        console.error('Program getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getMyPrograms = getMyPrograms;
const getUserPrograms = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        // IDOR koruması: Client sadece kendi programlarını görebilir
        if (userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
            res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
            return;
        }
        const programs = await database_1.prisma.userProgram.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.status(200).json({ success: true, data: programs });
    }
    catch (error) {
        console.error('Program getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.getUserPrograms = getUserPrograms;
const deleteUserProgram = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.sub;
        const currentUserRole = req.user.role;
        // Programın sahibini bul
        const existingProgram = await database_1.prisma.userProgram.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!existingProgram) {
            res.status(404).json({ success: false, message: 'Program bulunamadı.' });
            return;
        }
        // IDOR koruması: Sadece program sahibi veya ADMIN/TRAINER silebilir
        if (existingProgram.userId !== currentUserId && currentUserRole !== 'ADMIN' && currentUserRole !== 'TRAINER') {
            res.status(403).json({ success: false, message: 'Bu programı silme yetkiniz yok.' });
            return;
        }
        await database_1.prisma.userProgram.delete({
            where: { id },
        });
        res.status(200).json({ success: true, message: 'Program silindi.' });
    }
    catch (error) {
        console.error('Program silme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.deleteUserProgram = deleteUserProgram;
