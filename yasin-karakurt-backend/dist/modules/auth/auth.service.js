"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshTokens = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const error_middleware_1 = require("../../middleware/error.middleware");
const signAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
const signRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
const register = async (dto) => {
    const existing = await database_1.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing)
        throw new error_middleware_1.AppError('Bu e-posta zaten kayıtlı', 409);
    const hashed = await bcryptjs_1.default.hash(dto.password, 12);
    const user = await database_1.prisma.user.create({
        data: {
            email: dto.email,
            password: hashed,
            profile: {
                create: { firstName: dto.firstName, lastName: dto.lastName },
            },
        },
        include: { profile: true },
    });
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    await database_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, profile: user.profile } };
};
exports.register = register;
const login = async (dto) => {
    const user = await database_1.prisma.user.findUnique({
        where: { email: dto.email },
        include: { profile: true },
    });
    if (!user || !user.isActive)
        throw new error_middleware_1.AppError('Geçersiz kimlik bilgileri', 401);
    const valid = await bcryptjs_1.default.compare(dto.password, user.password);
    if (!valid)
        throw new error_middleware_1.AppError('Geçersiz kimlik bilgileri', 401);
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    await database_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, profile: user.profile } };
};
exports.login = login;
const refreshTokens = async (token) => {
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    }
    catch {
        throw new error_middleware_1.AppError('Geçersiz refresh token', 401);
    }
    const user = await database_1.prisma.user.findFirst({ where: { id: payload.sub, refreshToken: token } });
    if (!user)
        throw new error_middleware_1.AppError('Geçersiz refresh token', 401);
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    await database_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    return { accessToken, refreshToken };
};
exports.refreshTokens = refreshTokens;
const logout = async (userId) => {
    await database_1.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
exports.logout = logout;
