'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, Utensils, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Meal {
  name: string;
  description: string;
}

interface NutritionPlanData {
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
  meals: Meal[];
}

const DEFAULT_MEALS: Meal[] = [
  { name: 'Kahvaltı', description: '' },
  { name: 'Öğle', description: '' },
  { name: 'Akşam', description: '' },
  { name: 'Ara', description: '' },
];

export function NutritionEditor({ 
  userId, 
  onClose 
}: { 
  userId: string; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NutritionPlanData>({
    targetCalories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: '',
    meals: [...DEFAULT_MEALS],
  });

  useEffect(() => {
    api.get<{ success: boolean; data: any }>(`/nutrition/user/${userId}`)
      .then(({ data: res }) => {
        if (res.success && res.data) {
          setForm({
            targetCalories: res.data.targetCalories || 0,
            protein: res.data.protein || 0,
            carbs: res.data.carbs || 0,
            fat: res.data.fat || 0,
            notes: res.data.notes || '',
            meals: res.data.meals?.length ? res.data.meals.map((m: any) => ({
              name: m.name,
              description: m.description || '',
            })) : [...DEFAULT_MEALS],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const calculatedCalories = form.protein * 4 + form.carbs * 4 + form.fat * 9;

  const handleMealChange = (index: number, field: keyof Meal, value: string) => {
    const updated = [...form.meals];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, meals: updated });
  };

  const addMeal = () => {
    setForm((prev) => ({ ...prev, meals: [...prev.meals, { name: '', description: '' }] }));
  };

  const removeMeal = (idx: number) => {
    setForm((prev) => ({ ...prev, meals: prev.meals.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/nutrition', {
        userId,
        targetCalories: form.targetCalories || calculatedCalories,
        protein: form.protein,
        carbs: form.carbs,
        fat: form.fat,
        notes: form.notes,
        meals: form.meals.filter(m => m.name && m.description),
      });
      toast.success('Beslenme programı kaydedildi!');
      onClose();
    } catch (error) {
      toast.error('Kaydetme sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-charcoal border border-gold/20 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-charcoal border border-gold/20 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display text-white uppercase tracking-wide flex items-center gap-2">
            <Utensils size={20} className="text-emerald-400" />
            Beslenme Programı
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 hover:border-white/20 text-ash/60 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
              Protein (g)
            </label>
            <input
              type="number"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: parseInt(e.target.value) || 0 })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none"
            />
          </div>
          <div>
            <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
              Karbonhidrat (g)
            </label>
            <input
              type="number"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: parseInt(e.target.value) || 0 })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-sky-500/50 outline-none"
            />
          </div>
          <div>
            <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
              Yağ (g)
            </label>
            <input
              type="number"
              value={form.fat}
              onChange={(e) => setForm({ ...form, fat: parseInt(e.target.value) || 0 })}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none"
            />
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calculator size={12} />
              Hesaplanan
            </div>
            <p className="text-2xl font-display text-white">{calculatedCalories}</p>
            <p className="text-ash/50 text-xs">kcal</p>
          </div>
        </div>

        <div>
          <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
            Özel Kalori Hedefi (opsiyonel)
          </label>
          <input
            type="number"
            value={form.targetCalories}
            onChange={(e) => setForm({ ...form, targetCalories: parseInt(e.target.value) || 0 })}
            placeholder="Otomatik hesaplanan değeri kullanmak için boş bırak"
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-ash/40 text-xs font-bold uppercase tracking-wider">
              Öğünler
            </label>
            <button
              onClick={addMeal}
              className="flex items-center gap-1 text-xs text-gold hover:text-white transition-colors"
            >
              <Plus size={14} /> Ekle
            </button>
          </div>

          <AnimatePresence>
            {form.meals.map((meal, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[1fr_2fr_auto] gap-3 items-start"
              >
                <input
                  type="text"
                  value={meal.name}
                  onChange={(e) => handleMealChange(idx, 'name', e.target.value)}
                  placeholder="Öğün adı"
                  className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
                />
                <input
                  type="text"
                  value={meal.description}
                  onChange={(e) => handleMealChange(idx, 'description', e.target.value)}
                  placeholder="İçerik (örn: 3 Yumurta, 50g Yulaf)"
                  className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none"
                />
                <button
                  onClick={() => removeMeal(idx)}
                  className="p-3 rounded-xl border border-white/10 hover:border-rose-500/30 text-ash/60 hover:text-rose-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-ash/40 text-xs font-bold uppercase tracking-wider mb-2 block">
            Notlar
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ek notlar..."
            rows={3}
            className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-ash/60 hover:text-white hover:border-white/20 font-bold text-sm uppercase tracking-widest transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} /> Kaydet
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}