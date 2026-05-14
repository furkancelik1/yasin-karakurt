'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Utensils, Calendar, Clock, Beef, Croissant, Droplets, CheckCircle, Circle, Plus, Loader2, Printer, FileDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Meal {
  id: string;
  name: string;
  content: string;
  time: string;
  order: number;
  isDone: boolean;
}

interface NutritionPlan {
  id: string;
  userId: string;
  title: string | null;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  meals: Meal[];
}

interface ApiResponse {
  success: boolean;
  data: NutritionPlan | null;
}

const COLORS = ['#eab308', '#22c55e', '#3b82f6'];

export default function BeslenmePage() {
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const dailyGoal = 3000;

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const { data: res } = await api.get<ApiResponse>('/nutrition/plan/active/me');
        if (res.success && res.data) {
          setPlan(res.data);
        }
      } catch (error) {
        console.error('Beslenme planı çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWaterLog = async () => {
      try {
        const { data: res } = await api.get<{ success: boolean; data: { total: number } }>('/water/today');
        if (res.success && res.data) {
          setWaterAmount(res.data.total);
        }
      } catch (error) {
        console.error('Su logu çekme hatası:', error);
      }
    };

    fetchActivePlan();
    fetchWaterLog();
  }, []);

  const addWater = async () => {
    setWaterLoading(true);
    const previousAmount = waterAmount;
    setWaterAmount(prev => prev + 250);
    try {
      await api.post('/water/log', { amount: 250 });
      router.refresh();
    } catch (error) {
      console.error('Su ekleme hatası:', error);
      setWaterAmount(previousAmount);
      toast.error('Su eklenirken bir hata oluştu.');
    } finally {
      setWaterLoading(false);
    }
  };

  const toggleMeal = async (mealId: string) => {
    setUpdating(mealId);
    try {
      const { data: res } = await api.patch<{ success: boolean; data: Meal }>(
        `/nutrition/meal/${mealId}/toggle`
      );
      if (res.success && plan) {
        setPlan({
          ...plan,
          meals: plan.meals.map(m =>
            m.id === mealId
              ? { ...m, isDone: res.data.isDone }
              : m
          ),
        });
        toast.success(res.data.isDone ? 'Öğün tamamlandı!' : 'Öğün iptal edildi.');
      }
    } catch (error) {
      toast.error('Güncelleme sırasında hata oluştu.');
    } finally {
      setUpdating(null);
    }
  };

  const printer = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Beslenme_Plani`,
  });

  const waterPercentage = Math.min((waterAmount / dailyGoal) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white uppercase tracking-wide">
            Beslenme <span className="text-emerald-400 italic">Planı</span>
          </h1>
          <p className="text-ash/50 mt-2 text-sm">Sizin için hazırlanan kişisel beslenme planınız</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-charcoal/40 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Utensils size={28} className="text-emerald-400/50" />
          </div>
          <p className="text-ash/40 font-display italic text-lg">
            Henüz atanmış bir beslenme programınız bulunmamaktadır.
          </p>
          <p className="text-ash/30 text-sm mt-2">
            Koçunuz beslenme planınızı hazırladığında burada görünecek.
          </p>
        </div>
      </div>
    );
  }

  const macroData = [
    { name: 'Protein', value: plan.protein, color: COLORS[0] },
    { name: 'Karbonhidrat', value: plan.carbs, color: COLORS[1] },
    { name: 'Yağ', value: plan.fat, color: COLORS[2] },
  ];

  const completedMeals = plan.meals.filter(m => m.isDone).length;
  const progress = plan.meals.length > 0 ? (completedMeals / plan.meals.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6" ref={printRef as any}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white uppercase tracking-wide">
            Beslenme <span className="text-emerald-400 italic">Planı</span>
          </h1>
          <p className="text-ash/50 mt-2 text-sm">Sizin için hazırlanan kişisel beslenme planınız</p>
        </div>
        <button
          onClick={() => printer?.()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-ash/60 hover:text-white transition-colors text-sm"
        >
          <Printer size={16} />
          Yazdır
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/10 bg-charcoal/60 p-6 shadow-xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Utensils size={22} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/60">Aktif Plan</p>
              <h2 className="text-xl font-display text-white uppercase tracking-wide mt-1">
                {plan.title || 'Beslenme Programı'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-ash/40 text-xs">
            <Calendar size={12} />
            <span>{new Date(plan.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <Beef size={16} className="text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{plan.protein}</p>
            <p className="text-[10px] text-amber-400/60 uppercase">Protein (g)</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <Croissant size={16} className="text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{plan.carbs}</p>
            <p className="text-[10px] text-emerald-400/60 uppercase">Karbo (g)</p>
          </div>
          <div className="bg-sky-500/10 rounded-xl p-3 text-center border border-sky-500/20">
            <Droplets size={16} className="text-sky-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{plan.fat}</p>
            <p className="text-[10px] text-sky-400/60 uppercase">Yağ (g)</p>
          </div>
          <div className="bg-gold/10 rounded-xl p-3 text-center border border-gold/20">
            <p className="text-lg font-bold text-white">{plan.targetCalories}</p>
            <p className="text-[10px] text-gold/60 uppercase">Kalori</p>
          </div>
        </div>

        {plan.notes && (
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 mb-4">
            <p className="text-white/80 font-light whitespace-pre-wrap leading-relaxed">
              {plan.notes}
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Makro Dağılımı
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}g`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Günlük İlerleme
            </h2>
            <span className="text-ash/50 text-xs">
              {completedMeals}/{plan.meals.length} öğün
            </span>
          </div>

          <div className="h-3 bg-charcoal rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>

          <p className="text-ash/40 text-xs">
            {progress < 50 ? 'Henüz yolun başında!' :
             progress < 100 ? 'İyi gidiyorsun!' :
             'Tebrikler, günü tamamladın!'}
          </p>
        </div>
      </div>

      {plan.meals && plan.meals.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-charcoal/30 p-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Öğün Listesi
          </h2>
          <div className="space-y-3">
            {plan.meals.sort((a, b) => a.order - b.order).map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  meal.isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleMeal(meal.id)}
                  disabled={updating === meal.id}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all shrink-0 ${
                    meal.isDone
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-white/30 hover:border-white/60'
                  }`}
                >
                  {updating === meal.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : meal.isDone ? (
                    <Check size={12} />
                  ) : null}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm ${meal.isDone ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {meal.name}
                    </p>
                    {meal.time && (
                      <span className="text-xs text-ash/40">• {meal.time}</span>
                    )}
                  </div>
                  {meal.content && (
                    <p className="text-ash/50 text-xs mt-0.5">{meal.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-sky-500/10 bg-charcoal/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Droplets size={16} className="text-sky-400" />
            Su Takibi
          </h3>
          <span className="text-xs text-ash/50">{waterAmount} / {dailyGoal} ml</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-20 h-32 bg-charcoal/60 rounded-2xl overflow-hidden border border-white/10">
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-sky-400"
              initial={{ height: '0%' }}
              animate={{ height: `${waterPercentage}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets size={24} className="text-white drop-shadow-lg" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="h-3 bg-charcoal/60 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 to-sky-400"
                initial={{ width: '0%' }}
                animate={{ width: `${waterPercentage}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            <p className="text-center text-sky-400 font-bold text-lg">
              %{Math.round(waterPercentage)}
            </p>
          </div>

          <button
            onClick={addWater}
            disabled={waterLoading || waterAmount >= dailyGoal}
            className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all disabled:opacity-50"
          >
            {waterLoading ? (
              <Loader2 size={24} className="text-sky-400 animate-spin" />
            ) : (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Plus size={24} className="text-sky-400" />
              </motion.div>
            )}
          </button>
        </div>

        <p className="text-center text-ash/50 text-xs mt-3">+250ml Su Ekle</p>
      </div>

      <p className="text-ash/40 text-xs flex items-center gap-2">
        <Clock size={12} />
        Son güncelleme: {new Date(plan.updatedAt).toLocaleString('tr-TR')}
      </p>
    </div>
  );
}