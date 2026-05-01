import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export const submitCheckIn = async (data: {
  userId: string;
  programId?: string;
  weekNumber?: number;
  weight?: number;
  bodyFat?: number;
  notes?: string;
  photoUrls?: { url: string; angle?: string }[];
}) => {
  const { photoUrls, ...rest } = data;
  return prisma.checkIn.create({
    data: {
      ...rest,
      photos: photoUrls
        ? { create: photoUrls }
        : undefined,
    },
    include: { photos: true },
  });
};

export const getCheckInById = async (id: string) => {
  const checkIn = await prisma.checkIn.findUnique({
    where: { id },
    include: { photos: true, user: { include: { profile: true } } },
  });
  if (!checkIn) throw new AppError('Check-in bulunamadı', 404);
  return checkIn;
};

export const getMyCheckIns = async (userId: string) => {
  return prisma.checkIn.findMany({
    where: { userId },
    include: { photos: true },
    orderBy: { submittedAt: 'desc' },
  });
};

export const reviewCheckIn = async (id: string, trainerId: string, data: { trainerNote?: string; status: 'REVIEWED' | 'APPROVED' }) => {
  void trainerId;
  return prisma.checkIn.update({
    where: { id },
    data: { ...data, reviewedAt: new Date() },
  });
};
