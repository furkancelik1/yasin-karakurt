import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { JwtPayload } from '../../types';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

export const register = async (dto: RegisterDto) => {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('Bu e-posta zaten kayıtlı', 409);

  const hashed = await bcrypt.hash(dto.password, 12);
  const user = await prisma.user.create({
    data: {
      email: dto.email,
      password: hashed,
      profile: {
        create: { firstName: dto.firstName, lastName: dto.lastName },
      },
    },
    include: { profile: true },
  });

  const jwtPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, profile: user.profile } };
};

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    include: { profile: true },
  });
  if (!user || !user.isActive) throw new AppError('Geçersiz kimlik bilgileri', 401);

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new AppError('Geçersiz kimlik bilgileri', 401);

  const jwtPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, profile: user.profile } };
};

export const refreshTokens = async (token: string) => {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Geçersiz refresh token', 401);
  }

  const user = await prisma.user.findFirst({ where: { id: payload.sub, refreshToken: token } });
  if (!user) throw new AppError('Geçersiz refresh token', 401);

  const jwtPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  return { accessToken, refreshToken };
};

export const logout = async (userId: string) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
