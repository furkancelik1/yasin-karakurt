'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRUST_ITEMS = [
  { icon: Shield, text: '7 Gün Ücretsiz Deneme'     },
  { icon: Zap,    text: 'Anında Program Erişimi'     },
  { icon: Clock,  text: 'İstediğin Zaman İptal'      },
];

export function CtaSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section
      id="iletisim"
      ref={ref}
      className="relative overflow-hidden bg-obsidian py-28 md:py-40"
    >
      {/* ── Katmanlı arka plan ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        {/* Merkez altın parıltı */}
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.07] blur-[100px]" />
        {/* Üst kenar çizgisi */}
        <div className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        {/* Sol + sağ vinyeti */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,transparent_30%,rgba(10,10,10,0.95)_100%)]" />
        {/* İnce ızgara dokusu */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      <div className="section-padding relative z-10 mx-auto max-w-4xl text-center">

        {/* ── Üst etiket ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="h-px w-10 bg-gold/50" />
          <span className="text-[10px] tracking-luxury uppercase text-gold/80">
            Harekete Geç
          </span>
          <span className="h-px w-10 bg-gold/50" />
        </motion.div>

        {/* ── Ana başlık ── */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="font-display text-5xl font-bold leading-[1.05] text-white md:text-6xl lg:text-7xl"
        >
          Değişime{' '}
          <br className="hidden sm:block" />
          <span className="text-gold-shimmer">Bugün Başla.</span>
        </motion.h2>

        {/* ── Alt metin ── */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ash-400 md:text-lg"
        >
          Her geçen gün hedefine bir gün daha uzaksın. İlk adımı atmak
          için mükemmel zamanı bekleme — mükemmel zaman şimdi.
        </motion.p>

        {/* ── CTA butonları ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/uye-ol">
            <Button variant="gold" size="xl" className="group w-full gap-3 sm:w-auto">
              Paketi Seç & Başla
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#iletisim">
            <Button variant="gold-outline" size="xl" className="w-full sm:w-auto">
              Önce Soru Sor
            </Button>
          </Link>
        </motion.div>

        {/* ── Güven öğeleri ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {TRUST_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-ash-500">
              <Icon size={14} className="text-gold/60" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Dekoratif alt çizgi ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mx-auto mt-16 h-px w-40 origin-center bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-4 text-[11px] tracking-luxury uppercase text-ash-600"
        >
          Yasin Karakurt · Premium Personal Training
        </motion.p>
      </div>
    </section>
  );
}
