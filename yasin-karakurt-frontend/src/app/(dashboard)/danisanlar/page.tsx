'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  UserPlus,
  AlertTriangle,
  Dumbbell,
  Utensils,
  FileText,
  Upload,
  Send,
  Beef,
  Croissant,
  Droplets,
  Calculator,
  Clock,
  Trash,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterValue       = 'ALL' | 'ACTIVE' | 'PASSIVE' | 'NEW';
type SubscriptionPlan   = 'BASIC' | 'PREMIUM' | 'VIP';
type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED';

interface ClientUser {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    fitnessGoal?: string | null;
  } | null;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    endDate?: string | null;
  } | null;
}

// ── Config ────────────────────────────────────────────────────────────────────
const PLAN_CFG: Record<SubscriptionPlan, { label: string; cls: string }> = {
  BASIC:   { label: 'Basic',   cls: 'text-ash/70 bg-white/5 border-white/10'          },
  PREMIUM: { label: 'Premium', cls: 'text-sky-300 bg-sky-500/10 border-sky-500/20'    },
  VIP:     { label: 'VIP',     cls: 'text-gold bg-gold/10 border-gold/20'             },
};

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Tümü',  value: 'ALL'     },
  { label: 'Aktif', value: 'ACTIVE'  },
  { label: 'Pasif', value: 'PASSIVE' },
  { label: 'Yeni',  value: 'NEW'     },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 864e5);
}

function applyFilter(
  clients: ClientUser[],
  filter: FilterValue,
  search: string,
): ClientUser[] {
  const q = search.toLowerCase().trim();

  return clients.filter((c) => {
    const matchSearch =
      !q ||
      [c.profile?.firstName, c.profile?.lastName, c.email, c.profile?.fitnessGoal]
        .join(' ')
        .toLowerCase()
        .includes(q);

    const matchFilter = (() => {
      if (filter === 'ACTIVE')  return c.isActive && c.subscription?.status === 'ACTIVE';
      if (filter === 'PASSIVE') return !c.isActive || c.subscription?.status !== 'ACTIVE';
      if (filter === 'NEW') {
        const ago = new Date();
        ago.setDate(ago.getDate() - 30);
        return new Date(c.createdAt) > ago;
      }
      return true;
    })();

    return matchSearch && matchFilter;
  });
}

// ── ClientRow ─────────────────────────────────────────────────────────────────
const ClientRow = React.forwardRef<HTMLDivElement, {
  client: ClientUser;
  onView: () => void;
  onAssignProgram: () => void;
}>(({ client, onView, onAssignProgram }, ref) => {
  const name    = client.profile
    ? `${client.profile.firstName} ${client.profile.lastName}`
    : client.email;
  const initial = (client.profile?.firstName?.[0] ?? client.email[0]).toUpperCase();
  const days    = daysUntil(client.subscription?.endDate);
  const expiringSoon = days !== null && days >= 0 && days <= 7;
  const expired      = days !== null && days < 0;

  const plan    = client.subscription?.plan;
  const planCfg = plan ? PLAN_CFG[plan] : null;

  const endStr = client.subscription?.endDate
    ? new Date(client.subscription.endDate).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr_auto] md:gap-4 md:items-center md:px-6 md:py-4 md:border-b md:border-white/5 md:last:border-0 md:hover:bg-white/[0.025] md:transition-colors group
        block w-full p-4 mb-3 rounded-2xl bg-charcoal/40 border border-white/5"
    >
      {/* Avatar + Name - Always visible */}
      <div className="flex items-center gap-3 min-w-0 mb-3 md:mb-0">
        <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 font-display font-bold text-gold text-lg md:text-sm">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-white font-display font-medium text-base md:text-sm uppercase tracking-wide truncate leading-none">
            {name}
          </p>
          <p className="text-ash/40 text-sm md:text-xs mt-1 truncate">{client.email}</p>
        </div>
      </div>

      {/* Goal - Desktop only */}
      <p className="text-ash/55 text-sm font-light truncate hidden md:block">
        {client.profile?.fitnessGoal ?? (
          <span className="text-ash/25 italic text-xs">Belirtilmedi</span>
        )}
      </p>

      {/* Plan badge - Desktop only */}
      <div className="hidden md:block">
        {planCfg ? (
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${planCfg.cls}`}>
            {planCfg.label}
          </span>
        ) : (
          <span className="text-ash/25 text-xs italic">—</span>
        )}
      </div>

      {/* Subscription end date - Desktop only */}
      <div className="hidden md:flex items-center gap-1.5">
        {endStr ? (
          <>
            {(expiringSoon || expired) && (
              <AlertTriangle
                size={13}
                className={expired ? 'text-rose-500' : 'text-rose-400 animate-pulse'}
              />
            )}
            <span
              className={[
                'text-sm font-medium',
                expired
                  ? 'text-rose-500'
                  : expiringSoon
                    ? 'text-rose-400 [text-shadow:0_0_10px_rgba(251,113,133,0.55)]'
                    : 'text-ash/55',
              ].join(' ')}
            >
              {endStr}
              {expiringSoon && !expired && (
                <span className="ml-1 text-rose-400/70 text-xs font-bold">({days}g)</span>
              )}
              {expired && (
                <span className="ml-1 text-rose-500/60 text-xs italic"> · sona erdi</span>
              )}
            </span>
          </>
        ) : (
          <span className="text-ash/25 text-xs italic">—</span>
        )}
      </div>

      {/* Mobile: Show goal, plan, date as info row */}
      <div className="md:hidden flex flex-wrap gap-2 mb-3">
        {planCfg && (
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${planCfg.cls}`}>
            {planCfg.label}
          </span>
        )}
        {endStr && (
          <span className={`text-xs ${expired ? 'text-rose-500' : expiringSoon ? 'text-rose-400' : 'text-ash/50'}`}>
            Bitiş: {endStr}
          </span>
        )}
      </div>

      {/* Actions - Always visible on mobile, hover on desktop */}
      <div className="flex items-center gap-2 md:gap-1.5 justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 mt-3 md:mt-0">
        <button
          onClick={onView}
          title="İncele"
          className="p-3 md:p-2 rounded-lg text-ash/50 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={onAssignProgram}
          title="Program Yaz"
          className="p-3 md:p-2 rounded-lg text-ash/50 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center"
        >
<Plus size={18} />
        </button>
      </div>
    </motion.div>
  );
});

ClientRow.displayName = 'ClientRow';

// ── QuickAssignModal ────────────────────────────────────────────────────────────
function QuickAssignModal({
  clientId,
  clientName,
  onClose,
}: {
  clientId: string;
  clientName: string;
  onClose: () => void;
}) {
  const [programType, setProgramType] = useState<'TRAINING' | 'NUTRITION'>('TRAINING');
  const [contentType, setContentType] = useState<'TEXT' | 'FILE'>('TEXT');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      customCalories: false,
      targetCalories: 0,
      content: '',
      meals: [
        { name: '', content: '', time: '08:00' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'meals',
  });

  const protein = watch('protein') || 0;
  const carbs = watch('carbs') || 0;
  const fat = watch('fat') || 0;
  const customCalories = watch('customCalories');
  const targetCalories = watch('targetCalories') || 0;
  const content = watch('content') || '';
  const meals = watch('meals') || [];

  const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;
  const displayCalories = customCalories ? targetCalories : calculatedCalories;

  useEffect(() => {
    if (!customCalories) {
      setValue('targetCalories', calculatedCalories);
    }
  }, [protein, carbs, fat, customCalories, calculatedCalories, setValue]);

  const handleSubmitForm = async (data: any) => {
    if (!data.title.trim()) {
      toast.error('Lütfen bir başlık girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (programType === 'NUTRITION') {
        await api.post('/nutrition/plan', {
          userId: clientId,
          title: data.title,
          targetCalories: displayCalories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          meals: data.meals.filter((m: any) => m.name && m.content).map((m: any, i: number) => ({
            name: m.name,
            content: m.content,
            time: m.time,
            order: i,
          })),
        });
      } else {
        const formData = new FormData();
        formData.append('userId', clientId);
        formData.append('type', programType);
        formData.append('title', data.title);
        formData.append('contentType', contentType);
        
        if (contentType === 'TEXT') {
          formData.append('content', data.content);
        } else if (file) {
          formData.append('file', file);
        }

        await api.post('/programs/assign', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(`${clientName} için ${programType === 'TRAINING' ? 'antrenman' : 'beslenme'} programı atandı.`);
      onClose();
    } catch (error) {
      toast.error('Program atama işlemi başarısız.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-charcoal border border-gold/20 rounded-3xl p-4 md:p-6 w-full max-w-lg max-h-[95vh] overflow-y-auto space-y-4 md:space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${programType === 'TRAINING' ? 'bg-gold/10 border border-gold/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
              {programType === 'TRAINING' ? (
                <Dumbbell size={20} className="text-gold" />
              ) : (
                <Utensils size={20} className="text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-white font-display uppercase tracking-wide">
                Program Atama
              </h3>
              <p className="text-ash/50 text-xs">{clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-ash/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-ash/70 text-xs font-bold uppercase tracking-wider mb-2 block">Program Türü</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProgramType('TRAINING')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  programType === 'TRAINING'
                    ? 'bg-gold/10 text-gold border-gold/30'
                    : 'bg-transparent text-ash/50 border-white/10 hover:border-white/20'
                }`}
              >
                <Dumbbell size={14} className="inline mr-2" /> Antrenman
              </button>
              <button
                type="button"
                onClick={() => setProgramType('NUTRITION')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  programType === 'NUTRITION'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-transparent text-ash/50 border-white/10 hover:border-white/20'
                }`}
              >
                <Utensils size={14} className="inline mr-2" /> Beslenme
              </button>
            </div>
          </div>

          <div>
            <label className="text-ash/70 text-xs font-bold uppercase tracking-wider mb-2 block">Başlık</label>
            <input
              {...register('title')}
              placeholder={programType === 'TRAINING' ? 'Örn: Haftalık Antrenman Programı' : 'Örn: Kişiselleştirilmiş Beslenme Planı'}
              className="w-full bg-charcoal/60 border border-white/10 rounded-xl p-3 text-white placeholder:text-ash/30 focus:border-gold/40 focus:outline-none"
            />
          </div>

          {programType === 'NUTRITION' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <Beef size={12} /> P (g)
                  </label>
                  <input
                    type="number"
                    {...register('protein', { valueAsNumber: true })}
                    className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-center focus:border-amber-500/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <Croissant size={12} /> C (g)
                  </label>
                  <input
                    type="number"
                    {...register('carbs', { valueAsNumber: true })}
                    className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-center focus:border-emerald-500/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sky-400 text-xs font-bold uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <Droplets size={12} /> Y (g)
                  </label>
                  <input
                    type="number"
                    {...register('fat', { valueAsNumber: true })}
                    className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-center focus:border-sky-500/40 focus:outline-none"
                  />
                </div>
                <div className={`col-span-3 rounded-xl p-3 ${customCalories ? 'bg-gold/20 border border-gold/30' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator size={14} className={customCalories ? 'text-gold' : 'text-emerald-400'} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {customCalories ? 'Özel Kalori' : 'Toplam Kalori'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-display text-white">{displayCalories}</span>
                      <span className="text-ash/50 text-xs ml-1">kcal</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-ash/50 font-mono">
                      {protein}×4 + {carbs}×4 + {fat}×9
                    </span>
                    <label className="text-[10px] text-ash/50 hover:text-white cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('customCalories')}
                        className="sr-only"
                      />
                      {customCalories ? 'Otomatik hesapla' : 'Özel gir'}
                    </label>
                  </div>
                </div>
              </div>

              {customCalories && (
                <div>
                  <label className="text-ash/70 text-xs font-bold uppercase tracking-wider mb-2 block">Özel Kalori Hedefi</label>
                  <input
                    type="number"
                    {...register('targetCalories', { valueAsNumber: true })}
                    className="w-full bg-charcoal/60 border border-white/10 rounded-xl p-3 text-white focus:border-gold/40 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-ash/70 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} /> Öğünler
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ name: '', content: '', time: '12:00' })}
                    className="text-xs text-gold hover:text-white flex items-center gap-1"
                  >
                    <Plus size={12} /> Ekle
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="bg-charcoal/40 rounded-lg p-3 space-y-2 border border-white/5">
                      <div className="grid grid-cols-[1fr_80px_32px] gap-2">
                        <input
                          {...register(`meals.${idx}.name` as const)}
                          placeholder="Öğün adı"
                          className="bg-charcoal/60 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/40 focus:outline-none"
                        />
                        <input
                          type="time"
                          {...register(`meals.${idx}.time` as const)}
                          className="bg-charcoal/60 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:border-gold/40 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="p-2 rounded-lg border border-white/10 hover:border-rose-500/30 text-ash/50 hover:text-rose-400"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                      <textarea
                        {...register(`meals.${idx}.content` as const)}
                        placeholder="Öğün içeriği (örn: 3 yumurta, 50g yulaf)"
                        rows={2}
                        className="w-full bg-charcoal/60 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/40 focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {programType === 'TRAINING' && (
            <>
              <div>
                <label className="text-ash/70 text-xs font-bold uppercase tracking-wider mb-2 block">İçerik Türü</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContentType('TEXT')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                      contentType === 'TEXT'
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-transparent text-ash/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <FileText size={12} className="inline mr-1" /> Metin
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('FILE')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                      contentType === 'FILE'
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-transparent text-ash/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Upload size={12} className="inline mr-1" /> Dosya
                  </button>
                </div>
              </div>

              {contentType === 'TEXT' ? (
                <div>
                  <label className="text-ash/70 text-xs font-bold uppercase tracking-wider mb-2 block">Program İçeriği</label>
                  <textarea
                    {...register('content')}
                    placeholder="Antrenman talimatlarını buraya yazın..."
                    rows={5}
                    className="w-full bg-charcoal/60 border border-white/10 rounded-xl p-3 text-white placeholder:text-ash/30 focus:border-gold/40 focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-ash/70 text-xs font-bold uppercase tracking-wider mb-2 block">Dosya Yükle (PDF/Resim)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 rounded-xl border border-dashed border-white/20 text-ash/50 hover:border-gold/30 hover:text-gold transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    {file ? file.name : 'Dosya seçmek için tıklayın'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-ash/60 hover:text-white hover:border-white/20 font-bold text-xs uppercase tracking-widest transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit(handleSubmitForm)}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Send size={12} /> Ata
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── NewClientModal ────────────────────────────────────────────────────────────
interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function NewClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>();

  const password = watch('password');

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      await api.post('/admin/clients', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Danışan başarıyla eklendi!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Danışan eklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-charcoal border border-gold/20 rounded-3xl p-8 w-full max-w-md space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
            <UserPlus size={22} className="text-gold" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-ash/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-display text-white uppercase tracking-wide">
            Yeni Danışan Ekle
          </h2>
          <p className="text-ash/50 font-light italic mt-2 text-sm leading-relaxed">
            Danışanın giriş bilgilerini oluşturmak için formu doldurun.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">İsim</label>
              <input
                {...register('firstName', { required: 'İsim zorunludur' })}
                className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
                placeholder="Ahmet"
              />
              {errors.firstName && <p className="text-rose-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Soyisim</label>
              <input
                {...register('lastName', { required: 'Soyisim zorunludur' })}
                className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
                placeholder="Yılmaz"
              />
              {errors.lastName && <p className="text-rose-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">E-posta</label>
            <input
              {...register('email', { 
                required: 'E-posta zorunludur',
                pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Geçerli e-posta girin' }
              })}
              className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
              placeholder="ahmet@ornek.com"
            />
            {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Şifre</label>
            <input
              type="password"
              {...register('password', { 
                required: 'Şifre zorunludur',
                pattern: { 
                  value: PASSWORD_REGEX, 
                  message: 'En az 8 karakter, 1 büyük harf ve 1 rakam içermeli' 
                }
              })}
              className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
              placeholder="Sifre123!"
            />
            {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-ash/70 text-xs font-bold uppercase mb-2 block">Şifre Tekrar</label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Şifre tekrarı zorunludur',
                validate: (value) => value === password || 'Şifreler eşleşmiyor'
              })}
              className="w-full bg-charcoal/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
              placeholder="Sifre123!"
            />
            {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={18} /> Danışan Ekle</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DanisanlarPage() {
  const router = useRouter();
  const [clients, setClients]   = useState<ClientUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<FilterValue>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [assigningClient, setAssigningClient] = useState<ClientUser | null>(null);

  useEffect(() => {
    api
.get<{ success: boolean; data: ClientUser[] }>('/users/clients')
      .then(({ data }) => {
        console.log('[Danisanlar] API Response:', data);
        if (data.success) {
          setClients(data.data ?? []);
        } else {
          console.error('[Danisanlar] API success false:', data);
        }
      })
      .catch((err) => {
        console.error('[Danisanlar] API Error:', err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = applyFilter(clients, filter, search);

  const expiringSoonCount = clients.filter((c) => {
    const d = daysUntil(c.subscription?.endDate);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-gold/10 pb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-display text-white tracking-tight uppercase">
            Danışanlarım
          </h1>
          <p className="text-ash/50 mt-2 text-sm font-light italic">
            {loading ? '...' : `${clients.length} kayıtlı danışan`}
            {expiringSoonCount > 0 && (
              <span className="ml-3 text-rose-400 font-medium">
                · {expiringSoonCount} üyelik süresi dolmak üzere
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors self-center"
        >
          <Plus size={16} /> Yeni Danışan Ekle
        </button>
      </header>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ash/40 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, e-posta veya hedef ara..."
            className={[
              'w-full bg-charcoal/60 border rounded-xl py-3 pl-11 pr-4',
              'text-white text-sm placeholder-ash/30 outline-none',
              'transition-all duration-300',
              search
                ? 'border-sky-500/50 shadow-[0_0_16px_rgba(56,189,248,0.1)]'
                : 'border-white/10 focus:border-sky-500/50 focus:shadow-[0_0_16px_rgba(56,189,248,0.12)]',
            ].join(' ')}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={[
                'px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase border transition-all duration-200',
                filter === value
                  ? 'bg-gold text-black border-gold shadow-gold-soft'
                  : 'bg-transparent text-ash/60 border-white/10 hover:border-gold/30 hover:text-gold',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Data grid */}
      <div className="rounded-2xl border border-gold/10 overflow-hidden bg-charcoal/20">
        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1.5fr_auto] gap-4 px-6 py-4 border-b border-white/5 text-[10px] tracking-widest uppercase text-ash/35 font-bold">
          <span>Ad Soyad</span>
          <span>Hedef</span>
          <span>Plan</span>
          <span>Üyelik Bitiş</span>
          <span className="w-24 text-right">İşlem</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <motion.div
              className="w-7 h-7 rounded-full border-2 border-gold/30 border-t-gold mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-ash/30 font-display italic text-lg">
            Eşleşen danışan bulunamadı.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                onView={() => router.push(`/danisanlar/${client.id}`)}
                onAssignProgram={() => setAssigningClient(client)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Quick Assign Modal */}
      <AnimatePresence>
        {assigningClient && (
          <QuickAssignModal
            clientId={assigningClient.id}
            clientName={assigningClient.profile 
              ? `${assigningClient.profile.firstName} ${assigningClient.profile.lastName}`
              : assigningClient.email}
            onClose={() => setAssigningClient(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <NewClientModal onClose={() => setShowModal(false)} onSuccess={() => {
          api.get<{ success: boolean; data: ClientUser[] }>('/users/clients')
            .then(({ data }) => {
              if (data.success) setClients(data.data ?? []);
            });
        }} />}
      </AnimatePresence>
    </div>
  );
}
