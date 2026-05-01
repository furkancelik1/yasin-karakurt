'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ClipboardList, ScanLine, Zap, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    num:   '01',
    icon:  ClipboardList,
    title: 'Kayıt & Keşif',
    desc:  'Üyelik formunu doldur. Hedeflerini, geçmişini ve günlük rutinini paylaşarak süreci başlat.',
    highlight: 'Ücretsiz ilk görüşme',
  },
  {
    num:   '02',
    icon:  ScanLine,
    title: 'Analiz & Plan',
    desc:  'Beden ölçümlerin ve hareket analizi raporun hazırlanır. Sana özel antrenman ve beslenme planı çıkarılır.',
    highlight: 'Kişiselleştirilmiş protokol',
  },
  {
    num:   '03',
    icon:  Zap,
    title: 'Program Başlangıcı',
    desc:  'Haftalık antrenman ve beslenme programın paneline yüklenir. İstediğin zaman, istediğin yerden erişirsin.',
    highlight: 'Mobil & Web erişimi',
  },
  {
    num:   '04',
    icon:  BarChart3,
    title: 'Takip & Optimizasyon',
    desc:  'Haftalık check-in fotoğrafları ve ölçümlerle ilerleme izlenir. Her 4 haftada program optimize edilir.',
    highlight: 'Sürekli geri bildirim',
  },
];

export function ProcessSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section
      id="programlar"
      ref={ref}
      className="relative overflow-hidden bg-obsidian py-28 md:py-36"
    >
      {/* ── Dekoratif arka plan ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-gold/[0.04] blur-3xl" />
      </div>

      <div className="section-padding relative mx-auto max-w-7xl">
        {/* ── Başlık ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 max-w-2xl"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-[10px] tracking-luxury uppercase text-gold/80">Sistem Nasıl İşler?</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl">
            4 Adımda <span className="text-gold-shimmer">Dönüşüm</span>
          </h2>
          <p className="mt-4 text-ash-400 leading-relaxed">
            Belirsizlik yok, gereksiz karmaşa yok. Nereden başlayacağını bilemeyenlere
            sade ve etkili bir yol haritası sunuyoruz.
          </p>
        </motion.div>

        {/* ── Adım kartları ── */}
        <div className="relative">
          {/* Bağlayıcı çizgi — sadece desktop'ta görünür */}
          <div
            className="absolute left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] top-11 hidden h-px lg:block"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25) 15%, rgba(201,168,76,0.25) 85%, transparent)',
            }}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.12 }}
                className="group relative flex flex-col"
              >
                {/* Numara dairesi */}
                <div className="relative z-10 mb-6 flex h-[88px] w-[88px] items-center justify-center self-center rounded-full border border-gold/20 bg-obsidian transition-all duration-500 group-hover:border-gold/50 group-hover:shadow-gold-glow lg:self-start">
                  <step.icon size={22} className="text-gold/70 transition-colors duration-300 group-hover:text-gold" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-obsidian">
                    {step.num}
                  </span>
                </div>

                {/* İçerik */}
                <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-white/5 bg-charcoal/40 p-6 transition-all duration-300 group-hover:border-gold/15 group-hover:bg-charcoal/60 lg:min-h-[220px]">
                  <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-ash-400">{step.desc}</p>
                  <div className="mt-2 inline-flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gold" />
                    <span className="text-[11px] font-medium text-gold/80">{step.highlight}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Alt CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-sm text-ash-500">
            Tüm paketlerde ilk 7 gün ücretsiz deneme dahildir.
          </p>
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-gold/30" />
            <span className="text-xs tracking-luxury uppercase text-gold/60">Aşağıda paketleri incele</span>
            <span className="h-px w-12 bg-gold/30" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
