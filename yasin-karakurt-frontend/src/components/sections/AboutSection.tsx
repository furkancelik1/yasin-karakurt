'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, TrendingUp, Dumbbell } from 'lucide-react';

const CREDENTIALS = [
  { icon: Award,      label: 'NASM Sertifikalı',          sub: 'Kişisel Antrenör'            },
  { icon: Users,      label: '500+ Danışan',               sub: 'Başarıyla Dönüştürüldü'      },
  { icon: TrendingUp, label: '%94 Hedef Başarısı',         sub: 'Kanıtlanmış Metodoloji'      },
  { icon: Dumbbell,   label: '8+ Yıl Deneyim',             sub: 'Elite & Amatör Sporcular'    },
];

/* ── Yeniden kullanılabilir animasyon factory ── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
});

const fadeLeft = (delay = 0) => ({
  hidden: { opacity: 0, x: -48 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
});

const fadeRight = (delay = 0) => ({
  hidden: { opacity: 0, x: 48 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
});

export function AboutSection() {
  const ref   = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const anim  = inView ? 'show' : 'hidden';

  return (
    <section
      id="hakkimda"
      ref={ref}
      className="relative overflow-hidden bg-charcoal-200 py-28 md:py-36"
    >
      {/* ── Dekoratif arka plan ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gold/[0.04] blur-3xl" />
        <div className="absolute right-0 top-0 h-px w-1/2 bg-gradient-to-l from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="section-padding relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* ── Sol: görsel kutu ── */}
          <motion.div
            variants={fadeLeft(0)}
            initial="hidden"
            animate={anim}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Görsel çerçeve */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-gold/15 shadow-dark-card">
              {/* Placeholder gradient — gerçek fotoğraf ile değiştirilecek */}
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50 via-charcoal-200 to-obsidian" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_40%_30%,rgba(201,168,76,0.12),transparent)]" />

              {/* İsim etiketi */}
              <div className="absolute bottom-6 left-6 right-6 glass-dark rounded-xl p-4">
                <p className="font-display text-lg font-bold text-white">Yasin Karakurt</p>
                <p className="mt-0.5 text-xs tracking-luxury uppercase text-gold/80">
                  Personal Trainer & Nutrition Coach
                </p>
              </div>

              {/* Yıl badge */}
              <div className="absolute right-5 top-5 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-gold/30 bg-obsidian/70 backdrop-blur-sm">
                <span className="font-display text-lg font-bold leading-none text-gold">8+</span>
                <span className="text-[8px] tracking-widest text-ash-500">YIL</span>
              </div>
            </div>

            {/* Dekoratif çizgi */}
            <div className="absolute -bottom-6 -right-6 h-3/4 w-3/4 rounded-2xl border border-gold/8" />
          </motion.div>

          {/* ── Sağ: metin içeriği ── */}
          <div className="flex flex-col gap-8">
            {/* Başlık grubu */}
            <motion.div variants={fadeRight(0.1)} initial="hidden" animate={anim} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gold/50" />
                <span className="text-[10px] tracking-luxury uppercase text-gold/80">Hakkımda</span>
              </div>
              <h2 className="font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl">
                Sonuç Odaklı<br />
                <span className="text-gold-shimmer">Bir Vizyon</span>
              </h2>
            </motion.div>

            {/* Paragraflar */}
            <motion.div variants={fadeUp(0.2)} initial="hidden" animate={anim} className="space-y-4 text-ash-400 leading-relaxed">
              <p>
                Her beden farklıdır; her hedef benzersizdir. Bu gerçekten hareketle,
                bilimsel antrenman metodolojisini bireysel ihtiyaçlarla harmanlayan
                bir sistem geliştirdim.
              </p>
              <p>
                NASM sertifikalı antrenman protokolleri ve kanıta dayalı beslenme
                stratejileriyle, danışanlarımın %94'ü hedeflerine ortalama 12 hafta
                içinde ulaşıyor.
              </p>
              <p className="text-ash-300 font-medium">
                Amacım bir rakam değil, sürdürülebilir bir yaşam tarzı inşa etmek.
              </p>
            </motion.div>

            {/* Ayraç */}
            <motion.div variants={fadeUp(0.25)} initial="hidden" animate={anim}>
              <div className="h-px w-full bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
            </motion.div>

            {/* Credential grid */}
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
              initial="hidden"
              animate={anim}
              className="grid grid-cols-2 gap-4"
            >
              {CREDENTIALS.map(({ icon: Icon, label, sub }) => (
                <motion.div
                  key={label}
                  variants={fadeUp(0)}
                  className="group flex items-start gap-3 rounded-xl border border-white/5 bg-obsidian/60 p-4 transition-all duration-300 hover:border-gold/25 hover:bg-obsidian/80"
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gold/20 bg-gold/5 transition-colors duration-300 group-hover:border-gold/40 group-hover:bg-gold/10">
                    <Icon size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ash-100">{label}</p>
                    <p className="text-xs text-ash-500">{sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
