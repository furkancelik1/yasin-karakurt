'use client';

import { useEffect, useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import type { TrainerCheckIn, CheckInStatus } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace('/api/v1', '');

const getImageUrl = (url: string | null) => {
  if (!url) return '';
  // URL içinde tam yol olsa da (uploads/...) veya sadece dosya adı olsa da (photo-...) 
  // sadece en sondaki dosya adını alıp doğru klasörle birleştirir.
  const filename = url.split('/').pop(); 
  return `http://localhost:4000/uploads/checkins/${filename}`;
};
// ── Filter config ─────────────────────────────────────────────────────────────
type FilterValue = 'ALL' | 'PENDING' | 'REVIEWED';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Bekleyenler', value: 'PENDING' },
  { label: 'İncelenenler', value: 'REVIEWED' },
  { label: 'Tümü', value: 'ALL' },
];

const STATUS_CFG: Record<CheckInStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Bekliyor',    cls: 'bg-violet-500/20 text-violet-300 border-violet-500/40'   },
  REVIEWED:  { label: 'İncelendi',   cls: 'bg-sky-500/15   text-sky-300    border-sky-500/30'       },
  COMPLETED: { label: 'Tamamlandı',  cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

// ── Framer Motion variants ────────────────────────────────────────────────────
const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function DanisanGaleri() {
  const [checkins, setCheckins] = useState<TrainerCheckIn[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterValue>('PENDING');
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ success: boolean; data: TrainerCheckIn[] }>('/checkins/trainer')
      .then(({ data }) => { if (data.success) setCheckins(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered     = filter === 'ALL' ? checkins : checkins.filter((c) => c.status === filter);
  const pendingCount = checkins.filter((c) => c.status === 'PENDING').length;

  if (loading) return <GalleryLoader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-gold/10 pb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-display text-white tracking-tight uppercase">
            Danışan Gelen Kutusu
          </h1>
          <p className="text-gold/60 mt-2 text-lg font-light italic">
            Danışanlarınızın canlı form güncellemeleri.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full self-center">
            <motion.span
              className="w-2 h-2 rounded-full bg-violet-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-violet-300 text-sm font-medium tracking-wide">
              {pendingCount} bekleyen
            </span>
          </div>
        )}
      </header>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <SlidersHorizontal size={14} className="text-ash/40 shrink-0" />
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={[
              'px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase',
              'transition-all duration-300 border',
              filter === value
                ? 'bg-gold text-black border-gold shadow-gold-soft'
                : 'bg-white/5 text-ash/70 border-white/10 hover:border-gold/30 hover:text-gold',
            ].join(' ')}
          >
            {label}
            {value === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 text-violet-300">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((checkin) => (
              <CheckInCard
                key={checkin.id}
                checkin={checkin}
                onClick={() => router.push(`/checkins/${checkin.id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

// ── CheckInCard ───────────────────────────────────────────────────────────────
const CheckInCard = forwardRef<HTMLDivElement, {
  checkin: TrainerCheckIn;
  onClick: () => void;
}>(({ checkin, onClick }, ref) => {
  const isPending         = checkin.status === 'PENDING';
  const { label, cls }    = STATUS_CFG[checkin.status];
  const name              = checkin.user.profile
    ? `${checkin.user.profile.firstName} ${checkin.user.profile.lastName}`
    : checkin.user.email;
  const initial           = (checkin.user.profile?.firstName?.[0] ?? '?').toUpperCase();
  const date              = new Date(checkin.submittedAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const photoUrl          = checkin.photos[0]?.url ?? null;
  const photoSrc          = getImageUrl(photoUrl);

  return (
    <motion.div
      variants={cardVariants}
      layout
      onClick={onClick}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={[
        'relative cursor-pointer rounded-2xl overflow-hidden',
        'bg-charcoal/60 border transition-colors duration-300',
        isPending
          ? 'border-violet-500/50 animate-neon-purple-pulse'
          : 'border-white/10 hover:border-gold/25',
      ].join(' ')}
    >
      {/* Header: avatar + ad soyad + tarih + durum */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-sm text-gold">{initial}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-display font-medium text-sm uppercase tracking-wide truncate">
            {name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-ash/50 text-xs">
            <Calendar size={11} />
            <span>{date}</span>
          </div>
        </div>

        <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border shrink-0 ${cls}`}>
          {label}
        </span>
      </div>

      {/* Fotoğraf önizlemesi */}
      <div className="mx-4 rounded-xl overflow-hidden aspect-[3/4] bg-obsidian">
        {photoSrc ? (
          // eslint-disable-next-line @next/next-eslint/no-img-element
          <img
            src={photoSrc}
            alt={`${name} gelişim fotoğrafı`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal to-obsidian">
            <span className="text-5xl font-display text-gold/15 uppercase">{initial}</span>
          </div>
        )}
      </div>

      {/* Footer: metrikler + detay linki */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex gap-4 text-xs text-ash/50">
          {checkin.weight != null && (
            <span>
              <span className="text-white/70 font-medium">{checkin.weight}</span> kg
            </span>
          )}
          {checkin.bodyFat != null && (
            <span>
              %<span className="text-white/70 font-medium">{checkin.bodyFat}</span>
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-gold/60 text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">
          Detay <ChevronRight size={12} />
        </span>
      </div>
    </motion.div>
  );
});

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────
function GalleryLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        className="w-9 h-9 rounded-full border-2 border-violet-500/30 border-t-violet-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-ash/50 font-display tracking-widest text-xs italic animate-pulse">
        VERİLER ÇEKİLİYOR...
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-24 text-center rounded-3xl border border-white/5 bg-charcoal/20"
    >
      <p className="text-ash/40 text-xl font-display italic">
        Bu filtrede kayıt bulunmuyor.
      </p>
    </motion.div>
  );
}