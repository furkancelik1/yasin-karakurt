'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Camera, ChevronRight, ChevronLeft, 
  Upload, Check, X, Loader2, Scale, Moon, Zap, Frown, Heart,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface CheckInFormData {
  weight?: number;
  bodyFat?: number;
  sleepHours?: number;
  energyLevel?: number;
  stressLevel?: number;
  hungerLevel?: number;
  notes?: string;
  photos?: File[];
}

const STEPS = [
  { id: 1, title: 'Metrikler', icon: Scale },
  { id: 2, title: 'Fotoğraflar', icon: Camera },
  { id: 3, title: 'Notlar', icon: Dumbbell },
];

const LEVEL_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function CheckInForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckInFormData>({});
  const [photoPreviews, setPhotoPreviews] = useState<{ url: string; label: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof CheckInFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (photoPreviews.find(p => p.label === label)) {
      toast.error(`${label} fotoğrafı zaten eklenmiş.`);
      return;
    }

    const newPreviews = [...photoPreviews, { url: URL.createObjectURL(file), label, file }];
    updateField('photos', [...(formData.photos || []), file]);
    setPhotoPreviews(newPreviews);
  };

  const removePhoto = (label: string) => {
    const idx = photoPreviews.findIndex(p => p.label === label);
    if (idx === -1) return;
    
    const newPreviews = photoPreviews.filter(p => p.label !== label);
    const newPhotos = [...(formData.photos || [])];
    newPhotos.splice(idx, 1);
    
    setPhotoPreviews(newPreviews);
    updateField('photos', newPhotos);
  };

  const handleSubmit = async () => {
    if (!formData.weight && !formData.sleepHours && !formData.energyLevel && !formData.stressLevel && !formData.hungerLevel && !formData.notes && !formData.photos?.length) {
      toast.error('En az bir metrik veya fotoğraf eklemelisiniz.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('weight', formData.weight?.toString() || '');
      data.append('bodyFat', formData.bodyFat?.toString() || '');
      data.append('sleepHours', formData.sleepHours?.toString() || '');
      data.append('energyLevel', formData.energyLevel?.toString() || '');
      data.append('stressLevel', formData.stressLevel?.toString() || '');
      data.append('hungerLevel', formData.hungerLevel?.toString() || '');
      data.append('notes', formData.notes || '');

      (formData.photos || []).forEach((file, i) => {
        data.append('photos', file);
      });

      await api.post('/checkins', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Haftalık formunuz koça gönderildi!', { icon: '✓' });
      router.push('/dashboard/gelisim');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Form gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canSubmit = step === 3;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white uppercase tracking-wide">
          Haftalık <span className="text-gold italic">Form</span>
        </h1>
        <p className="text-ash/50 mt-2 text-sm">Bu haftaki gelişimini koçunla paylaş</p>
      </div>

      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
              step >= s.id 
                ? 'bg-gold border-gold text-black' 
                : 'border-white/20 text-ash/40'
            )}>
              {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
            </div>
            <span className={cn(
              'ml-2 text-sm font-medium',
              step >= s.id ? 'text-white' : 'text-ash/40'
            )}>
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'w-12 h-0.5 mx-2',
                step > s.id ? 'bg-gold' : 'bg-white/10'
              )} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <MetricInput
              label="Kilo (kg)"
              value={formData.weight}
              onChange={(v) => updateField('weight', v)}
              icon={<Scale size={18} />}
            />

            <MetricInput
              label="Vücut Yağ (%)"
              value={formData.bodyFat}
              onChange={(v) => updateField('bodyFat', v)}
              icon={<Dumbbell size={18} />}
            />

            <div className="space-y-2">
              <label className="text-sm text-ash-400 flex items-center gap-2">
                <Moon size={16} /> Uyku Süresi
              </label>
              <select
                value={formData.sleepHours || ''}
                onChange={(e) => updateField('sleepHours', parseInt(e.target.value))}
                className="w-full p-3 rounded-xl bg-charcoal border border-white/10 text-white"
              >
                <option value="">Seçiniz</option>
                {[4,5,6,7,8,9,10,11,12].map(h => (
                  <option key={h} value={h}>{h} saat</option>
                ))}
              </select>
            </div>

            <SliderInput
              label="Enerji Seviyesi"
              value={formData.energyLevel}
              onChange={(v) => updateField('energyLevel', v)}
              icon={<Zap size={18} />}
            />

            <SliderInput
              label="Stres Seviyesi (1= düşük, 10= yüksek)"
              value={formData.stressLevel}
              onChange={(v) => updateField('stressLevel', v)}
              icon={<Frown size={18} />}
            />

            <SliderInput
              label="Açlık Seviyesi (1= tok, 10= çok aç)"
              value={formData.hungerLevel}
              onChange={(v) => updateField('hungerLevel', v)}
              icon={<Heart size={18} />}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-ash-400 text-sm mb-4">3 farklı açıdan fotoğraf çekip yükleyin:</p>
            
            {['Ön', 'Yan', 'Arka'].map((view) => (
              <PhotoUpload
                key={view}
                label={view}
                preview={photoPreviews.find(p => p.label === view)}
                onSelect={(e) => handlePhotoSelect(e, view)}
                onRemove={() => removePhoto(view)}
              />
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm text-ash-400 flex items-center gap-2">
                <Dumbbell size={16} /> Haftalık Notun
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Bu hafta yaşadığın zorluklar, hissettiklerini anlat..."
                className="w-full p-4 rounded-xl bg-charcoal border border-white/10 text-white min-h-[150px] resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
              <p className="text-gold text-sm font-medium">Formun gönderildiğinde:</p>
              <ul className="text-ash-400 text-xs mt-2 space-y-1">
                <li>• Koçunuz formunuzu inceleyecek</li>
                <li>• Değerlendirme sonrası bildirim alacaksınız</li>
                <li>• Bir sonraki hafta için yeni form doldurabileceksiniz</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-ash-400',
            step === 1 && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronLeft size={18} /> Geri
        </button>

        {canSubmit ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gold text-black font-bold"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Gönder
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gold text-black font-bold"
          >
            İleri <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function MetricInput({ 
  label, value, onChange, icon 
}: { 
  label: string; value?: number; onChange: (v: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-ash-400 flex items-center gap-2">{icon} {label}</label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full p-3 rounded-xl bg-charcoal border border-white/10 text-white"
        placeholder="0"
      />
    </div>
  );
}

function SliderInput({ 
  label, value, onChange, icon 
}: { 
  label: string; value?: number; onChange: (v: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-ash-400 flex items-center gap-2">{icon} {label}</label>
      <div className="flex gap-1">
        {LEVEL_LABELS.map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 py-3 rounded-lg text-xs font-bold transition-all',
              value === level 
                ? 'bg-gold text-black' 
                : 'bg-white/5 text-ash-400 hover:bg-white/10'
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoUpload({
  label, preview, onSelect, onRemove
}: {
  label: string; preview?: { url: string; label: string };
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {preview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-charcoal">
          <img src={preview.url} alt={label} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <span className="text-white text-sm font-medium">{label} görünüş</span>
          </div>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-red-500"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-ash-400 hover:border-gold/30 hover:text-gold transition-colors"
        >
          <User size={24} />
          <span className="text-sm">{label} görünüş</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="hidden"
      />
    </div>
  );
}