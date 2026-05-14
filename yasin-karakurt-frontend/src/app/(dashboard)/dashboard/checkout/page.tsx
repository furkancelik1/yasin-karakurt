'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, ArrowLeft, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const PLAN_LABELS: Record<string, { name: string; subtitle: string; features: string[] }> = {
  BASIC: {
    name: 'Başlangıç',
    subtitle: 'Temel dönüşüm paketi',
    features: [
      'Kişiselleştirilmiş antrenman programı',
      'Haftalık check-in (1×)',
      'Temel beslenme rehberi',
      'Uygulama erişimi (mobil & web)',
      'E-posta desteği',
      '7 gün ücretsiz deneme',
    ],
  },
  PREMIUM: {
    name: 'Profesyonel',
    subtitle: 'En çok tercih edilen plan',
    features: [
      'Kişiselleştirilmiş antrenman programı',
      'Haftalık check-in (2×)',
      'Detaylı beslenme & makro planı',
      'Öncelikli mesajlaşma (24s yanıt)',
      'Aylık program revizyonu',
      '7 gün ücretsiz deneme',
    ],
  },
  VIP: {
    name: 'VIP',
    subtitle: 'Sınırsız destek & hız',
    features: [
      'Kişiselleştirilmiş antrenman programı',
      'Günlük check-in & ilerleme takibi',
      'Tam beslenme & takviye protokolü',
      'Anlık mesajlaşma (7/24)',
      '2× Aylık birebir online seans',
      'Haftalık program optimizasyonu',
      '7 gün ücretsiz deneme',
    ],
  },
};

const PLAN_PRICES: Record<string, string> = {
  BASIC: '1.499',
  PREMIUM: '2.999',
  VIP: '4.999',
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const planParam = searchParams.get('plan')?.toUpperCase() ?? 'PREMIUM';
  const plan = PLAN_LABELS[planParam] ?? PLAN_LABELS.PREMIUM;
  const price = PLAN_PRICES[planParam] ?? PLAN_PRICES.PREMIUM;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/subscriptions/initialize', { plan: planParam });

      if (res.data.success && res.data.data?.paymentPageUrl) {
        toast.success('Ödeme sayfasına yönlendiriliyorsunuz...');
        window.location.href = res.data.data.paymentPageUrl;
      } else if (res.data.success && res.data.data?.checkoutFormContent) {
        toast.error('Ödeme formu oluşturulamadı. Lütfen tekrar deneyin.');
      } else {
        toast.error(res.data.message || 'Ödeme başlatılamadı.');
      }
    } catch (err: any) {
      console.error('ÖDEME HATASI:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Bağlantı hatası oluştu.';
      toast.error(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-obsidian px-4 py-10 md:py-16"
    >
      <div className="mx-auto max-w-2xl space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-ash/50 hover:text-gold transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Geri</span>
          </button>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/10 via-gold/30 to-gold/10" />
        </div>

        {/* ── Sipariş Özeti ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-gold/20 bg-charcoal/60 backdrop-blur-xl"
        >
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gold/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gold/[0.03] blur-3xl pointer-events-none" />

          <div className="relative p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={14} className="text-gold" />
              <span className="text-[10px] tracking-luxury uppercase text-gold/60">Sipariş Özeti</span>
            </div>

            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="space-y-1">
                <h1 className="font-display text-4xl font-bold text-white">{plan.name}</h1>
                <p className="text-ash/50 text-sm">{plan.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-4xl font-display font-bold text-white">₺{price}</p>
                <p className="text-ash/50 text-xs">/ aylık</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-gold/10 pt-6">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  <span className="text-sm text-ash-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-gold/5 border border-gold/10 p-4">
              <div className="flex items-center gap-2 text-xs text-ash/50">
                <ShieldCheck size={14} className="text-gold" />
                <span>256-bit SSL şifreleme ile korunan ödeme</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Ödeme Butonu ── */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={handlePayment}
          disabled={loading}
          className="w-full relative overflow-hidden rounded-2xl bg-gold px-8 py-5 font-display font-bold text-charcoal text-lg uppercase tracking-wider transition-all duration-300 hover:bg-gold/90 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="relative flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Güvenli Ödemeye Geç</span>
              </>
            )}
          </div>
        </motion.button>

        {/* ── Trust badges ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6"
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