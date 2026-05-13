'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';

const PLANS = [
  { id: 'BASIC',    name: 'Başlangıç',   price: '1.499', featured: false },
  { id: 'PREMIUM',  name: 'Profesyonel', price: '2.999', featured: true  },
  { id: 'VIP',      name: 'VIP',         price: '4.999', featured: false },
];

const PLAN_LABELS: Record<string, { name: string; subtitle: string; price: string }> = {
  BASIC:    { name: 'Başlangıç',   subtitle: 'Temel dönüşüm paketi',     price: '1.499' },
  PREMIUM:  { name: 'Profesyonel', subtitle: 'En çok tercih edilen plan', price: '2.999' },
  VIP:     { name: 'VIP',         subtitle: 'Sınırsız destek & hız',      price: '4.999' },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formContent, setFormContent] = useState<string | null>(null);

  const planParam = searchParams.get('plan')?.toUpperCase() ?? 'PREMIUM';
  const plan = PLAN_LABELS[planParam] ?? PLAN_LABELS.PREMIUM;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const initCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.post('/subscriptions/initialize', { plan: planParam });

        if (res.data.success) {
          const { checkoutFormContent, paymentPageUrl } = res.data.data || {};

          if (paymentPageUrl) {
            window.location.href = paymentPageUrl;
            return;
          }

          if (checkoutFormContent) {
            setFormContent(checkoutFormContent);
            setLoading(false);
          } else {
            setError('Ödeme formu bulunamadı. Lütfen tekrar deneyin.');
            setLoading(false);
          }
        } else {
          setError(res.data.message || 'Ödeme başlatılamadı.');
          setLoading(false);
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Bağlantı hatası oluştu.';
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
      }
    };

    initCheckout();
  }, [authLoading, user, planParam, router]);

  useEffect(() => {
    if (formContent) {
      if (typeof window !== 'undefined') {
        (window as any).iyziInit = undefined;
      }

      const container = document.getElementById('iyzipay-checkout-form');
      if (container) {
        container.innerHTML = '';
        const fragment = document.createRange().createContextualFragment(formContent);
        container.appendChild(fragment);
      }
    }
  }, [formContent]);

  const pageVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-obsidian px-4 py-10 md:py-16"
    >
      <div className="mx-auto max-w-2xl space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-ash/50 hover:text-gold transition-colors group"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="text-sm font-medium">Geri</span>
          </button>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/10 via-gold/30 to-gold/10" />
        </div>

        {/* ── Plan selector tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl border border-gold/20 bg-charcoal/60 p-1.5"
        >
          <div className="absolute inset-0 rounded-2xl bg-gold/[0.03] pointer-events-none" />
          <div className="relative flex gap-1">
            {PLANS.map((p) => {
              const isActive = planParam === p.id;
              const label = PLAN_LABELS[p.id];

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (loading || isActive) return;
                    router.push(`/dashboard/checkout?plan=${p.id}`, { scroll: false });
                  }}
                  className={`
                    flex-1 flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-300 relative
                    ${isActive
                      ? 'bg-gold/15 border border-gold/30 shadow-[0_0_20px_rgba(201,168,76,0.15)]'
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePlan"
                      className="absolute inset-0 rounded-xl bg-gold/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative flex flex-col items-center gap-1">
                    <span className={`
                      font-display text-sm font-bold tracking-wide transition-colors duration-300
                      ${isActive ? 'text-gold' : 'text-ash/50'}
                    `}>
                      {p.name}
                    </span>
                    <span className={`
                      text-xs transition-colors duration-300
                      ${isActive ? 'text-gold/80' : 'text-ash-500'}
                    `}>
                      ₺{label.price}/ay
                    </span>
                  </div>
                  {p.featured && (
                    <span className={`
                      absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 rounded-full
                      ${isActive ? 'bg-gold text-charcoal' : 'bg-gold/20 text-gold/60'}
                    `}>
                      Popüler
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Plan info card ── */}
        <div className="relative rounded-3xl border border-gold/20 bg-charcoal/60 backdrop-blur-xl p-8 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gold/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gold/[0.03] blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                <span className="text-[10px] tracking-luxury uppercase text-gold/60">
                  Seçilen Plan
                </span>
              </div>
              <h1 className="font-display text-4xl font-bold text-white">
                {plan.name}
              </h1>
              <div className="text-ash/50 text-sm mt-1">{plan.subtitle}</div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-4xl font-display font-bold text-white">₺{plan.price}</div>
              <div className="text-ash/50 text-xs">/ aylık</div>
            </div>
          </div>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-charcoal/50 backdrop-blur p-12 text-center space-y-6"
          >
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
                <CreditCard
                  size={24}
                  className="absolute inset-0 m-auto text-gold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl text-white">Lütfen Bekleyin</h2>
              <div className="text-ash/50 text-sm">
                Ödeme formu hazırlanıyor, Iyzico güvencesiyle güvenli ödeme ekranına yönlendirileceksiniz.
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-ash/40">
              <ShieldCheck size={14} className="text-gold" />
              <span>256-bit SSL şifreleme ile korunan ödeme</span>
            </div>
          </motion.div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-red-500/20 bg-red-500/10 backdrop-blur p-8 text-center"
          >
            <p className="text-red-300 font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors text-sm font-medium"
            >
              Tekrar Dene
            </button>
          </motion.div>
        )}

        {/* ── Iyzico checkout form ── */}
        {formContent && !loading && (
          <motion.div
            key={planParam}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-3xl border border-gold/15 bg-charcoal/40 backdrop-blur overflow-hidden"
          >
            <div className="border-b border-gold/10 px-6 py-4 flex items-center gap-3">
              <ShieldCheck size={16} className="text-gold" />
              <span className="text-xs tracking-widest uppercase text-ash/50 font-bold">
                Iyzico Güvenli Ödeme
              </span>
            </div>
            <div className="w-full">
              <div id="iyzipay-checkout-form" className="w-full min-h-[600px]" />
            </div>
          </motion.div>
        )}

        {/* ── Trust badges ── */}
        {formContent && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 pt-4"
          >
            {[
              { icon: ShieldCheck, text: 'SSL Korumalı' },
              { icon: CreditCard, text: 'Visa / Mastercard' },
              { icon: CheckCircle2, text: '7 Gün Ücretsiz İptal' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-ash/40">
                <Icon size={14} className="text-gold/50" />
                <span className="text-xs">{text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}