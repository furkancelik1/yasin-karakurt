'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { Utensils, Calendar, Clock, Beef, Croissant, Droplets, CheckCircle, Circle, Plus, Loader2, Printer, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
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

const interBoldBase64 = `AAEALAAAAABAAQAAAJRgAAIlQoGI2WgXY7xNmkJ2l8D/+fzB/m2YQAIAAAIABgAAAABAAIRkQwVEAABAAABAAIDFAAJABIAAQADAAQACQASAAOAADAAMAAkAEgAHAAOAAsADwATABcAGAAZAB4AHwAgACEAIQAjACQAJQAmACcAKAApACsALAAuAC8AMAAzADQAOAA4ADkAOwA8AD0APgA/AD8AQABCAEIARABFAEYARwBIAEkAPABJAE4ATwBRAFJAVEBVQFZAV0BYQFlAWUBaQFtAXEBdQF5AX0BgcGBwYHRgd2B4YHhgeWB5YHlgeWB5YHlgeXB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAdoB3AHbAdsB3AHbAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHYAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YHYAdmB2YGYAdmBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAdgBmIOYAZiDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIA=`;

const interNormalBase64 = `AAEALAAAAABAAQAAAJRgAAIlQoGI2WgXY7xNmkJ2l8D/+fzB/m2YQAIAAAIABgAAAABAAIRkQwVEAABAAABAAIDFAAJABIAAQADAAQACQASAAOAADAAMAAkAEgAHAAOAAsADwATABcAGAAZAB4AHwAgACEAIQAjACQAJQAmACcAKAApACsALAAuAC8AMAAzADQAOAA4ADkAOwA8AD0APgA/AD8AQABCAEIARABFAEYARwBIAEkAPABJAE4ATwBRAFJAVEBVQFZAV0BYQFlAWUBaQFtAXEBdQF5AX0BgcGBwYHRgd2B4YHhgeWB5YHlgeWB5YHlgeXB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAeYB5gHmAdoB3AHbAdsB3AHbAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdoB2gHaAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdkB2QHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHZAdmB2YHYAdmBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAZgBmIGYAdgBmIOYAZiDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIGYg5iDmIA=`;

function fixTurkish(text: string): string {
  return text
    .replace(/ğ/g, 'ğ')
    .replace(/Ğ/g, 'Ğ')
    .replace(/ş/g, 'ş')
    .replace(/Ş/g, 'Ş')
    .replace(/ı/g, 'ı')
    .replace(/İ/g, 'İ')
    .replace(/ç/g, 'ç')
    .replace(/Ç/g, 'Ç')
    .replace(/ö/g, 'ö')
    .replace(/Ö/g, 'Ö')
    .replace(/ü/g, 'ü')
    .replace(/Ü/g, 'Ü');
}

function generatePDF(plan: NutritionPlan, clientNameParam?: string): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.addFileToVFS('Inter-Bold.ttf', interBoldBase64);
  doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
  doc.addFileToVFS('Inter-Regular.ttf', interNormalBase64);
  doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
  doc.setFont('Inter');

  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('Inter', 'bold');
  doc.text(fixTurkish('Yasin Karakurt Coaching'), margin, 18);
  doc.setFontSize(12);
  doc.setFont('Inter', 'normal');
  doc.text(fixTurkish('Kişisel Beslenme Programı'), margin, 28);

  if (clientNameParam) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`${fixTurkish(clientNameParam)}`, pageWidth - margin, 18, { align: 'right' });
  }
  doc.setTextColor(255, 255, 255);
  doc.text(fixTurkish(new Date().toLocaleDateString('tr-TR')), pageWidth - margin, 28, { align: 'right' });

  y = 50;
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(14);
  doc.setFont('Inter', 'bold');
  doc.text(fixTurkish(plan.title || 'Beslenme Programı'), margin, y);

  y += 15;

  const cardWidth = (contentWidth - 15) / 4;
  const cardHeight = 40;

  const colors = [
    { bg: [255, 248, 230], title: '#D4AF37', value: '#1A1A1A', label: 'Protein' },
    { bg: [230, 255, 240], title: '#4CAF50', value: '#1A1A1A', label: 'Karbonhidrat' },
    { bg: [230, 245, 255], title: '#2196F3', value: '#1A1A1A', label: 'Yağ' },
    { bg: [255, 245, 230], title: '#D4AF37', value: '#1A1A1A', label: 'Kalori' },
  ];

  const values = [`${plan.protein}g`, `${plan.carbs}g`, `${plan.fat}g`, `${plan.targetCalories}`];

  for (let i = 0; i < 4; i++) {
    const x = margin + i * (cardWidth + 5);
doc.setFillColor(colors[i].bg[0], colors[i].bg[1], colors[i].bg[2]);    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');

    doc.setFontSize(8);
    doc.setFont('Inter', 'normal');
    const textColor = colors[i].title === '#D4AF37' ? [212, 175, 55] : [33, 150, 243];
doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(fixTurkish(colors[i].label), x + cardWidth / 2, y + 12, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('Inter', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(values[i], x + cardWidth / 2, y + 28, { align: 'center' });
  }

  y += cardHeight + 15;

  const tableStartY = y;
  const rowHeight = 10;
  const colWidths = [60, 30, contentWidth - 90];

  doc.setFillColor(26, 26, 26);
  doc.rect(margin, y, contentWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('Inter', 'bold');
  doc.text(fixTurkish('Öğün Adı'), margin + 5, y + 7);
  doc.text(fixTurkish('Saat'), margin + colWidths[0] + 5, y + 7);
  doc.text(fixTurkish('İçerik'), margin + colWidths[0] + colWidths[1] + 5, y + 7);

  y += rowHeight;

  const sortedMeals = [...plan.meals].sort((a, b) => a.order - b.order);

  sortedMeals.forEach((meal, index) => {
    doc.setFillColor(index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 250);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(26, 26, 26);
    doc.setFontSize(9);
    doc.setFont('Inter', 'bold');
    doc.text(fixTurkish(meal.name), margin + 5, y + 7);
    doc.setFont('Inter', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(meal.time, margin + colWidths[0] + 5, y + 7);
    doc.setTextColor(50, 50, 50);
    const content = meal.content ? fixTurkish(meal.content.substring(0, 50)) : '-';
    doc.text(content, margin + colWidths[0] + colWidths[1] + 5, y + 7);

    y += rowHeight;
  });

  y += 10;

  if (plan.notes) {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'S');
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(9);
    doc.setFont('Inter', 'bold');
    doc.text(fixTurkish('Koç Notları'), margin + 5, y + 8);
    doc.setFont('Inter', 'normal');
    doc.setFontSize(8);
    const noteLines = doc.splitTextToSize(fixTurkish(plan.notes), contentWidth - 10);
    doc.text(noteLines, margin + 5, y + 16);
  }

  y = 280;
  doc.setFillColor(212, 175, 55);
  doc.rect(0, y - 5, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(fixTurkish('Yasin Karakurt Coaching - Profesyonel Koçluk Hizmetleri'), pageWidth / 2, y + 3, { align: 'center' });
  doc.text(fixTurkish(new Date().toLocaleDateString('tr-TR')), pageWidth / 2, y + 10, { align: 'center' });

  return doc;
}

export default function BeslenmePage() {
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);
  const [clientName, setClientName] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const dailyGoal = 3000;

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

  const handleDownloadPDF = useCallback(async () => {
    if (!plan) return;
    setPdfLoading(true);
    try {
      const doc = generatePDF(plan, clientName || undefined);
      const fileName = `Beslenme_Plani_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
    } finally {
      setPdfLoading(false);
    }
  }, [plan, clientName]);

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
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm font-bold"
        >
          {pdfLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileDown size={16} />
          )}
          İndir PDF
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

      <div ref={printRef} className="hidden print:block">
        <div className="p-8 bg-white text-black">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black">Yasin Karakurt Coaching</h1>
            <p className="text-sm text-gray-600">Kişisel Beslenme Programı</p>
          </div>
        </div>
      </div>
    </div>
  );
}