'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Photo {
  url: string;
}

interface CheckIn {
  id: string;
  submittedAt: string;
  photos: Photo[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

const getImageUrl = (raw: string | null | undefined): string => {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop()?.split('?')[0] ?? '';
  return `${BACKEND_BASE}/uploads/checkins/${filename}`;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ImageCard({ src, label, isAfter = false }: { src: string; label: string; isAfter?: boolean }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden border ${isAfter ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-zinc-700'} bg-zinc-950`}>
      <span className={`absolute top-2 ${isAfter ? 'right-2 bg-amber-500 text-black' : 'left-2 bg-zinc-700 text-zinc-200'} z-10 text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest`}>
        {label}
      </span>

      {hasError || !src ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-zinc-600 bg-zinc-900 text-center p-4">
          <ImageOff size={32} className="mb-2 opacity-20" />
          <span className="text-[10px] italic opacity-50">Görsel Seçilmedi veya Yüklenemedi</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ComparisonPage() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedFirst, setSelectedFirst] = useState('');
  const [selectedSecond, setSelectedSecond] = useState('');

  useEffect(() => {
    api.get('/checkins/stats')
      .then(({ data: res }) => {
        if (res.success) setCheckIns(res.data as CheckIn[]);
      })
      .catch(console.error);
  }, []);

  const firstCheckIn  = checkIns.find(c => c.id === selectedFirst);
  const secondCheckIn = checkIns.find(c => c.id === selectedSecond);
  const bothSelected  = Boolean(selectedFirst && selectedSecond && firstCheckIn && secondCheckIn);

  return (
    <div className="p-6 space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Değişim Analizi</h1>
          <p className="text-zinc-500 text-xs mt-1">Check-in fotoğraflarını yan yana karşılaştır</p>
        </div>
      </header>

      {/* Kişisel Karşılaştırma Alanı */}
      <section className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Başlangıç Dönemi</label>
            <select
              value={selectedFirst}
              onChange={e => setSelectedFirst(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all text-sm"
            >
              <option value="">Tarih Seçiniz...</option>
              {checkIns.map(c => (
                <option key={c.id} value={c.id}>
                  {new Date(c.submittedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Güncel Durum</label>
            <select
              value={selectedSecond}
              onChange={e => setSelectedSecond(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all text-sm"
            >
              <option value="">Tarih Seçiniz...</option>
              {checkIns.map(c => (
                <option key={c.id} value={c.id}>
                  {new Date(c.submittedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Görsel Grid */}
        <div className="pt-4">
          {bothSelected ? (
            <motion.div
              className="grid grid-cols-2 gap-4 md:gap-8"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ImageCard
                src={getImageUrl(firstCheckIn?.photos[0]?.url)}
                label="ÖNCE"
              />
              <ImageCard
                src={getImageUrl(secondCheckIn?.photos[0]?.url)}
                label="SONRA"
                isAfter
              />
            </motion.div>
          ) : (
            <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
              <div className="max-w-xs mx-auto space-y-3">
                <p className="text-zinc-500 italic text-sm">
                  Gelişimini görsel olarak analiz etmek için yukarıdan iki farklı tarih seçin.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}