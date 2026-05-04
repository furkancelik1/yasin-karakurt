"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCheckIn = exports.getCheckInsByUserId = exports.getTrainerCheckins = exports.getMyCheckIns = exports.getCheckInById = exports.submitCheckIn = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const checkinInclude = {
    user: {
        select: {
            id: true,
            email: true,
            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                },
            },
        },
    },
    photos: true,
};
const submitCheckIn = async (data) => {
    const { photoUrls, ...rest } = data;
    return database_1.prisma.checkIn.create({
        data: {
            ...rest,
            photos: photoUrls ? { create: photoUrls } : undefined,
        },
        include: { photos: true },
    });
};
exports.submitCheckIn = submitCheckIn;
const getCheckInById = async (id) => {
    const checkIn = await database_1.prisma.checkIn.findUnique({
        where: { id },
        include: { photos: true, user: { include: { profile: true } } },
    });
    if (!checkIn)
        throw new error_middleware_1.AppError('Check-in bulunamadı', 404);
    return checkIn;
};
exports.getCheckInById = getCheckInById;
const getMyCheckIns = async (userId) => {
    return database_1.prisma.checkIn.findMany({
        where: { userId },
        include: { photos: true },
        orderBy: { submittedAt: 'desc' },
    });
};
exports.getMyCheckIns = getMyCheckIns;
const getTrainerCheckins = async () => {
    return database_1.prisma.checkIn.findMany({
        include: checkinInclude,
        orderBy: { submittedAt: 'desc' },
    });
};
exports.getTrainerCheckins = getTrainerCheckins;
const getCheckInsByUserId = async (userId) => {
    return database_1.prisma.checkIn.findMany({
        where: { userId },
        include: { photos: true, user: { include: { profile: true } } },
        orderBy: { submittedAt: 'desc' },
    });
};
exports.getCheckInsByUserId = getCheckInsByUserId;
const reviewCheckIn = async (id, data) => {
    const checkIn = await database_1.prisma.checkIn.findUnique({ where: { id } });
    if (!checkIn)
        throw new error_middleware_1.AppError('Check-in bulunamadı', 404);
    return database_1.prisma.$transaction(async (tx) => {
        const updated = await tx.checkIn.update({
            where: { id },
            data: {
                trainerNote: data.trainerNote,
                status: data.status ?? 'REVIEWED',
                reviewedAt: new Date(),
            },
            include: checkinInclude,
        });
        await tx.notification.create({
            data: {
                userId: checkIn.userId,
                title: 'Check-in İncelendi',
                message: data.trainerNote
                    ? `Eğitmeniniz check-in formunuzu inceledi ve not ekledi: "${data.trainerNote}"`
                    : 'Eğitmeniniz check-in formunuzu inceledi.',
            },
        });
        return updated;
    });
};
exports.reviewCheckIn = reviewCheckIn;
