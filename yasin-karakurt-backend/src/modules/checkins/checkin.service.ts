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
  sleepHours?: number;
  energyLevel?: number;
  stressLevel?: number;
  hungerLevel?: number;
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

export const getCheckInsByUserId = async (userId: string) => {
  return prisma.checkIn.findMany({
    where: { userId },
    include: { photos: true, user: { include: { profile: true } } },
    orderBy: { submittedAt: 'desc' },
  });
};

export interface ClientStats {
  weightChange: number | null;
  avgSleepHours: number | null;
  avgEnergyLevel: number | null;
  avgStressLevel: number | null;
  avgHungerLevel: number | null;
  totalCheckIns: number;
}

export const getClientStats = async (userId: string): Promise<ClientStats> => {
  const checkIns = await prisma.checkIn.findMany({
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
    ? +(valuesWithData[0].weight! - valuesWithData[valuesWithData.length - 1].weight!).toFixed(1)
    : null;

  const sleepValues = checkIns.map(c => c.sleepHours).filter((v): v is number => v != null);
  const avgSleepHours = sleepValues.length > 0
    ? +(sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1)
    : null;

  const energyValues = checkIns.map(c => c.energyLevel).filter((v): v is number => v != null);
  const avgEnergyLevel = energyValues.length > 0
    ? +(energyValues.reduce((a, b) => a + b, 0) / energyValues.length).toFixed(1)
    : null;

  const stressValues = checkIns.map(c => c.stressLevel).filter((v): v is number => v != null);
  const avgStressLevel = stressValues.length > 0
    ? +(stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)
    : null;

  const hungerValues = checkIns.map(c => c.hungerLevel).filter((v): v is number => v != null);
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

interface ReviewCheckInData {
  trainerNote?: string;
  status?: CheckInStatus;
  rating?: number;
  coachNotes?: string;
}

export const reviewCheckIn = async (
  id: string,
  data: ReviewCheckInData
) => {
  const checkIn = await prisma.checkIn.findUnique({ where: { id } });
  if (!checkIn) throw new AppError('Check-in bulunamadı', 404);

  const wasAlreadyReviewed = checkIn.status === 'REVIEWED' || checkIn.status === 'COMPLETED';

  return prisma.$transaction(async (tx) => {
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