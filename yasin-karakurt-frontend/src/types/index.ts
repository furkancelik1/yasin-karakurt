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

export interface CheckIn {
  id: string;
  weight?: number;
  bodyFat?: number;
  notes?: string;
  trainerNote?: string;
  status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED';
  submittedAt: string;
  photos: { id: string; url: string; angle?: string }[];
}

export interface Subscription {
  id: string;
  plan: 'BASIC' | 'PREMIUM' | 'VIP';
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate?: string;
  endDate?: string;
}
