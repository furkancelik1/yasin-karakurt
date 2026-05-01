'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Dumbbell, Flame, TrendingUp, Zap, ArrowRight,
  CheckCircle2, Clock, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';

/* ── Bugünkü antrenman verisi — API entegrasyonuna kadar mock ── */
const TODAY_WORKOUT = {
  name:      'Üst Gövde — Kuvvet',
  exercises: 8,
  duration:  '55 dk',
  completed: false,
  progress:  0,
};

const RECENT_ACTIVITIES = [
  { label: 'Alt Gövde antrenmanı tamamlandı',     time: 'Dün, 18:30',    icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Haftalık check-in gönderildi',         time: '2 gün önce',    icon: TrendingUp,   color: 'text-gold'        },
  { label: 'Beslenme hedefine ulaşıldı',           time: '3 gün önce',    icon: Flame,        color: 'text-orange-400'  },
];

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
});

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.profile?.firstName ?? 'Sporcu';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi öğleden sonralar' : 'İyi akşamlar';

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl">

      {/* ── Karşılama başlığı ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col gap-1">
        <p className="text-sm text-ash-500 capitalize">{today}</p>
        <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
          {greeting},{' '}
          <span className="text-gold-shimmer">{firstName}.</span>
        </h2>
        <p className="text-sm text-ash-400 mt-1">
          Programında{' '}
          <span className="font-semibold text-ash-200">3 antrenman</span>{' '}
          tamamlandı · bu hafta hedefin 5 antrenman.
        </p>
      </motion.div>

      {/* ── Bugünkü Antrenman — öne çıkan kart ── */}
      <motion.div {...fadeUp(0.08)}>
        <div className="relative overflow-hidden rounded-2xl border border-gold/15 bg-charcoal/50 p-6 backdrop-blur-sm shadow-gold-soft">
          {/* Arka plan parıltı */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_50%,rgba(201,168,76,0.07),transparent)]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
                <Dumbbell size={20} className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-gold/70 mb-1">
                  Bugünkü Antrenman
                </p>
                <h3 className="font-display text-xl font-bold text-white">
                  {TODAY_WORKOUT.name}
                </h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-ash-500">
                  <span className="flex items-center gap-1.5">
                    <Dumbbell size={12} /> {TODAY_WORKOUT.exercises} egzersiz
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> {TODAY_WORKOUT.duration}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/dashboard/program">
              <Button variant="gold" size="md" className="group gap-2 shrink-0">
                Başla
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          {/* İlerleme çizgisi */}
          <div className="relative mt-5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gold transition-all duration-700"
                style={{ width: `${TODAY_WORKOUT.progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ash-600">
              {TODAY_WORKOUT.completed ? 'Tamamlandı ✓' : 'Henüz başlanmadı'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat grid ── */}
      <motion.div {...fadeUp(0.14)} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Haftalık İlerleme"
          value="3 / 5"
          subtitle="Bu hafta tamamlanan antrenman"
          icon={Zap}
          progress={60}
          accent="gold"
        />
        <StatCard
          title="Kalan Kalori"
          value="1.240"
          subtitle="kcal · Günlük hedefiniz: 2.400"
          icon={Flame}
          progress={48}
          accent="green"
        />
        <StatCard
          title="Seri"
          value="12 Gün"
          subtitle="Kesintisiz aktif gün"
          icon={TrendingUp}
          trend={{ label: '+3 günden fazla', positive: true }}
          accent="gold"
        />
        <StatCard
          title="Son Check-in"
          value="4 Gün"
          subtitle="önce gönderildi"
          icon={CheckCircle2}
          accent="blue"
        />
      </motion.div>

      {/* ── Alt row: son aktiviteler + hızlı linkler ── */}
      <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Son aktiviteler */}
        <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-charcoal/40 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ash-200">Son Aktiviteler</h3>
          </div>
          <ul className="flex flex-col divide-y divide-white/4">
            {RECENT_ACTIVITIES.map(({ label, time, icon: Icon, color }) => (
              <li key={label} className="flex items-center gap-3 py-3">
                <Icon size={15} className={color} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ash-200 truncate">{label}</p>
                  <p className="text-xs text-ash-600">{time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Hızlı linkler */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ash-200 mb-1">Hızlı Erişim</h3>
          {[
            { href: '/dashboard/gelisim',  icon: TrendingUp,   label: 'Check-in Gönder',     sub: 'Gelişimini kaydet'         },
            { href: '/dashboard/beslenme', icon: Flame,        label: 'Beslenme Planı',       sub: 'Günlük makrolarını gör'    },
            { href: '/dashboard/program',  icon: Dumbbell,     label: 'Programı İncele',      sub: 'Haftalık planını gör'      },
          ].map(({ href, icon: Icon, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-charcoal/30 p-4 transition-all duration-200 hover:border-gold/20 hover:bg-charcoal/60"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/8 shrink-0">
                <Icon size={15} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ash-100">{label}</p>
                <p className="text-xs text-ash-600">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-ash-600 group-hover:text-gold transition-colors duration-200 shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
