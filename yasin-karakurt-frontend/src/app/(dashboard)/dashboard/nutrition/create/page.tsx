'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Plus, X, Save, ArrowLeft, Calculator, Clock, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ClientOption {
  id: string;
  label: string;
}

interface MealField {
  name: string;
  content: string;
  time: string;
}

interface FormData {
  userId: string;
  title?: string;
  protein: number;
  carbs: number;
  fat: number;
  customCalories: boolean;
  targetCalories?: number;
  notes?: string;
  meals: MealField[];
}

export default function NutritionCreatePage() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      protein: 0,
      carbs: 0,
      fat: 0,
      customCalories: false,
      meals: [
        { name: 'Kahvaltı', content: '', time: '08:00' },
        { name: 'Öğle Yemeği', content: '', time: '12:30' },
        { name: 'Akşam Yemeği', content: '', time: '19:00' },
        { name: 'Ara Öğün', content: '', time: '15:00' },
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

  const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;
  const displayCalories = customCalories ? targetCalories : calculatedCalories;

  useEffect(() => {
    if (!customCalories) {
      setValue('targetCalories', calculatedCalories);
    }
  }, [protein, carbs, fat, customCalories, calculatedCalories, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const proteinVal = Number(data.protein) || 0;
      const carbsVal = Number(data.carbs) || 0;
      const fatVal = Number(data.fat) || 0;
      const caloriesVal = Number(displayCalories) || 0;
      
      const validMeals = data.meals
        .filter(m => m.name && m.name.trim())
        .map((m, i) => ({
          name: m.name,
          content: m.content || '',
          time: m.time || '',
          order: i,
        }));

      await api.post('/nutrition/plan', {
        userId: data.userId,
        title: data.title,
        targetCalories: caloriesVal,
        protein: proteinVal,
        carbs: carbsVal,
        fat: fatVal,
        notes: data.notes || undefined,
        meals: validMeals,
      });
      toast.success('Beslenme programı kaydedildi!');
      router.push(`/danisanlar/${data.userId}`);
    } catch (error) {
      console.error('Beslenme planı kaydetme hatası:', error);
      toast.error('Kaydetme sırasında hata oluştu.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-16 max-w-3xl">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-3 rounded-xl border border-white/10 hover:border-gold/30 text-ash/60 hover:text-gold transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display text-white uppercase tracking-wide flex items-center gap-2">
            <Utensils size={24} className="text-emerald-400" />
            Beslenme Programı Oluştur
          </h1>
          <p className="text-ash/50 text-sm mt-1">Danışan için yeni beslenme programı hazırla</p>
        </div>
      </header>

      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
            Danışan Seç
          </label>
          <select
            {...register('userId', { required: 'Danışan seçmelisiniz' })}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none"
          >
            <option value="">Danışan seç...</option>
            <option value="claude-test-id">Test Danışan</option>
          </select>
          {errors.userId && <p className="text-rose-400 text-xs mt-1">{errors.userId.message}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 block">
              Protein (g)
            </label>
            <input
              type="number"
              {...register('protein', { valueAsNumber: true })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none"
            />
          </div>
          <div>
            <label className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 block">
              Karbonhidrat (g)
            </label>
            <input
              type="number"
              {...register('carbs', { valueAsNumber: true })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none"
            />
          </div>
          <div>
            <label className="text-sky-400 text-xs font-bold uppercase tracking-wider mb-2 block">
              Yağ (g)
            </label>
            <input
              type="number"
              {...register('fat', { valueAsNumber: true })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-sky-500/50 outline-none"
            />
          </div>
          <div className={`rounded-xl p-4 ${customCalories ? 'bg-gold/20 border border-gold/30' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              <Calculator size={12} className={customCalories ? 'text-gold' : 'text-emerald-400'} />
              {customCalories ? 'Özel Hedef' : 'Hesaplanan'}
            </div>
            <p className="text-2xl font-display text-white">{displayCalories}</p>
            <p className="text-ash/50 text-xs">kcal</p>
            <label className="text-[10px] text-ash/50 hover:text-white mt-1 cursor-pointer block">
              <input
                type="checkbox"
                {...register('customCalories')}
                className="sr-only"
              />
              {customCalories ? 'Otomatik kullan' : 'Özel gir'}
            </label>
          </div>
        </div>

        {customCalories && (
          <div>
            <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
              Özel Kalori Hedefi
            </label>
            <input
              type="number"
              {...register('targetCalories', { valueAsNumber: true })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
            />
          </div>
        )}

        <div className="bg-charcoal/60 border border-white/5 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calculator size={14} className="text-emerald-400" />
            Makro Hesaplama Formülü
          </h3>
          <p className="text-ash/50 text-sm font-mono">
            Toplam = (Protein × 4) + (Carbs × 4) + (Fat × 9)
          </p>
          <p className="text-ash/40 text-sm mt-1">
            = ({protein} × 4) + ({carbs} × 4) + ({fat} × 9) = <span className="text-white font-bold">{calculatedCalories} kcal</span>
          </p>
        </div>
      </div>

      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" />
            Öğünler
          </h2>
          <button
            type="button"
            onClick={() => append({ name: '', content: '', time: '' })}
            className="flex items-center gap-1 text-xs text-gold hover:text-white transition-colors"
          >
            <Plus size={14} /> Öğün Ekle
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-[1fr_1fr_100px_40px] gap-3 items-start"
            >
              <input
                {...register(`meals.${idx}.name` as const, { required: true })}
                placeholder="Öğün adı (örn: Kahvaltı)"
                className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
              />
              <input
                {...register(`meals.${idx}.content` as const)}
                placeholder="İçerik (örn: 3 yumurta, 50g yulaf)"
                className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
              />
              <input
                type="time"
                {...register(`meals.${idx}.time` as const)}
                className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-3 rounded-xl border border-white/10 hover:border-rose-500/30 text-ash/60 hover:text-rose-400 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-6">
        <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
          Koç Notları
        </label>
        <textarea
          {...register('notes')}
          placeholder="Danışan için ek notlar..."
          rows={4}
          className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 rounded-xl border border-white/10 text-ash/60 hover:text-white hover:border-white/20 font-bold text-sm uppercase tracking-widest transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 rounded-xl bg-emerald-500 text-black font-bold text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} /> Kaydet
            </>
          )}
        </button>
      </div>
    </form>
  );
}