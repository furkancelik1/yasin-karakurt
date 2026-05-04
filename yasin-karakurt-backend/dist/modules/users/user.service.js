"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClients = exports.updateProfile = exports.getProfile = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const getProfile = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });
    if (!user)
        throw new error_middleware_1.AppError('Kullanıcı bulunamadı', 404);
    const { password, refreshToken, ...safe } = user;
    void password;
    void refreshToken;
    return safe;
};
exports.getProfile = getProfile;
const updateProfile = async (userId, data) => {
    const updated = await database_1.prisma.profile.update({
        where: { userId },
        data,
    });
    return updated;
};
exports.updateProfile = updateProfile;
const getAllClients = async () => {
    const users = await database_1.prisma.user.findMany({
        where: { role: 'CLIENT' },
        include: { profile: true, subscription: true },
        orderBy: { createdAt: 'desc' },
    });
    return users.map(({ password, refreshToken, ...u }) => { void password; void refreshToken; return u; });
};
exports.getAllClients = getAllClients;
