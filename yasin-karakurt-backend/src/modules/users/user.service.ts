import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) throw new AppError('Kullanıcı bulunamadı', 404);
  const { password, refreshToken, ...safe } = user;
  void password; void refreshToken;
  return safe;
};

export const updateProfile = async (userId: string, data: Record<string, unknown>) => {
  const updated = await prisma.profile.update({
    where: { userId },
    data,
  });
  return updated;
};

export const getAllClients = async () => {
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    include: { profile: true, subscription: true },
    orderBy: { createdAt: 'desc' },
  });
  return users.map(({ password, refreshToken, ...u }) => { void password; void refreshToken; return u; });
};
