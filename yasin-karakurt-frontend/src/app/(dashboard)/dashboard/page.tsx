'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  Activity,
  Zap,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import api from '@/lib/api';
import type { TrainerCheckIn } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────────
interface DashboardStats {
  activeClients: number;
  pendingReviews: number;
  todaySubmissions: number;
}

interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

interface DailySummary {
  consumedCalories: number;
  targetCalories: number;
  remainingCalories: number;
  meals: { completed: number; total: number };
  weeklyProgress: { completed: number; total: number };
  water: number;
}

// ── Animation variants ────────────────────────────────────────────────────────
const pageVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const sectionVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const statGridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const statCardVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTodayTR(): string {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Trainer Dashboard ─────────────────────────────────────────────────────────
function TrainerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [checkins, setCheckins] = useState<TrainerCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, checkinsRes] = await Promise.all([
        api.get<DashboardStatsResponse>('/dashboard/stats'),
        api.get<{ success: boolean; data: TrainerCheckIn[] }>('/checkins/trainer'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (checkinsRes.data.success) setCheckins(checkinsRes.data.data ?? []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, [fetchData]);

  const pending = checkins.filter((c) => c.status === 'PENDING');
  const reviewed = checkins.filter((c) => c.status !== 'PENDING');
  const completionRate = checkins.length > 0
    ? Math.round((reviewed.length / checkins.length) * 100)
    : 0;

  const trainerName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : 'Yasin Hoca';

  const hasPending = !loading && (stats?.pendingReviews ?? 0) > 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* ── Greeting ── */}
      <motion.header variants={sectionVariants} className="space-y-1 border-b border-gold/10 pb-8">
        <p className="text-ash/50 text-sm tracking-widest uppercase">{formatTodayTR()}</p>
        <h1 className="text-5xl font-display text-white tracking-tight leading-tight">
          Hoş geldin,{' '}
          <span className="text-gold italic">{trainerName}.</span>
        </h1>
        <p className="text-ash/45 text-base font-light italic mt-2">
          Platformunuzdaki son durumu buradan takip edebilirsiniz.
        </p>
      </motion.header>

      {/* ── Stat Cards ── */}
      <motion.div
        variants={statGridVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Aktif Danışanlar */}
        <motion.div variants={statCardVariants}>
          {loading ? (
            <div className="bg-charcoal/60 border border-white/10 p-6 rounded-3xl space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-2xl w-10 h-10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            </div>
          ) : (
            <StatCard
              title="Aktif Danışanlar"
              value={stats?.activeClients ?? 0}
              icon={<Users size={20} className="text-gold" />}
            />
          )}
        </motion.div>

        {/* Bekleyen Formlar */}
        <motion.div
          variants={statCardVariants}
          className={hasPending ? 'animate-neon-purple-pulse' : ''}
        >
          {loading ? (
            <div className="bg-charcoal/60 border border-white/10 p-6 rounded-3xl space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-2xl w-10 h-10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            </div>
          ) : (
            <div className={[
              'bg-charcoal/60 backdrop-blur-sm border p-6 rounded-3xl space-y-4 shadow-xl group',
              hasPending ? 'border-violet-500/50' : 'border-gold/10 hover:border-gold/25',
            ].join(' ')}>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${hasPending ? 'bg-violet-500/10' : 'bg-white/5'}`}>
                  <ClipboardList
                    size={20}
                    className={hasPending ? 'text-violet-300' : 'text-orange-400'}
                  />
                </div>
                {hasPending && (
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    Kritik
                  </span>
                )}
              </div>
              <div>
                <p className="text-ash/50 text-xs uppercase tracking-widest font-bold">
                  Bekleyen Formlar
                </p>
                <p className="text-4xl font-display text-white mt-1">
                  {stats?.pendingReviews ?? 0}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bugünkü Bildirimler */}
        <motion.div variants={statCardVariants}>
          {loading ? (
            <div className="bg-charcoal/60 border border-white/10 p-6 rounded-3xl space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-2xl w-10 h-10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            </div>
          ) : (
            <StatCard
              title="Bugünkü Bildirimler"
              value={stats?.todaySubmissions ?? 0}
              icon={<TrendingUp size={20} className="text-gold" />}
            />
          )}
        </motion.div>
      </motion.div>

      {/* ── Glassmorphism CTA ── */}
      <motion.div variants={sectionVariants}>
        <button
          onClick={() => router.push('/checkins')}
          className="group w-full rounded-3xl border border-gold/15 bg-white/[0.03] backdrop-blur-md p-8 flex items-center justify-between hover:border-gold/40 hover:bg-white/[0.05] transition-all duration-300 shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
              <ClipboardList size={28} className="text-gold" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gold/60 mb-1">
                Hızlı Erişim
              </p>
              <h2 className="text-2xl font-display text-white uppercase tracking-wide">
                İnceleme Galerisini Aç
              </h2>
              <p className="text-ash/50 text-sm mt-1 font-light">
                {hasPending
                  ? `${stats?.pendingReviews ?? 0} danışanın formu incelemenizi bekliyor`
                  : 'Tüm check-in formlarını görüntüle ve geri bildirim gönder'}
              </p>
            </div>
          </div>
          <ArrowRight
            size={24}
            className="text-gold/50 group-hover:text-gold group-hover:translate-x-1.5 transition-all duration-300 shrink-0"
          />
        </button>
      </motion.div>

      {/* ── Pending mini list ── */}
      {hasPending && (
        <motion.section variants={sectionVariants} className="space-y-4">
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-ash/40 flex items-center gap-2">
            <Clock size={12} /> İnceleme Bekleyenler
          </h2>

          <div className="space-y-2">
            {pending.slice(0, 5).map((checkin) => {
              const name = checkin.user.profile
                ? `${checkin.user.profile.firstName} ${checkin.user.profile.lastName}`
                : checkin.user.email;
              const date = new Date(checkin.submittedAt).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long',
              });
              const initial = (checkin.user.profile?.firstName?.[0] ?? '?').toUpperCase();

              return (
                <motion.button
                  key={checkin.id}
                  onClick={() => router.push(`/checkins/${checkin.id}`)}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-charcoal/40 border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <span className="text-violet-300 font-display font-bold text-xs">{initial}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-medium font-display uppercase tracking-wide leading-none">
                        {name}
                      </p>
                      <p className="text-ash/50 text-xs mt-0.5">{date}</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-ash/30 group-hover:text-violet-300 transition-colors shrink-0"
                  />
                </motion.button>
              );
            })}
          </div>

          {pending.length > 5 && (
            <button
              onClick={() => router.push('/checkins')}
              className="text-gold/60 text-xs font-medium hover:text-gold transition-colors tracking-widest uppercase"
            >
              + {pending.length - 5} daha fazla görüntüle →
            </button>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}

// ── Client Dashboard ──────────────────────────────────────────────────────────
function ClientDashboard({ name }: { name: string }) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: DailySummary }>('/users/daily-summary');
      if (res.data.success) setSummary(res.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchSummary().finally(() => setLoading(false));
  }, [fetchSummary]);

  useEffect(() => {
    window.addEventListener('focus', fetchSummary);
    return () => window.removeEventListener('focus', fetchSummary);
  }, [fetchSummary]);

  // ── loading skeleton ──
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-3">
          <motion.div
            className="h-3 w-32 rounded bg-white/10"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="h-7 w-64 rounded bg-white/10"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
          />
          <motion.div
            className="h-3 w-48 rounded bg-white/10"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-white/10 bg-charcoal/60 p-6 space-y-4"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 + i * 0.15 }}
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 rounded bg-white/10" />
                <div className="h-4 w-4 rounded bg-white/10" />
              </div>
              <div className="h-8 w-20 rounded bg-white/10" />
              <div className="h-1 w-full rounded bg-white/10" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  const pct = summary
    ? Math.round((summary.weeklyProgress.completed / summary.weeklyProgress.total) * 100)
    : 0;
  const calPct = summary
    ? Math.round((summary.remainingCalories / summary.targetCalories) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <p className="text-ash/50 text-sm">{formatTodayTR()}</p>
        <h1 className="text-4xl font-display text-white tracking-tight mt-1">
          İyi günler, <span className="text-gold uppercase">{name}</span>.
        </h1>
        <p className="text-ash/50 mt-2 font-light italic">Programındaki gelişimlerin burada.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Haftalık İlerleme */}
        <div className="bg-charcoal/60 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ash/50 text-xs uppercase tracking-widest font-bold">Haftalık İlerleme</p>
            <Zap size={16} className="text-gold" />
          </div>
          <p className="text-3xl font-display text-white">
            {summary?.weeklyProgress.completed ?? 0} / {summary?.weeklyProgress.total ?? 5}
          </p>
          <ProgressBar value={pct} color="bg-gold" />
        </div>

        {/* Kalan Kalori */}
        <div className="bg-charcoal/60 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ash/50 text-xs uppercase tracking-widest font-bold">Kalan Kalori</p>
            <Flame size={16} className="text-emerald-400" />
          </div>
          {!summary?.targetCalories ? (
            <p className="text-ash/40 text-sm font-medium">Hedef Belirlenmedi</p>
          ) : (
            <>
              <p className="text-3xl font-display text-white">
                {summary.remainingCalories.toLocaleString('tr-TR')}
              </p>
              <p className="text-ash/50 text-xs">
                {summary.consumedCalories.toLocaleString('tr-TR')} /{' '}
                {summary.targetCalories.toLocaleString('tr-TR')} kcal
              </p>
              <ProgressBar value={calPct} color="bg-emerald-400" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (user?.role === 'TRAINER' || user?.role === 'ADMIN') {
    return <TrainerDashboard />;
  }

  const clientName = user?.profile?.firstName ?? 'Danışan';
  return <ClientDashboard name={clientName} />;
}
