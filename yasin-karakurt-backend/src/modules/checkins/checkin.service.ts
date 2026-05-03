import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CheckInStatus } from '@prisma/client';

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
} as const;

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
      photos: photoUrls ? { create: photoUrls } : undefined,
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

export const getTrainerCheckins = async () => {
  return prisma.checkIn.findMany({
    include: checkinInclude,
    orderBy: { submittedAt: 'desc' },
  });
};

export const reviewCheckIn = async (
  id: string,
  data: { trainerNote?: string; status?: CheckInStatus }
) => {
  const checkIn = await prisma.checkIn.findUnique({ where: { id } });
  if (!checkIn) throw new AppError('Check-in bulunamadı', 404);

  return prisma.$transaction(async (tx) => {
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
