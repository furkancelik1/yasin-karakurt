'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Star, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/* ─────────────────────────────────────────────────────────
   Before / After Slider Bileşeni
   ───────────────────────────────────────────────────────── */
interface SliderProps {
  beforeSrc?: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'ÖNCE',
  afterLabel  = 'SONRA',
}: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition]   = useState(42);
  const [dragging, setDragging]   = useState(false);
  const [hinted, setHinted]       = useState(false);
  const [hasError, setHasError]   = useState({ before: false, after: false });

  const clamp = (v: number) => Math.min(Math.max(v, 3), 97);

  const moveTo = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    setPosition(clamp(((clientX - left) / width) * 100));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => moveTo(e.clientX);
    const onUp   = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [dragging, moveTo]);

  const onTouchMove = (e: React.TouchEvent) => moveTo(e.touches[0].clientX);

  useEffect(() => {
    const t = setTimeout(() => setHinted(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl select-none',
        'cursor-col-resize aspect-[3/4]',
        'border border-white/10 shadow-[0_0_40px_rgba(201,168,76,0.08)]',
        'transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(201,168,76,0.18)]'
      )}
      onMouseDown={() => setDragging(true)}
      onTouchMove={onTouchMove}
    >
      {/* ── SONRA katmanı ── */}
      <div className="absolute inset-0">
        {afterSrc && !hasError.after ? (
          <Image
            src={afterSrc}
            alt={afterLabel}
            fill
            className="object-cover"
            onError={() => setHasError(prev => ({ ...prev, after: true }))}
          />
        ) : (
          <div className="absolute inset-0 bg-charcoal-200 opacity-30" />
        )}
        <span className="absolute bottom-4 right-4 text-[10px] tracking-luxury uppercase text-gold/70 font-semibold bg-black/60 px-2 py-1 rounded">
          {afterLabel}
        </span>
      </div>

      {/* ── ÖNCE katmanı ── */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {beforeSrc && !hasError.before ? (
          <Image
            src={beforeSrc}
            alt={beforeLabel}
            fill
            className="object-cover"
            onError={() => setHasError(prev => ({ ...prev, before: true }))}
          />
        ) : (
          <div className="absolute inset-0 bg-charcoal-800 opacity-30" />
        )}
        <span className="absolute bottom-4 left-4 text-[10px] tracking-luxury uppercase text-ash-500 font-semibold bg-black/60 px-2 py-1 rounded">
          {beforeLabel}
        </span>
      </div>

      {/* ── Bölücü Çizgi ve Kol ── */}
      <div
        className="absolute inset-y-0 z-10 w-px bg-gold/60 pointer-events-none"
        style={{ left: `${position}%` }}
      />
      <motion.div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${position}%` }}
        animate={!hinted ? { x: [-8, 8, -8, 0] } : {}}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-obsidian/80 backdrop-blur-sm shadow-gold-soft">
          <ArrowLeftRight size={14} className="text-gold" />
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Hikayeler (Cloudinary Linkleri ile Güncellendi)
   ───────────────────────────────────────────────────────── */
const STORIES = [
  {
    name:     'Ahmet K.',
    duration: '12 Hafta',
    plan:     'VIP Paket',
    change:   '-18 kg',
    badgeVariant: 'gold' as const,
    rating:   5,
    quote:    '"Hayatımın en iyi kararı. Sadece kilo vermekle kalmadım; enerji seviyem, uykum ve özgüvenim tamamen değişti. Yasin\'in metodolojisi gerçekten fark yaratıyor."',
    beforeSrc: 'https://res.cloudinary.com/dlueodlhk/image/upload/v1778776757/Photo-1_pxipvi.png',
    afterSrc:  'https://res.cloudinary.com/dlueodlhk/image/upload/v1778776763/Photo-2_ssvucp.png',
  },
  {
    name:     'Selin M.',
    duration: '16 Hafta',
    plan:     'Profesyonel Paket',
    change:   '+7 kg Kas',
    badgeVariant: 'success' as const,
    rating:   5,
    quote:    '"Daha önce pek çok antrenörle çalıştım ama bu kadar bilimsel ve kişiselleştirilmiş bir program görmedim. 16 haftada formuma kavuştum."',
    beforeSrc: 'https://res.cloudinary.com/dlueodlhk/image/upload/v1778776762/Photo-2-1_yois5o.png',
    afterSrc:  'https://res.cloudinary.com/dlueodlhk/image/upload/v1778776762/Photo-2-2_hkilob.png',
  },
  {
    name:     'Murat B.',
    duration: '8 Hafta',
    plan:     'Başlangıç Paketi',
    change:   '-12 kg',
    badgeVariant: 'gold' as const,
    rating:   5,
    quote:    '"Kısa sürede bu kadar sonuç alacağımı hiç tahmin etmezdim. Program çok pratik ve mobil uygulama sayesinde her yerde takip edebildim."',
    beforeSrc: 'https://res.cloudinary.com/dlueodlhk/image/upload/v1778776756/Photo-3-1_nr3p1u.png',
    afterSrc:  'https://res.cloudinary.com/dlueodlhk/image/upload/v1778776761/Photo-3-2_sfu4xl.png',
  },
];

export function TestimonialsSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="basarilar" ref={ref} className="relative overflow-hidden bg-obsidian-50 py-28 md:py-36">
      <div className="section-padding relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
            Gerçek İnsanlar, <span className="text-gold-shimmer">Gerçek Sonuçlar</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ash-400">
            Kaydırarak öncesi ve sonrasını karşılaştırın.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STORIES.map((story, i) => (
            <motion.article
              key={story.name}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.14 }}
              className="flex flex-col gap-5"
            >
              <BeforeAfterSlider beforeSrc={story.beforeSrc} afterSrc={story.afterSrc} />
              <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-charcoal/50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-bold text-white">{story.name}</p>
                    <p className="text-xs text-ash-500">{story.duration} · {story.plan}</p>
                  </div>
                  <Badge variant={story.badgeVariant}>{story.change}</Badge>
                </div>
                <blockquote className="text-sm italic text-ash-400 font-serif">
                  {story.quote}
                </blockquote>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}