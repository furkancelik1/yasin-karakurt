'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id:       'basic',
    name:     'Başlangıç',
    subtitle: 'Temel dönüşüm paketi',
    price:    '1.499',
    period:   'ay',
    badge:    null,
    featured: false,
    cta:      'Başla',
    features: [
      'Kişiselleştirilmiş antrenman programı',
      'Haftalık check-in (1×)',
      'Temel beslenme rehberi',
      'Uygulama erişimi (mobil & web)',
      'E-posta desteği',
      '7 gün ücretsiz deneme',
    ],
    locked: [
      'Birebir online seans',
      'Öncelikli mesajlaşma',
    ],
  },
  {
    id:       'premium',
    name:     'Profesyonel',
    subtitle: 'En çok tercih edilen plan',
    price:    '2.999',
    period:   'ay',
    badge:    'En Çok Tercih Edilen',
    featured: true,
    cta:      'Hemen Başla',
    features: [
      'Kişiselleştirilmiş antrenman programı',
      'Haftalık check-in (2×)',
      'Detaylı beslenme & makro planı',
      'Uygulama erişimi (mobil & web)',
      'Öncelikli mesajlaşma (24s yanıt)',
      'Aylık program revizyonu',
      '7 gün ücretsiz deneme',
    ],
    locked: [
      'Birebir online seans',
    ],
  },
  {
    id:       'vip',
    name:     'VIP',
    subtitle: 'Sınırsız destek & hız',
    price:    '4.999',
    period:   'ay',
    badge:    null,
    featured: false,
    cta:      'VIP Ol',
    features: [
      'Kişiselleştirilmiş antrenman programı',
      'Günlük check-in & ilerleme takibi',
      'Tam beslenme & takviye protokolü',
      'Uygulama erişimi (mobil & web)',
      'Anlık mesajlaşma (7/24)',
      '2× Aylık birebir online seans',
      'Haftalık program optimizasyonu',
      'Yağ analizi & ölçüm raporu',
      '7 gün ücretsiz deneme',
    ],
    locked: [],
  },
];

export function PricingSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <section
      id="fiyatlar"
      ref={ref}
      className="relative overflow-hidden bg-charcoal-200 py-28 md:py-36"
    >
      {/* ── Dekoratif arka plan ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute -left-24 bottom-1/3 h-[500px] w-[500px] rounded-full bg-gold/[0.04] blur-3xl" />
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-gold/[0.03] blur-3xl" />
      </div>

      <div className="section-padding relative mx-auto max-w-7xl">
        {/* ── Başlık ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            <span className="text-[10px] tracking-luxury uppercase text-gold/80">Paketler</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl">
            Sana Uygun <span className="text-gold-shimmer">Paketi</span> Seç
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ash-400 leading-relaxed">
            Tüm paketlerde 7 günlük ücretsiz deneme hakkı mevcuttur.
            İstediğin zaman, herhangi bir ücret ödemeden iptal edebilirsin.
          </p>
        </motion.div>

        {/* ── Kart grid ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.13 }}
              className={cn('relative', plan.featured && 'md:-mt-4 md:mb-[-16px]')}
            >
              {/* Featured glow */}
              {plan.featured && (
                <div className="absolute -inset-px rounded-lg bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />
              )}

              <Card
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden transition-all duration-500',
                  plan.featured
                    ? 'border-gold/30 bg-charcoal shadow-gold-soft hover:shadow-gold-glow'
                    : 'border-white/5 bg-obsidian/60 hover:border-gold/20 hover:bg-obsidian/80'
                )}
              >
                {/* İç parıltı — hover'da belirginleşir */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(201,168,76,0.06),transparent)]" />
                </div>

                <CardHeader className="relative gap-4 pb-4">
                  {/* Badge */}
                  <div className="flex items-center justify-between">
                    {plan.badge ? (
                      <Badge variant="gold" className="gap-1.5">
                        <Sparkles size={9} />
                        {plan.badge}
                      </Badge>
                    ) : (
                      <span />
                    )}
                  </div>

                  {/* İsim & fiyat */}
                  <div>
                    <CardTitle className={cn('text-2xl', plan.featured ? 'text-gold' : 'text-white')}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{plan.subtitle}</CardDescription>
                  </div>

                  <div className="flex items-end gap-1.5 border-t border-white/5 pt-4">
                    <span className="font-display text-4xl font-bold text-white">
                      ₺{plan.price}
                    </span>
                    <span className="mb-1.5 text-sm text-ash-500">/ {plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="relative flex flex-1 flex-col gap-6">
                  {/* Özellik listesi */}
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
                          <Check size={9} className="text-gold" strokeWidth={3} />
                        </span>
                        <span className="text-sm text-ash-300">{f}</span>
                      </li>
                    ))}
                    {plan.locked.map((f) => (
                      <li key={f} className="flex items-start gap-3 opacity-35">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-white/10">
                          <span className="h-0.5 w-2 rounded-full bg-ash-500" />
                        </span>
                        <span className="text-sm text-ash-500 line-through decoration-ash-600">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA butonu — en alta itilir */}
                  <div className="mt-auto pt-2">
                    <Link href={`/register?plan=${plan.id}`} className="block w-full">
                      <Button
                        variant={plan.featured ? 'gold' : 'gold-outline'}
                        size="lg"
                        className="w-full"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                    <p className="mt-3 text-center text-[11px] text-ash-600">
                      7 gün ücretsiz · İstediğin zaman iptal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Alt not ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-12 text-center text-sm text-ash-600"
        >
          Tüm fiyatlara KDV dahildir. Ödeme Iyzico güvencesiyle gerçekleşir.
        </motion.p>
      </div>
    </section>
  );
}
