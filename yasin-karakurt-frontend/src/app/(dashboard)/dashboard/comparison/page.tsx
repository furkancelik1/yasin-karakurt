'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Scale, 
  TrendingDown, 
  TrendingUp,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface CheckInPhoto {
  id: string;
  url: string;
  angle: string | null;
}

interface CheckInData {
  id: string;
  weight: number | null;
  bodyFat: number | null;
  submittedAt: string;
  photos: CheckInPhoto[];
}

interface ComparisonOption {
  id: string;
  label: string;
  weight: number | null;
  bodyFat: number | null;
  submittedAt: string;
}

export default function ComparisonPage() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirst, setSelectedFirst] = useState<string>('');
  const [selectedSecond, setSelectedSecond] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentPhotos, setCurrentPhotos] = useState<CheckInPhoto[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    api.get<{ success: boolean; data: CheckInData[] }>('/checkins/stats')
      .then(({ data: res }) => {
        if (res.success && res.data) {
          setCheckIns(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const options: ComparisonOption[] = checkIns.map(c => ({
    id: c.id,
    label: new Date(c.submittedAt).toLocaleDateString('tr-TR', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }),
    weight: c.weight,
    bodyFat: c.bodyFat,
    submittedAt: c.submittedAt,
  }));

  const firstCheckIn = checkIns.find(c => c.id === selectedFirst);
  const secondCheckIn = checkIns.find(c => c.id === selectedSecond);

  const weightDiff = firstCheckIn?.weight && secondCheckIn?.weight
    ? +(secondCheckIn.weight - firstCheckIn.weight).toFixed(1)
    : null;

  const getPhotoByAngle = (photos: CheckInPhoto[], angle: string) => 
    photos.find(p => p.angle?.toLowerCase() === angle) || photos[0];

  const openLightbox = (photos: CheckInPhoto[], idx: number) => {
    setCurrentPhotos(photos);
    setLightboxIndex(idx);
    setLightboxImage(photos[idx]?.url || '');
    setLightboxOpen(true);
  };

  const navigateLightbox = (dir: 1 | -1) => {
    if (!currentPhotos.length) return;
    const newIdx = (lightboxIndex + dir + currentPhotos.length) % currentPhotos.length;
    setLightboxIndex(newIdx);
    setLightboxImage(currentPhotos[newIdx]?.url || '');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-xl border border-white/10 hover:border-gold/30 text-ash/60 hover:text-gold transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display text-white uppercase tracking-wide">
            Görsel Karşılaştırma
          </h1>
          <p className="text-ash/50 text-sm">İki farklı dönemi yan yana incele</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4">
          <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
            İlk Tarih (Önce)
          </label>
          <select
            value={selectedFirst}
            onChange={(e) => setSelectedFirst(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
          >
            <option value="">Tarih seç...</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} {opt.weight ? `• ${opt.weight}kg` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4">
          <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
            İkinci Tarih (Sonra)
          </label>
          <select
            value={selectedSecond}
            onChange={(e) => setSelectedSecond(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
          >
            <option value="">Tarih seç...</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} {opt.weight ? `• ${opt.weight}kg` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedFirst && selectedSecond && weightDiff !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border ${
            weightDiff <= 0 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : 'bg-rose-500/10 border-rose-500/20'
          }`}
        >
          {weightDiff <= 0 ? (
            <TrendingDown size={20} className="text-emerald-400" />
          ) : (
            <TrendingUp size={20} className="text-rose-400" />
          )}
          <span className="text-white font-medium">
            Bu iki tarih arasında toplam{' '}
            <span className={weightDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {weightDiff > 0 ? '+' : ''}{weightDiff} kg
            </span>{' '}
            fark var
          </span>
        </motion.div>
      )}

      {selectedFirst && selectedSecond && firstCheckIn && secondCheckIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {['front', 'side', 'back'].map((angle) => {
            const title = angle === 'front' ? 'Ön' : angle === 'side' ? 'Yan' : 'Arka';
            const photo1 = getPhotoByAngle(firstCheckIn.photos, angle);
            const photo2 = getPhotoByAngle(secondCheckIn.photos, angle);

            if (!photo1 && !photo2) return null;

            return (
              <div key={angle} className="space-y-3">
                <h3 className="text-ash/40 text-xs font-bold uppercase tracking-wider">
                  {title} Görünüm
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => photo1 && openLightbox(firstCheckIn.photos, firstCheckIn.photos.findIndex(p => p.id === photo1.id))}
                      disabled={!photo1}
                      className="relative w-full aspect-square rounded-2xl overflow-hidden bg-charcoal/60 border border-white/10 disabled:opacity-30"
                    >
                      {photo1 ? (
                        <>
                          <img
                            src={`${API_URL}${photo1.url}`}
                            alt="Önce"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 size={24} className="text-white/0 hover:text-white/80" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ash/30">
                          Fotoğraf yok
                        </div>
                      )}
                    </button>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ash/50">{new Date(firstCheckIn.submittedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                      <div className="flex gap-2">
                        {firstCheckIn.weight && (
                          <span className="text-gold/70">{firstCheckIn.weight}kg</span>
                        )}
                        {firstCheckIn.bodyFat && (
                          <span className="text-sky-400/70">{firstCheckIn.bodyFat}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => photo2 && openLightbox(secondCheckIn.photos, secondCheckIn.photos.findIndex(p => p.id === photo2.id))}
                      disabled={!photo2}
                      className="relative w-full aspect-square rounded-2xl overflow-hidden bg-charcoal/60 border border-gold/20 disabled:opacity-30"
                    >
                      {photo2 ? (
                        <>
                          <img
                            src={`${API_URL}${photo2.url}`}
                            alt="Sonra"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 size={24} className="text-white/0 hover:text-white/80" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ash/30">
                          Fotoğraf yok
                        </div>
                      )}
                    </button>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ash/50">{new Date(secondCheckIn.submittedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                      <div className="flex gap-2">
                        {secondCheckIn.weight && (
                          <span className="text-gold/70">{secondCheckIn.weight}kg</span>
                        )}
                        {secondCheckIn.bodyFat && (
                          <span className="text-sky-400/70">{secondCheckIn.bodyFat}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {!selectedFirst && !selectedSecond && (
        <div className="text-center py-20 bg-charcoal/20 border border-white/5 rounded-2xl">
          <Calendar size={48} className="text-ash/20 mx-auto mb-4" />
          <p className="text-ash/40 font-display italic">
            İki tarih seçerek karşılaştırmaya başla
          </p>
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <img
              src={`${API_URL}${lightboxImage}`}
              alt="Büyük"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {currentPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}