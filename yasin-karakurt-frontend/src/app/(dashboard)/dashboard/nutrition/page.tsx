'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { Utensils, Check, Loader, Download, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface MealData {
  id: string;
  name: string;
  content: string | null;
  time: string | null;
  order: number;
  isDone: boolean;
}

interface NutritionPlanData {
  id: string;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string | null;
  meals: MealData[];
}

const COLORS = ['#eab308', '#22c55e', '#3b82f6'];

export default function NutritionPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<NutritionPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterTarget] = useState(8);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    api.get<{ success: boolean; data: NutritionPlanData | null }>(`/nutrition/plan/user/${user.id}`)
      .then(({ data: res }) => {
        if (res.success && res.data) {
          setPlan(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handlePdfPrint = () => {
    window.print();
  };

  const addWater = () => {
    if (waterGlasses < waterTarget) {
      setWaterGlasses((prev) => prev + 1);
      toast.success('Su eklendi!');
    }
  };

  const resetWater = () => {
    setWaterGlasses(0);
  };

  const toggleMeal = async (mealId: string) => {
    setUpdating(mealId);
    try {
      const { data: res } = await api.patch<{ success: boolean; data: MealData }>(
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-display text-white uppercase tracking-wide flex items-center gap-2">
            <Utensils size={24} className="text-emerald-400" />
            Beslenme Programı
          </h1>
          <p className="text-ash/50 text-sm mt-1">Henüz bir beslenme programın yok.</p>
        </header>

        <div className="text-center py-20 bg-charcoal/20 border border-white/5 rounded-2xl">
          <Utensils size={48} className="text-ash/20 mx-auto mb-4" />
          <p className="text-ash/40 font-display italic">
            Koçun henüz bir beslenme programı hazırlamadı.
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
    <div className="space-y-8 pb-16" ref={printRef as any}>
      <style jsx global>{`
        @media print {
          @page { margin: 1cm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; }
          .print-header { border-bottom: 2px solid #eab308 !important; padding-bottom: 10px !important; margin-bottom: 20px !important; }
          .print-title { font-size: 24px !important; color: #1a1a1a !important; }
          .print-subtitle { color: #666 !important; font-size: 14px !important; }
        }
      `}</style>

      <header className="flex items-center justify-between print-header">
        <div className="print-title">
          <h1 className="text-2xl font-display text-white uppercase tracking-wide flex items-center gap-2">
            <Utensils size={24} className="text-emerald-400" />
            Beslenme Programı
          </h1>
          <p className="text-ash/50 text-sm mt-1 print-subtitle">
            Günlük {plan?.targetCalories} kcal hedef • Yasin Karakurt Coaching
          </p>
        </div>
        {plan && (
          <button
            onClick={handlePdfPrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-ash/60 hover:text-white transition-colors no-print"
          >
            <Download size={16} /> İndir
          </button>
        )}
      </header>

      {/* Su Takip Widget */}
      <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Droplets size={16} className="text-sky-400" />
            Günlük Su Hedefi
          </h2>
          <button onClick={resetWater} className="text-xs text-sky-400 hover:text-white">
            Sıfırla
          </button>
        </div>
        
        {/* Bardak doluluk animasyonu */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-32 bg-charcoal/40 rounded-b-2xl rounded-t-lg overflow-hidden border-2 border-white/10">
            {/* Su doluluk */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-sky-500/60 transition-all duration-500"
              style={{ height: `${(waterGlasses / waterTarget) * 100}%` }}
            >
              <Droplets 
                size={24} 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80" 
              />
            </div>
          </div>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(waterTarget, 10) }).map((_, i) => (
              <button
                key={i}
                onClick={() => waterGlasses < waterTarget && addWater()}
                disabled={waterGlasses >= waterTarget}
                className={`w-6 h-8 rounded transition-all ${
                  i < waterGlasses
                    ? 'bg-sky-500'
                    : 'bg-charcoal/40 border border-white/10 hover:border-sky-500/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-3xl font-display text-white">
            {Math.round((waterGlasses / waterTarget) * 100)}%
          </p>
          <p className="text-sky-400 text-xs">günlük hedef</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-1">Hedef</p>
          <p className="text-2xl font-display text-white">{plan.targetCalories}</p>
          <p className="text-ash/50 text-xs">kcal</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Protein</p>
          <p className="text-2xl font-display text-white">{plan.protein}g</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Karbonhidrat</p>
          <p className="text-2xl font-display text-white">{plan.carbs}g</p>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 text-center">
          <p className="text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">Yağ</p>
          <p className="text-2xl font-display text-white">{plan.fat}g</p>
        </div>
      </div>

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
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
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

      {/* Öğün Checklist - Yapılacaklar listesi */}
        <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 no-print">
          Öğün Listesi (Yapılacaklar)
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
                  <Loader size={12} className="animate-spin" />
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
                  {meal.isDone && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      ✓
                    </span>
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

      {plan.notes && (
        <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Koç Notları
          </h2>
          <p className="text-ash/50 text-sm">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}