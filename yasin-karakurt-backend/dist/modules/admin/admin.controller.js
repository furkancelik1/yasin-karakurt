"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createClient = async (req, res) => {
    try {
        const trainerId = req.user?.sub;
        if (!trainerId) {
            res.status(401).json({ success: false, message: 'Yetkisiz.' });
            return;
        }
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ success: false, message: 'E-posta, şifre, isim ve soyisim gereklidir.' });
            return;
        }
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Bu e-posta ile kullanıcı zaten mevcut.' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const result = await database_1.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'CLIENT',
                },
            });
            await tx.profile.create({
                data: {
                    userId: newUser.id,
                    firstName,
                    lastName,
                },
            });
            return newUser;
        });
        res.status(201).json({
            success: true,
            message: 'Danışan başarıyla oluşturuldu.',
            data: {
                id: result.id,
                email: result.email,
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};
exports.createClient = createClient;
