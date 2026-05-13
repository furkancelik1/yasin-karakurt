'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

/* ── Zod şeması ─────────────────────────────────── */
const schema = z.object({
  email:    z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre boş bırakılamaz'),
});
type FormValues = z.infer<typeof schema>;

/* ── Bileşen ────────────────────────────────────── */
export function LoginForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const [showPw, setShowPw]  = useState(false);

  const redirect = searchParams.get('redirect');
  const defaultDestination = redirect || '/dashboard';

  const form = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Hoş geldin! Yönlendiriliyorsun...');

      const plan = searchParams.get('plan');
      if (plan) {
        router.push(`/dashboard/checkout?plan=${plan.toUpperCase()}`);
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? 'Giriş başarısız';
        if (err.response?.status === 401) {
          form.setError('password', { message: msg });
        } else {
          toast.error(msg);
        }
      } else {
        toast.error('Bağlantı hatası. Lütfen tekrar dene.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glass kart */}
      <div className="rounded-2xl border border-white/8 bg-charcoal/50 p-8 shadow-dark-card backdrop-blur-xl">

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Tekrar Hoş Geldin</h1>
          <p className="mt-1.5 text-sm text-ash-500">Hesabına giriş yap ve programına devam et.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

            {/* E-posta */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="ornek@email.com"
                      autoComplete="email"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Şifre */}
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Şifre</FormLabel>
                    <Link
                      href="/sifremi-unuttum"
                      className="text-[11px] text-ash-500 hover:text-gold transition-colors duration-200"
                    >
                      Şifremi Unuttum
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={!!fieldState.error}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ash-500 hover:text-ash-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className={cn('mt-2 w-full', isLoading && 'opacity-70 pointer-events-none')}
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Giriş Yapılıyor...</>
              ) : 'Giriş Yap'}
            </Button>
          </form>
        </Form>

        {/* Ayraç */}
        <div className="my-6 flex items-center gap-4">
          <span className="flex-1 h-px bg-white/6" />
          <span className="text-[11px] text-ash-600 uppercase tracking-widest">veya</span>
          <span className="flex-1 h-px bg-white/6" />
        </div>

        {/* Kayıt linki */}
        <p className="text-center text-sm text-ash-500">
          Hesabın yok mu?{' '}
          <Link href="/register" className="font-medium text-gold hover:text-gold-200 transition-colors duration-200">
            Ücretsiz Dene
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
