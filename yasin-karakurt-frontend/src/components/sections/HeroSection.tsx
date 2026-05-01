'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Animasyon varyantları ────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
};

/* ── Stat öğeleri ─────────────────────────────────────────── */
const STATS = [
  { value: '500+', label: 'Dönüşüm' },
  { value: '8+',   label: 'Yıl Deneyim' },
  { value: '%94',  label: 'Hedef Başarısı' },
];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian"
    >
      {/* ── Arka plan: katmanlı degradeler ──────────────── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        {/* Ana gradient — sağ üst köşeden altın parıltı */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(201,168,76,0.12)_0%,transparent_60%)]" />
        {/* Alt vinyeti */}
        <div className="absolute inset-0 bg-hero-gradient" />
        {/* Grid doku */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Büyük dekoratif daire */}
        <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full border border-gold/8 opacity-60" />
        <div className="absolute -right-64 -top-64 h-[800px] w-[800px] rounded-full border border-gold/5" />
      </motion.div>

      {/* ── İçerik ────────────────────────────────────── */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 section-padding mx-auto w-full max-w-7xl pt-32"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          {/* Üst etiket */}
          <motion.div variants={fadeIn} className="mb-8 flex items-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-[10px] tracking-luxury uppercase text-gold/80">
              Premium Personal Training
            </span>
          </motion.div>

          {/* Ana başlık */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl font-bold leading-[1.05] md:text-7xl lg:text-8xl"
          >
            <span className="block text-white">Sınırlarını</span>
            <span className="block text-gold-shimmer mt-1">Yeniden Çiz.</span>
          </motion.h1>

          {/* Alt başlık */}
          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-base leading-relaxed text-ash-400 md:text-lg"
          >
            Bilimsel antrenman metodolojisi ve kişiselleştirilmiş beslenme protokolleriyle
            vücudunu dönüştür. Her adım, seninle birlikte tasarlandı.
          </motion.p>

          {/* CTA butonları */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/uye-ol">
              <Button variant="gold" size="xl" className="group gap-3">
                Programı Keşfet
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </Link>
            <Link href="#hakkimda">
              <Button variant="gold-outline" size="xl">
                Beni Tanı
              </Button>
            </Link>
          </motion.div>

          {/* İstatistikler */}
          <motion.div
            variants={fadeUp}
            className="mt-16 flex flex-wrap gap-10 border-t border-white/8 pt-10"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-display text-3xl font-bold text-gold md:text-4xl">
                  {stat.value}
                </span>
                <span className="text-xs tracking-widest uppercase text-ash-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll göstergesi ─────────────────────────── */}
      <motion.div
        style={{ opacity }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-ash-500"
      >
        <span className="text-[9px] tracking-luxury uppercase">Keşfet</span>
        <ChevronDown size={16} />
      </motion.div>
    </section>
  );
}
