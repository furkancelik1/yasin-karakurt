'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Star, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/* ─────────────────────────────────────────────────────────
   Base URL for images
   ───────────────────────────────────────────────────────── */
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
  : 'http://localhost:4000';

/* ─────────────────────────────────────────────────────────
   Before / After Slider
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

  /* Mouse */
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

  /* Touch */
  const onTouchMove = (e: React.TouchEvent) => moveTo(e.touches[0].clientX);

  /* Hint animation */
  useEffect(() => {
    const t = setTimeout(() => setHinted(true), 800);
    return () => clearTimeout(t);
  }, []);

  const hasImages = beforeSrc || afterSrc;

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
      {/* ── SONRA katmanı (arka plan) ── */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-50 via-charcoal-100 to-charcoal-200 opacity-30" />
        )}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(201,168,76,0.04) 40px,rgba(201,168,76,0.04) 41px)' }}
        />
        <span className="absolute bottom-4 right-4 text-[10px] tracking-luxury uppercase text-gold/70 font-semibold bg-black/60 px-2 py-1 rounded">
          {afterLabel}
        </span>
      </div>

      {/* ── ÖNCE katmanı — clip ile kırpılır ── */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-100 via-charcoal-200 to-obsidian opacity-30" />
        )}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(0,0,0,0.08) 40px,rgba(0,0,0,0.08) 41px)' }}
        />
        <span className="absolute bottom-4 left-4 text-[10px] tracking-luxury uppercase text-ash-500 font-semibold bg-black/60 px-2 py-1 rounded">
          {beforeLabel}
        </span>
      </div>

      {/* ── Bölücü çizgi ── */}
      <div
        className="absolute inset-y-0 z-10 w-px bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0 pointer-events-none"
        style={{ left: `${position}%` }}
      />

      {/* ── Sürükleme kolu ── */}
      <motion.div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${position}%` }}
        animate={!hinted ? { x: [-8, 8, -8, 0] } : {}}
        transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          'border border-gold/50 bg-obsidian/80 backdrop-blur-sm',
          'shadow-gold-soft transition-all duration-200',
          dragging && 'scale-110 border-gold shadow-gold-glow'
        )}>
          <ArrowLeftRight size={14} className="text-gold" />
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Data with real image paths
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
    beforeSrc: `${IMAGE_BASE_URL}/uploads/checkins/Photo-1.png`,
    afterSrc:  `${IMAGE_BASE_URL}/uploads/checkins/Photo-2.png`,
  },
  {
    name:     'Selin M.',
    duration: '16 Hafta',
    plan:     'Profesyonel Paket',
    change:   '+7 kg Kas',
    badgeVariant: 'success' as const,
    rating:   5,
    quote:    '"Daha önce pek çok antrenörle çalıştım ama bu kadar bilimsel ve kişiselleştirilmiş bir program görmedim. 16 haftada formuma kavuştum."',
    beforeSrc: `${IMAGE_BASE_URL}/uploads/checkins/Photo-2-1.png`,
    afterSrc:  `${IMAGE_BASE_URL}/uploads/checkins/Photo-2-2.png`,
  },
  {
    name:     'Murat B.',
    duration: '8 Hafta',
    plan:     'Başlangıç Paketi',
    change:   '-12 kg',
    badgeVariant: 'gold' as const,
    rating:   5,
    quote:    '"Kısa sürede bu kadar sonuç alacağımı hiç tahmin etmezdim. Program çok pratik ve mobil uygulama sayesinde her yerde takip edebildim."',
    beforeSrc: `${IMAGE_BASE_URL}/uploads/checkins/Photo-3.png`,
    afterSrc:  '', // No "after" image for this story - shows gradient fallback
  },
];

/* ─────────────────────────────────────────────────────────
   Section
   ───────────────────────────────────────────────────────── */
export function TestimonialsSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section
      id="basarilar"
      ref={ref}
      className="relative overflow-hidden bg-obsidian-50 py-28 md:py-36"
    >
      {/* Dekoratif arka plan */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-3xl" />
      </div>

      <div className="section-padding relative mx-auto max-w-7xl">

        {/* ── Başlık ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-[10px] tracking-luxury uppercase text-gold/80">Başarı Hikayeleri</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl">
            Gerçek İnsanlar,{' '}
            <span className="text-gold-shimmer">Gerçek Sonuçlar</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ash-400 leading-relaxed">
            Danışanlarımızın yaşadığı dönüşümleri bizzat keşfedin.
            Kaydırarak öncesi ve sonrasını karşılaştırın.
          </p>
        </motion.div>

        {/* ── Hikaye grid ── */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STORIES.map((story, i) => (
            <motion.article
              key={story.name}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.14 }}
              className="group flex flex-col gap-5"
            >
              {/* Before/After Slider with real images */}
              <BeforeAfterSlider
                beforeSrc={story.beforeSrc}
                afterSrc={story.afterSrc}
              />

              {/* Kart içeriği */}
              <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-charcoal/50 p-5 transition-all duration-300 group-hover:border-gold/15">

                {/* Kişi + Değişim */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-white">{story.name}</p>
                    <p className="text-xs text-ash-500">{story.duration} · {story.plan}</p>
                  </div>
                  <Badge variant={story.badgeVariant} className="shrink-0 mt-0.5">
                    {story.change}
                  </Badge>
                </div>

                {/* Yıldızlar */}
                <div className="flex gap-0.5">
                  {Array.from({ length: story.rating }).map((_, idx) => (
                    <Star key={idx} size={12} className="fill-gold text-gold" />
                  ))}
                </div>

                {/* Alıntı */}
                <blockquote className="text-sm leading-relaxed text-ash-400 italic font-serif">
                  {story.quote}
                </blockquote>
              </div>
            </motion.article>
          ))}
        </div>

        {/* ── Alt istatistik bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-charcoal/30 p-6 md:grid-cols-4"
        >
          {[
            { val: '500+',  lbl: 'Dönüşüm Hikayesi' },
            { val: '%94',   lbl: 'Hedef Başarı Oranı' },
            { val: '4.9★',  lbl: 'Ortalama Değerlendirme' },
            { val: '12 Hf', lbl: 'Ortalama Sonuç Süresi' },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="flex flex-col items-center gap-1 text-center">
              <span className="font-display text-2xl font-bold text-gold md:text-3xl">{val}</span>
              <span className="text-[11px] tracking-widest uppercase text-ash-500">{lbl}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}