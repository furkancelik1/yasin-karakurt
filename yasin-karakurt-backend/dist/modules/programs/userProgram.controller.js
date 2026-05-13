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
        if (!userId || !type || !title) {
            res.status(400).json({ success: false, message: 'Eksik bilgi.' });
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
        console.log('[getMyPrograms] User ID:', userId, 'Role:', userRole);
        let programs;
        if (userRole === 'ADMIN' || userRole === 'TRAINER') {
            // Admin/Trainer: Show programs assigned to clients (all programs)
            programs = await database_1.prisma.userProgram.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { email: true, profile: { select: { firstName: true, lastName: true } } }
                    }
                }
            });
            console.log('[getMyPrograms] Trainer/Admin - Found all programs:', programs.length);
        }
        else {
            // Client: Show only their own programs
            programs = await database_1.prisma.userProgram.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            console.log('[getMyPrograms] Client - Found programs:', programs.length);
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
        const programs = await database_1.prisma.userProgram.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
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
