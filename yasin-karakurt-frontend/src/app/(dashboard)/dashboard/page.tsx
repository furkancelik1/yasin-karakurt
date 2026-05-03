'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import api from '@/lib/api';
import type { TrainerCheckIn } from '@/types';

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
  const [checkins, setCheckins] = useState<TrainerCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; data: TrainerCheckIn[] }>('/checkins/trainer')
      .then(({ data }) => { if (data.success) setCheckins(data.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending        = checkins.filter((c) => c.status === 'PENDING');
  const reviewed       = checkins.filter((c) => c.status !== 'PENDING');
  const uniqueClients  = new Set(checkins.map((c) => c.user.id)).size;
  const completionRate = checkins.length > 0
    ? Math.round((reviewed.length / checkins.length) * 100)
    : 0;

  const trainerName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : 'Yasin Hoca';

  const hasPending = !loading && pending.length > 0;

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
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        {/* Pending — neon purple pulse when count > 0 */}
        <motion.div
          variants={statCardVariants}
          className={[
            'rounded-3xl transition-all duration-300',
            hasPending ? 'animate-neon-purple-pulse' : '',
          ].join(' ')}
        >
          <div className={[
            'bg-charcoal/60 backdrop-blur-sm border p-6 rounded-3xl space-y-4 shadow-xl group',
            hasPending
              ? 'border-violet-500/50'
              : 'border-gold/10 hover:border-gold/25',
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
                Bekleyen Check-in
              </p>
              <p className="text-4xl font-display text-white mt-1">
                {loading ? '—' : pending.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active clients */}
        <motion.div variants={statCardVariants}>
          <StatCard
            title="Aktif Danışanlar"
            value={loading ? '—' : uniqueClients}
            icon={<Users size={20} className="text-gold" />}
            trend="Toplam"
          />
        </motion.div>

        {/* Completion rate */}
        <motion.div variants={statCardVariants}>
          <div className="bg-charcoal/60 backdrop-blur-sm border border-gold/10 hover:border-gold/25 p-6 rounded-3xl space-y-4 shadow-xl group transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-sky-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 size={20} className="text-sky-400" />
              </div>
              <span className="text-xs font-medium text-sky-300 bg-sky-500/10 px-2 py-1 rounded-full uppercase tracking-tighter border border-sky-500/20">
                Haftalık
              </span>
            </div>
            <div>
              <p className="text-ash/50 text-xs uppercase tracking-widest font-bold">
                İnceleme Oranı
              </p>
              <p className="text-4xl font-display text-white mt-1">
                {loading ? '—' : `%${completionRate}`}
              </p>
              {!loading && checkins.length > 0 && (
                <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-sky-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          </div>
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
                  ? `${pending.length} danışanın formu incelemenizi bekliyor`
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

// ── Client Dashboard (stub) ───────────────────────────────────────────────────
function ClientDashboard({ name }: { name: string }) {
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
        <div className="bg-charcoal/60 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ash/50 text-xs uppercase tracking-widest font-bold">Haftalık İlerleme</p>
            <Zap size={16} className="text-gold" />
          </div>
          <p className="text-3xl font-display text-white">3 / 5</p>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div className="bg-gold h-full w-[60%]" />
          </div>
        </div>

        <div className="bg-charcoal/60 border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ash/50 text-xs uppercase tracking-widest font-bold">Kalan Kalori</p>
            <Flame size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-display text-white">1.240</p>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[48%]" />
          </div>
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
