'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  CheckCircle2,
  Eye,
  Dumbbell,
  Utensils,
  Plus,
  FileText,
  Download,
} from 'lucide-react';
import api from '@/lib/api';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { NutritionEditor } from '@/components/dashboard/NutritionEditor';
import { Scale as WeightIcon, TrendingDown, TrendingUp, Moon, Star } from 'lucide-react';

interface CheckInPhoto {
  id: string;
  url: string;
  angle?: string | null;
}

interface CheckIn {
  id: string;
  userId: string;
  weight: number | null;
  bodyFat: number | null;
  notes: string | null;
  trainerNote: string | null;
  status: 'PENDING' | 'REVIEWED' | 'COMPLETED';
  submittedAt: string;
  reviewedAt: string | null;
  photos: CheckInPhoto[];
}

interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  height?: number | null;
  weight?: number | null;
  fitnessGoal?: string | null;
}

interface ClientUser {
  id: string;
  email: string;
  isActive: boolean;
  profile: UserProfile | null;
}

interface UserProgram {
  id: string;
  userId: string;
  type: 'TRAINING' | 'NUTRITION';
  title: string;
  content: string | null;
  contentType: 'TEXT' | 'FILE';
  fileUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusConfig(status: CheckIn['status']) {
  switch (status) {
    case 'PENDING':
      return { label: 'Beklemede', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    case 'REVIEWED':
      return { label: 'İncelendi', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    case 'COMPLETED':
      return { label: 'Tamamlandı', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    default:
      return { label: status, cls: 'text-ash/60 bg-white/5 border-white/10' };
  }
}

const getPhotoUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace('/api/v1', '');
  return `${base}${url}`;
};

function PhotoGallery({ photos }: { photos: CheckInPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  if (photos.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(idx)}
            className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 hover:border-gold/40 transition-all shrink-0 group"
          >
            <img
              src={getPhotoUrl(photo.url)}
              alt={`Gelişim fotoğrafı ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <Eye size={14} className="absolute bottom-1 right-1 text-white/70 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1); }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={getPhotoUrl(photos[selectedIndex].url)}
              alt={`Fotoğraf ${selectedIndex + 1}`}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1); }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {selectedIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewModal({ 
  checkinId, 
  onClose, 
  onSuccess 
}: { 
  checkinId: string; 
  onClose: () => void; 
  onSuccess: (trainerNote: string) => void;
}) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.patch<{ success: boolean; data: CheckIn }>(`/checkins/${checkinId}/review`, { 
        trainerNote: note,
        status: 'REVIEWED'
      });
      toast.success('İnceleme kaydedildi.');
      onSuccess(note);
      onClose();
    } catch (error) {
      toast.error('İnceleme kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-charcoal border border-gold/20 rounded-3xl p-6 w-full max-w-lg space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display text-white uppercase tracking-wide">
            İnceleme Yap
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-ash/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="text-ash/70 text-sm font-medium mb-2 block">
            Danışana notun (isteğe bağlı)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Harika ilerleme! Kilo hedefine yaklaşıyorsun..."
            rows={4}
            className="w-full bg-charcoal/60 border border-white/10 rounded-xl p-4 text-white placeholder:text-ash/30 focus:border-gold/40 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-ash/60 hover:text-white hover:border-white/20 font-bold text-sm uppercase tracking-widest transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-gold text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Send size={14} /> Kaydet
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckInCard({ 
  checkin, 
  onReview 
}: { 
  checkin: CheckIn; 
  onReview: (id: string) => void;
}) {
  const statusCfg = getStatusConfig(checkin.status);
  const hasReview = checkin.trainerNote && checkin.trainerNote.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-charcoal/40 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-gold/10 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gold/10 rounded-xl border border-gold/20">
            <Calendar size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-white font-display font-medium text-sm uppercase tracking-wide">
              {formatDate(checkin.submittedAt)}
            </p>
            <p className="text-ash/40 text-xs flex items-center gap-1 mt-0.5">
              <Clock size={10} />
              {formatDateTime(checkin.submittedAt)}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${statusCfg.cls}`}>
          {statusCfg.label}
        </span>
      </div>

      {checkin.weight !== null && (
        <div className="flex items-center gap-3 p-3 bg-gold/5 rounded-xl border border-gold/10">
          <WeightIcon size={16} className="text-gold" />
          <span className="text-ash/60 text-sm">Kilo</span>
          <span className="text-gold font-display font-bold text-lg ml-auto">
            {checkin.weight} kg
          </span>
        </div>
      )}

      {checkin.notes && (
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={12} className="text-ash/50" />
            <span className="text-ash/40 text-[10px] font-bold uppercase tracking-wider">Danışan Notu</span>
          </div>
          <p className="text-ash/60 italic text-sm leading-relaxed">
            {checkin.notes}
          </p>
        </div>
      )}

      {hasReview && (
        <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={12} className="text-sky-400" />
            <span className="text-sky-400 text-[10px] font-bold uppercase tracking-wider">Eğitmen Notu</span>
          </div>
          <p className="text-sky-300/80 text-sm leading-relaxed">
            {checkin.trainerNote}
          </p>
          {checkin.reviewedAt && (
            <p className="text-ash/40 text-xs mt-2">
              İncelendi: {formatDateTime(checkin.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {checkin.photos.length > 0 && (
        <div>
          <p className="text-ash/40 text-[10px] font-bold uppercase tracking-wider mb-2">Fotoğraflar</p>
          <PhotoGallery photos={checkin.photos} />
        </div>
      )}

      <button
        onClick={() => onReview(checkin.id)}
        className="w-full py-2.5 rounded-xl border border-white/10 text-ash/60 hover:text-white hover:border-gold/30 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        <MessageSquare size={14} /> İncele ve Not Ekle
      </button>
    </motion.div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientUser | null>(null);
  const [checkins, setCheckIns] = useState<CheckIn[]>([]);
  const [clientStats, setClientStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
const [programs, setPrograms] = useState<UserProgram[]>([]);
  const [assigningType, setAssigningType] = useState<'TRAINING' | 'NUTRITION' | null>(null);
  const [summary, setSummary] = useState<{
    totalChange: number | null;
    currentWeight: number | null;
    avgSleep: number | null;
    avgEnergy: number | null;
    continuityScore: number | null;
    latestRating: number | null;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, checkinsRes, statsRes, summaryRes] = await Promise.all([
          api.get<{ success: boolean; data: ClientUser }>(`/users/${clientId}`),
          api.get<{ success: boolean; data: CheckIn[] }>(`/checkins/client/${clientId}`),
          api.get<{ success: boolean; data: any }>(`/checkins/client/${clientId}/stats`),
          api.get<{ success: boolean; data: any }>(`/checkins/summary/${clientId}`),
        ]);
        
        if (clientRes.data.success) setClient(clientRes.data.data);
        if (checkinsRes.data.success) setCheckIns(checkinsRes.data.data || []);
        if (statsRes.data.success) setClientStats(statsRes.data.data);
        if (summaryRes.data.success) setSummary(summaryRes.data.data);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        toast.error('Veriler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchData();
  }, [clientId]);

  const handleReviewSuccess = (trainerNote: string) => {
    setCheckIns(prev => prev.map((c: CheckIn) => 
      c.id === reviewingId 
        ? { ...c, status: 'REVIEWED' as const, reviewedAt: new Date().toISOString(), trainerNote }
        : c
    ));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-ash/40 font-display italic text-lg">Danışan bulunamadı.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-5 py-2 rounded-xl border border-white/10 text-ash/60 hover:text-white hover:border-white/20 text-sm transition-colors"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const clientName = client.profile 
    ? `${client.profile.firstName} ${client.profile.lastName}` 
    : client.email;

  const stats = {
    totalCheckIns: checkins.length,
    reviewedCount: checkins.filter(c => c.status === 'REVIEWED').length,
    pendingCount: checkins.filter(c => c.status === 'PENDING').length,
    latestWeight: checkins.find(c => c.weight)?.weight,
    weightHistory: checkins.filter(c => c.weight !== null).map(c => c.weight as number),
    weightChange: clientStats?.weightChange,
    avgSleepHours: clientStats?.avgSleepHours,
    avgEnergyLevel: clientStats?.avgEnergyLevel,
    avgStressLevel: clientStats?.avgStressLevel,
  };

  const weightChange = stats.weightChange ?? (
    stats.weightHistory.length >= 2 
      ? stats.weightHistory[0] - stats.weightHistory[stats.weightHistory.length - 1]
      : null
  );

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-xl border border-white/10 hover:border-gold/30 text-ash/60 hover:text-gold transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-display font-bold text-gold text-xl">
              {client.profile?.firstName?.[0] ?? client.email[0]}
            </div>
            <div>
              <h1 className="text-2xl font-display text-white uppercase tracking-wide truncate">
                {clientName}
              </h1>
              <p className="text-ash/50 text-sm truncate">{client.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Güncel Kilo"
          value={summary && summary.currentWeight ? `${summary.currentWeight} kg` : '—'}
          icon={<WeightIcon size={18} className="text-gold" />}
        />
        <StatCard
          title="Toplam Değişim"
          value={summary && summary.totalChange !== null 
            ? `${summary.totalChange > 0 ? '+' : ''}${summary.totalChange} kg` 
            : '—'}
          icon={summary && summary.totalChange !== null ? (
            summary.totalChange < 0 
              ? <TrendingDown size={18} className="text-emerald-400" />
              : <TrendingUp size={18} className="text-rose-400" />
          ) : <WeightIcon size={18} className="text-gold" />}
        />
        <StatCard
          title="Ortalama Uyku"
          value={summary && summary.avgSleep ? `${summary.avgSleep}s` : '—'}
          icon={<Moon size={18} className="text-sky-400" />}
        />
        <StatCard
          title="Form Puanı"
          value={summary?.latestRating ? `${summary.latestRating}/5` : '—'}
          icon={<Star size={18} className="text-gold" />}
        />
      </div>

      {client.profile?.fitnessGoal && (
        <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-5">
          <p className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2">Fitness Hedefi</p>
          <p className="text-white/80 font-light">{client.profile.fitnessGoal}</p>
        </div>
      )}

      <div className="border-t border-gold/10 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display text-white uppercase tracking-wide flex items-center gap-2">
            <Dumbbell size={18} className="text-gold" />
            Program Yönetimi
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setAssigningType('TRAINING')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/20 bg-gold/10 text-gold hover:bg-gold/20 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <Dumbbell size={14} /> Antrenman
            </button>
            <button
              onClick={() => setAssigningType('NUTRITION')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <Utensils size={14} /> Beslenme
            </button>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-8 bg-charcoal/20 border border-white/5 rounded-2xl">
            <p className="text-ash/30 font-display italic">Henüz program atanmamış.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`p-4 rounded-2xl border ${
                  program.type === 'TRAINING'
                    ? 'bg-charcoal/40 border-gold/10'
                    : 'bg-charcoal/40 border-emerald-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {program.type === 'TRAINING' ? (
                    <Dumbbell size={16} className="text-gold" />
                  ) : (
                    <Utensils size={16} className="text-emerald-400" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    program.type === 'TRAINING' ? 'text-gold' : 'text-emerald-400'
                  }`}>
                    {program.type === 'TRAINING' ? 'Antrenman' : 'Beslenme'}
                  </span>
                  <span className="text-ash/30 text-xs ml-auto">
                    {new Date(program.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h3 className="text-white font-medium text-sm mb-2">{program.title}</h3>
                  {program.contentType === 'FILE' && program.fileUrl ? (
                    <a
                      href={program.fileUrl.startsWith('http://') || program.fileUrl.startsWith('https://') ? program.fileUrl : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace('/api/v1', '')}${program.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gold/70 hover:text-gold text-xs transition-colors"
                  >
                    <Download size={12} /> Dosyayı İndir
                  </a>
                ) : program.content ? (
                  <p className="text-ash/50 text-xs line-clamp-2">{program.content}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gold/10 pt-8">
        <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-4 mb-6">
          <ProgressChart userId={Array.isArray(params.id) ? params.id[0] : params.id} />
        </div>

        <h2 className="text-lg font-display text-white uppercase tracking-wide mb-6 flex items-center gap-2">
          <Calendar size={18} className="text-gold" />
          Gelişim Geçmişi
        </h2>

        {checkins.length === 0 ? (
          <div className="text-center py-16 bg-charcoal/20 border border-white/5 rounded-2xl">
            <p className="text-ash/30 font-display italic text-lg">Henüz check-in bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {checkins.map((checkin) => (
                <CheckInCard
                  key={checkin.id}
                  checkin={checkin}
                  onReview={(id) => setReviewingId(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {reviewingId && (
          <ReviewModal
            checkinId={reviewingId}
            onClose={() => setReviewingId(null)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>

      {assigningType === 'NUTRITION' && clientId && (
        <NutritionEditor
          userId={clientId}
          onClose={() => setAssigningType(null)}
        />
      )}
    </div>
  );
}