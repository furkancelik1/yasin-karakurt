"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCheckIn = exports.getClientStats = exports.getCheckInsByUserId = exports.getTrainerCheckins = exports.getMyCheckIns = exports.getCheckInById = exports.submitCheckIn = void 0;
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
const getClientStats = async (userId) => {
    const checkIns = await database_1.prisma.checkIn.findMany({
        where: { userId },
        select: {
            weight: true,
            sleepHours: true,
            energyLevel: true,
            stressLevel: true,
            hungerLevel: true,
            submittedAt: true,
        },
        orderBy: { submittedAt: 'desc' },
        take: 12,
    });
    if (checkIns.length === 0) {
        return {
            weightChange: null,
            avgSleepHours: null,
            avgEnergyLevel: null,
            avgStressLevel: null,
            avgHungerLevel: null,
            totalCheckIns: 0,
        };
    }
    const valuesWithData = checkIns.filter(c => c.weight != null);
    const weightChange = valuesWithData.length >= 2
        ? +(valuesWithData[0].weight - valuesWithData[valuesWithData.length - 1].weight).toFixed(1)
        : null;
    const sleepValues = checkIns.map(c => c.sleepHours).filter((v) => v != null);
    const avgSleepHours = sleepValues.length > 0
        ? +(sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1)
        : null;
    const energyValues = checkIns.map(c => c.energyLevel).filter((v) => v != null);
    const avgEnergyLevel = energyValues.length > 0
        ? +(energyValues.reduce((a, b) => a + b, 0) / energyValues.length).toFixed(1)
        : null;
    const stressValues = checkIns.map(c => c.stressLevel).filter((v) => v != null);
    const avgStressLevel = stressValues.length > 0
        ? +(stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)
        : null;
    const hungerValues = checkIns.map(c => c.hungerLevel).filter((v) => v != null);
    const avgHungerLevel = hungerValues.length > 0
        ? +(hungerValues.reduce((a, b) => a + b, 0) / hungerValues.length).toFixed(1)
        : null;
    return {
        weightChange,
        avgSleepHours,
        avgEnergyLevel,
        avgStressLevel,
        avgHungerLevel,
        totalCheckIns: checkIns.length,
    };
};
exports.getClientStats = getClientStats;
const reviewCheckIn = async (id, data) => {
    const checkIn = await database_1.prisma.checkIn.findUnique({ where: { id } });
    if (!checkIn)
        throw new error_middleware_1.AppError('Check-in bulunamadı', 404);
    const wasAlreadyReviewed = checkIn.status === 'REVIEWED' || checkIn.status === 'COMPLETED';
    return database_1.prisma.$transaction(async (tx) => {
        const updated = await tx.checkIn.update({
            where: { id },
            data: {
                trainerNote: data.trainerNote,
                coachNotes: data.coachNotes,
                rating: data.rating,
                status: data.status ?? (wasAlreadyReviewed ? checkIn.status : 'REVIEWED'),
                reviewedAt: new Date(),
            },
            include: checkinInclude,
        });
        return updated;
    });
};
exports.reviewCheckIn = reviewCheckIn;
