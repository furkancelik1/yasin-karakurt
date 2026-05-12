'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Scale,
  Droplets,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle,
  MessageSquare,
  Dumbbell,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react';
import api from '@/lib/api';
import type { CheckInStatus } from '@/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace('/api/v1', '');

const getImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  const filename = url.split('/').pop();
  return `${API_URL}/uploads/checkins/${filename}`;
};

// ── Local types ───────────────────────────────────────────────────────────────
interface Photo { id: string; url: string; angle?: string }

interface CheckInDetail {
  id: string;
  status: CheckInStatus;
  weight: number | null;
  bodyFat: number | null;
  notes: string | null;
  trainerNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  photos: Photo[];
  user: {
    id: string;
    email: string;
    profile: { firstName: string; lastName: string; avatarUrl?: string | null } | null;
  };
}

interface PageData {
  checkin: CheckInDetail;
  previousCheckin: CheckInDetail | null;
  allCheckIns: {
    id: string;
    weight: number | null;
    bodyFat: number | null;
    submittedAt: string;
    photos: Photo[];
  }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<CheckInStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Bekliyor',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30'     },
  REVIEWED:  { label: 'İncelendi',  cls: 'bg-sky-500/15   text-sky-300   border-sky-500/30'       },
  COMPLETED: { label: 'Tamamlandı', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

// ── PhotoGallery ──────────────────────────────────────────────────────────────
function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [idx, setIdx]           = useState(0);
  const [direction, setDir]     = useState(1);

  const go = (next: number) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };

  const slideVariants = {
    enter:  (d: number) => ({ x: d * 80, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:   (d: number) => ({ x: d * -80, opacity: 0, scale: 0.97 }),
  };

  return (
    <div className="space-y-3">
      {/* Main photo */}
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-charcoal/80 group">
        <AnimatePresence custom={direction} mode="wait">
          <motion.img
            key={idx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            src={getImageUrl(photos[idx]?.url)}
            alt="Gelişim fotoğrafı"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Arrow navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => go(idx - 1)}
              disabled={idx === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur text-white disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(idx + 1)}
              disabled={idx === photos.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur text-white disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Overlay labels */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
          {photos[idx]?.angle && (
            <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-bold tracking-widest uppercase text-white/80">
              {photos[idx].angle}
            </span>
          )}
          {photos.length > 1 && (
            <span className="ml-auto px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-xs text-white/60">
              {idx + 1} / {photos.length}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => go(i)}
              className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === idx ? 'border-gold shadow-gold-soft scale-[1.04]' : 'border-transparent opacity-50 hover:opacity-75'}`}
            >
              <img src={getImageUrl(photo.url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DeltaCard ─────────────────────────────────────────────────────────────────
function DeltaCard({
  label, current, previous, unit, icon,
}: {
  label: string;
  current: number | null;
  previous: number | null;
  unit: string;
  icon: React.ReactNode;
}) {
  const diff = current != null && previous != null ? +(current - previous).toFixed(1) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 space-y-3">
      <div className="flex items-center gap-2 text-ash/50 text-[10px] tracking-widest uppercase font-bold">
        {icon} {label}
      </div>
      <p className="text-3xl font-display text-white">
        {current ?? '—'} <span className="text-base text-ash/40">{unit}</span>
      </p>
      {diff !== null && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${
          diff === 0 ? 'text-ash/50' : diff < 0 ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {diff < 0 ? <TrendingDown size={12} /> : diff > 0 ? <TrendingUp size={12} /> : <Minus size={12} />}
          {diff > 0 ? '+' : ''}{diff} {unit} önceki haftaya göre
        </div>
      )}
    </div>
  );
}

// ── ReviewForm ────────────────────────────────────────────────────────────────
function ReviewForm({
  checkinId,
  currentNote,
  currentStatus,
  onReviewed,
}: {
  checkinId: string;
  currentNote: string | null;
  currentStatus: CheckInStatus;
  onReviewed: (result: { trainerNote: string; status: CheckInStatus; rating?: number }) => void;
}) {
  const [note, setNote]         = useState(currentNote ?? '');
  const [rating, setRating]     = useState<number | undefined>(undefined);
  const [status, setStatus]     = useState<'REVIEWED' | 'COMPLETED'>(
    currentStatus === 'COMPLETED' ? 'COMPLETED' : 'REVIEWED',
  );
  const [submitting, setSubmit] = useState(false);
  const [done, setDone]         = useState(false);

  const isReviewed = currentStatus !== 'PENDING' || done;

  const submit = async () => {
    setSubmit(true);
    try {
      await api.patch(`/checkins/${checkinId}/review`, {
        ...(note.trim() && { trainerNote: note.trim() }),
        ...(rating && { rating }),
        status,
      });
      setDone(true);
      onReviewed({ trainerNote: note.trim(), status, rating });
      toast.success('Geri bildirim danışana iletildi!', {
        description: 'Bildirim otomatik olarak gönderildi.',
      });
    } catch {
      toast.error('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSubmit(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gold/15 bg-white/[0.02] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-ash/40 flex items-center gap-2">
          <MessageSquare size={12} /> Koç Değerlendirmesi
        </h2>
        {isReviewed && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
          >
            <CheckCircle size={13} /> İncelendi
          </motion.span>
        )}
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-xs text-ash-400">Performans Puanı (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${rating === star ? 'bg-gold text-black' : 'bg-white/5 text-ash-400 hover:bg-white/10'}`}
            >
              {star} ★
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Danışanınıza geri bildiriminizi yazın... (isteğe bağlı)"
        rows={5}
        className="w-full bg-transparent text-white/80 placeholder-ash/25 resize-none outline-none font-light leading-relaxed text-sm border-b border-white/5 pb-4 focus:border-gold/30 transition-colors"
      />

      {/* Status toggle */}
      <div className="flex gap-3">
        {(['REVIEWED', 'COMPLETED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${status === s ? (s === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40') : 'bg-transparent text-ash/40 border-white/10 hover:border-white/20'}`}
          >
            {s === 'REVIEWED' ? 'İncelendi' : 'Tamamlandı'}
          </button>
        ))}
      </div>

      {/* Submit */}
      <motion.button
        onClick={submit}
        disabled={submitting}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-xl bg-gold text-black font-bold text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-white transition-colors"
      >
        {submitting ? (
          <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</>
        ) : isReviewed ? (
          <><CheckCircle size={14} /> Güncelle</>
        ) : (
          <><Dumbbell size={14} /> Geri Bildirim Gönder</>
        )}
      </motion.button>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckinDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [data, setData]         = useState<PageData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [compareId, setCompareId] = useState<string>('');

  useEffect(() => {
    api
      .get<{ success: boolean; data: PageData }>(`/checkins/${id}`)
      .then(({ data: res }) => {
        if (res.success && res.data) setData(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const allCheckIns = data?.allCheckIns || [];

  const handleReviewed = ({ trainerNote, status }: { trainerNote: string; status: CheckInStatus }) => {
    setData((prev) =>
      prev ? { ...prev, checkin: { ...prev.checkin, status, trainerNote } } : prev,
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-9 h-9 rounded-full border-2 border-gold/30 border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-ash/50 font-display tracking-widest text-xs italic animate-pulse">
          YÜKLENİYOR...
        </p>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-ash/40 text-xl font-display italic">Check-in bulunamadı.</p>
        <button onClick={() => router.back()} className="text-gold text-sm underline underline-offset-4">
          Geri dön
        </button>
      </div>
    );
  }

  const { checkin, previousCheckin } = data;

  const fullName = checkin.user.profile
    ? `${checkin.user.profile.firstName} ${checkin.user.profile.lastName}`
    : checkin.user.email;

  const formattedDate = new Date(checkin.submittedAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const compareOptions = allCheckIns.filter(c => c.id !== checkin?.id);
  const compareCheckin = compareId 
    ? compareOptions.find(c => c.id === compareId) 
    : (previousCheckin ? { 
        ...previousCheckin, 
        photos: previousCheckin.photos || [] 
      } : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 pb-16"
    >
      {/* ── Header ── */}
      <header className="border-b border-gold/10 pb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-white/10 hover:border-gold/40 text-ash hover:text-gold transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-display text-white tracking-tight uppercase">{fullName}</h1>
            <p className="text-gold/50 text-sm mt-1 italic">{formattedDate}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border self-center ${STATUS_CFG[checkin.status].cls}`}>
          {STATUS_CFG[checkin.status].label}
        </span>
      </header>

      {/* ── Gallery + Right panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-start">
        {/* Left: photo gallery */}
        {checkin.photos.length > 0 ? (
          <PhotoGallery photos={checkin.photos} />
        ) : (
          <div className="aspect-[3/4] rounded-3xl border border-white/10 bg-charcoal/40 flex flex-col items-center justify-center gap-3 text-ash/30">
            <ImageOff size={32} />
            <span className="text-sm font-display italic">Fotoğraf yüklenmemiş</span>
          </div>
        )}

        {/* Right: metrics + note + review */}
        <div className="space-y-6">
          {/* Metrics */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-ash/40 mb-3">
              Vücut Metrikleri
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DeltaCard
                label="Ağırlık"
                current={checkin.weight}
                previous={previousCheckin?.weight ?? null}
                unit="kg"
                icon={<Scale size={12} />}
              />
              <DeltaCard
                label="Yağ Oranı"
                current={checkin.bodyFat}
                previous={previousCheckin?.bodyFat ?? null}
                unit="%"
                icon={<Droplets size={12} />}
              />
            </div>
          </div>

          {/* Client note */}
          {checkin.notes && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-ash/40 mb-3">
                Danışan Notu
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-white/70 font-light italic leading-relaxed text-sm">
                  "{checkin.notes}"
                </p>
              </div>
            </div>
          )}

          {/* Review form */}
          <ReviewForm
            checkinId={id}
            currentNote={checkin.trainerNote}
            currentStatus={checkin.status}
            onReviewed={handleReviewed}
          />
        </div>
      </div>

      {/* ── Before / After comparison ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase text-ash/40">
            Görsel Karşılaştırma
          </p>
          
          {compareOptions.length > 0 && (
            <select
              value={compareId}
              onChange={(e) => setCompareId(e.target.value)}
              className="bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="">Otomatik (Önceki Hafta)</option>
              {compareOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {new Date(c.submittedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  {c.weight ? ` - ${c.weight}kg` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        
<div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-charcoal/60 border border-white/10">
            {compareCheckin && compareCheckin.photos && compareCheckin.photos[0]?.url ? (
              <>
                <img
                  src={getImageUrl(compareCheckin.photos[0].url)}
                  alt="Önceki"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-ash/20 font-display italic text-sm">Karşılaştırma yok</p>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[10px] tracking-widest uppercase text-ash/50 font-bold">ÖNCE</p>
              {compareCheckin && (
                <p className="text-white/50 text-xs mt-0.5">
                  {new Date(compareCheckin.submittedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long',
                  })}
                  {compareCheckin.weight && ` • ${compareCheckin.weight}kg`}
                </p>
              )}
            </div>
          </div>

          {/* After */}
          <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-charcoal/60 border-2 border-gold/30">
            {checkin?.photos && checkin.photos[0]?.url ? (
              <>
                <img
                  src={getImageUrl(checkin.photos[0].url)}
                  alt="Sonra"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-gold/20" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-ash/20 font-display italic text-sm">Fotoğraf yok</p>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[10px] tracking-widest uppercase text-gold/70 font-bold">SONRA</p>
              <p className="text-white/50 text-xs mt-0.5">{formattedDate}</p>
            </div>
</div>
        </div>
      </section>
    </motion.div>
  );
}
