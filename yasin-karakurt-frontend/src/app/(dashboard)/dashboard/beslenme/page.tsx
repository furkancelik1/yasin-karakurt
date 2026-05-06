'use client';

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Calendar, Clock, Beef, Croissant, Droplets, CheckCircle, Circle, Plus, Loader2, Download, Printer } from 'lucide-react';
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

export default function BeslenmePage() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);
  const [clientName, setClientName] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const dailyGoal = 3000;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const printer = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Beslenme_Plani_${clientName || 'Danisan'}`,
  });

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
    try {
      await api.post('/water/log', { amount: 250 });
      setWaterAmount(prev => prev + 250);
    } catch (error) {
      console.error('Su ekleme hatası:', error);
    } finally {
      setWaterLoading(false);
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white uppercase tracking-wide">
            Beslenme <span className="text-emerald-400 italic">Planı</span>
          </h1>
          <p className="text-ash/50 mt-2 text-sm">Sizin için hazırlanan kişisel beslenme planınız</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-bold no-print"
        >
          <Printer size={16} />
          İndir
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/10 bg-charcoal/60 p-6 shadow-xl mb-6"
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

      {plan.meals && plan.meals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/5 bg-charcoal/40 p-6"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" />
            Öğünler
          </h3>
          <div className="space-y-3">
            {plan.meals.sort((a, b) => a.order - b.order).map((meal) => (
              <div
                key={meal.id}
                className={`p-4 rounded-xl border ${
                  meal.isDone
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${meal.isDone ? 'text-emerald-400' : 'text-ash/40'}`}>
                    {meal.isDone ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-bold ${meal.isDone ? 'text-emerald-400 line-through' : 'text-white'}`}>
                        {meal.name}
                      </p>
                      <span className="text-xs text-ash/50">{meal.time}</span>
                    </div>
                    <p className="text-ash/50 text-sm mt-1">{meal.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 text-ash/40 text-xs mt-6">
        <Clock size={12} />
        <span>Son güncelleme: {new Date(plan.updatedAt).toLocaleString('tr-TR')}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-sky-500/10 bg-charcoal/40 p-6 mt-6"
      >
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
              <motion.div
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={24} className="text-sky-400" />
              </motion.div>
            )}
          </button>
        </div>

        <p className="text-center text-ash/50 text-xs mt-3 no-print">+250ml Su Ekle</p>
      </motion.div>

      {/* Print Section - Clean A4 Layout */}
      <div ref={printRef} className="hidden print:block p-8 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-black">Yasin Karakurt Coaching</h1>
          <p className="text-sm text-gray-600">Kişisel Beslenme Programı</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{plan.title || 'Beslenme Programı'}</h2>
          <p className="text-sm text-gray-600">Tarih: {new Date(plan.createdAt).toLocaleDateString('tr-TR')}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-gray-100 rounded-none" style={{ border: '1px solid #000' }}>
          <div className="text-center">
            <p className="font-bold text-lg">{plan.protein}g</p>
            <p className="text-xs text-gray-600">Protein</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{plan.carbs}g</p>
            <p className="text-xs text-gray-600">Karbonhidrat</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{plan.fat}g</p>
            <p className="text-xs text-gray-600">Yağ</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{plan.targetCalories}</p>
            <p className="text-xs text-gray-600">Kalori</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-2">Öğünler</h3>
          <div className="space-y-3">
            {plan.meals && plan.meals.length > 0 ? plan.meals.sort((a, b) => a.order - b.order).map((meal) => (
              <div key={meal.id} className="p-3 border border-gray-300" style={{ border: '1px solid #ccc' }}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{meal.name}</span>
                  <span className="text-gray-500 text-sm">{meal.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{meal.content || '-'}</p>
              </div>
            )) : (
              <p className="text-gray-500 italic">Öğün bilgisi bulunmuyor.</p>
            )}
          </div>
        </div>

        {plan.notes && (
          <div className="mt-6 p-4 bg-gray-100" style={{ border: '1px solid #ccc' }}>
            <h3 className="font-medium mb-2">Koç Notları</h3>
            <p className="text-sm">{plan.notes}</p>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Yasin Karakurt Coaching - Profesyonel Koçluk Hizmetleri</p>
          <p>{new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </div>
    </div>
  );
}