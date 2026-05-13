'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
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
const schema = z
  .object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    lastName:  z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    email:     z.string().email('Geçerli bir e-posta adresi girin'),
    password:  z
      .string()
      .min(8, 'En az 8 karakter')
      .regex(/[A-Z]/, 'En az bir büyük harf')
      .regex(/[0-9]/, 'En az bir rakam'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path:    ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

/* ── Şifre gücü göstergesi ───────────────────────── */
function PasswordStrength({ value }: { value: string }) {
  const checks = [
    { label: '8+ karakter',  pass: value.length >= 8 },
    { label: 'Büyük harf',   pass: /[A-Z]/.test(value) },
    { label: 'Rakam',        pass: /[0-9]/.test(value) },
  ];
  if (!value) return null;
  return (
    <div className="mt-2 flex gap-4">
      {checks.map(({ label, pass }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn(
            'flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors duration-200',
            pass ? 'bg-gold/20' : 'bg-white/5'
          )}>
            <Check size={8} className={cn('transition-colors', pass ? 'text-gold' : 'text-ash-600')} strokeWidth={3} />
          </div>
          <span className={cn('text-[10px] transition-colors', pass ? 'text-ash-300' : 'text-ash-600')}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Bileşen ────────────────────────────────────── */
export function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading } = useAuth();
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);

  const redirect = searchParams.get('redirect');
  const plan = searchParams.get('plan');
  const defaultDestination = redirect || '/dashboard';

  const form = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const pwValue = form.watch('password');

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser({
        firstName: values.firstName,
        lastName:  values.lastName,
        email:     values.email,
        password:  values.password,
      });
      toast.success('Hesabın oluşturuldu! Hoş geldin 🎉');

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
        const msg    = err.response?.data?.message ?? 'Kayıt başarısız';
        const status = err.response?.status;
        if (status === 409) {
          form.setError('email', { message: 'Bu e-posta adresi zaten kayıtlı' });
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
      <div className="rounded-2xl border border-white/8 bg-charcoal/50 p-8 shadow-dark-card backdrop-blur-xl">

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Hesap Oluştur</h1>
          <p className="mt-1.5 text-sm text-ash-500">
            7 gün ücretsiz dene. Kredi kartı gerekmez.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

            {/* Ad & Soyad — yan yana */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ahmet" autoComplete="given-name" error={!!fieldState.error} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Yılmaz" autoComplete="family-name" error={!!fieldState.error} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* E-posta */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="ornek@email.com" autoComplete="email" error={!!fieldState.error} />
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
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
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
                  <PasswordStrength value={pwValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Şifre tekrar */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Şifre Tekrar</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={!!fieldState.error}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCPw((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ash-500 hover:text-ash-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gizlilik notu */}
            <p className="text-[11px] leading-relaxed text-ash-600">
              Devam ederek{' '}
              <Link href="/kosullar" className="text-ash-400 hover:text-gold transition-colors">Kullanım Şartları</Link>
              {' '}ve{' '}
              <Link href="/gizlilik" className="text-ash-400 hover:text-gold transition-colors">Gizlilik Politikası</Link>
              'nı kabul etmiş olursun.
            </p>

            {/* Submit */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className={cn('mt-1 w-full', isLoading && 'opacity-70 pointer-events-none')}
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Hesap Oluşturuluyor...</>
              ) : 'Ücretsiz Dene — 7 Gün'}
            </Button>
          </form>
        </Form>

        {/* Ayraç */}
        <div className="my-6 flex items-center gap-4">
          <span className="flex-1 h-px bg-white/6" />
          <span className="text-[11px] text-ash-600 uppercase tracking-widest">zaten üye?</span>
          <span className="flex-1 h-px bg-white/6" />
        </div>

        <p className="text-center text-sm text-ash-500">
          <Link href="/login" className="font-medium text-gold hover:text-gold-200 transition-colors duration-200">
            Giriş Yap
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
