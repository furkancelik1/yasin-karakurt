import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export const createProgram = async (data: {
  title: string;
  description?: string;
  clientId: string;
  trainerId: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  return prisma.program.create({ data, include: { client: { include: { profile: true } } } });
};

export const getProgramById = async (id: string) => {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      client: { include: { profile: true } },
      trainer: { include: { profile: true } },
      weeks: { include: { days: { include: { exercises: true } } }, orderBy: { weekNumber: 'asc' } },
    },
  });
  if (!program) throw new AppError('Program bulunamadı', 404);
  return program;
};

export const getProgramsByClient = async (clientId: string) => {
  return prisma.program.findMany({
    where: { clientId },
    include: { weeks: { include: { days: { include: { exercises: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateProgram = async (id: string, data: Record<string, unknown>) => {
  return prisma.program.update({ where: { id }, data });
};
