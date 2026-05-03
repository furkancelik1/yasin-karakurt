export type Role = 'CLIENT' | 'TRAINER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  profile: Profile | null;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export interface Program {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  startDate?: string;
  endDate?: string;
}

export type CheckInStatus = 'PENDING' | 'REVIEWED' | 'COMPLETED';

export interface CheckIn {
  id: string;
  weight?: number;
  bodyFat?: number;
  notes?: string;
  trainerNote?: string;
  status: CheckInStatus;
  submittedAt: string;
  photos: { id: string; url: string; angle?: string }[];
}

export interface TrainerCheckIn extends CheckIn {
  user: {
    id: string;
    email: string;
    profile: { firstName: string; lastName: string; avatarUrl?: string } | null;
  };
}

export interface Subscription {
  id: string;
  plan: 'BASIC' | 'PREMIUM' | 'VIP';
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate?: string;
  endDate?: string;
}
