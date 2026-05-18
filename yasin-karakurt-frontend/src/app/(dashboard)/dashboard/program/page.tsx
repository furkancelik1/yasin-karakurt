'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, FileText, Download, Calendar, Clock } from 'lucide-react';
import api from '@/lib/api';

interface UserProgram {
  id: string;
  userId: string;
  type: 'TRAINING' | 'NUTRITION';
  title: string;
  content: string | null;
  contentType: 'TEXT' | 'FILE';
  fileUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProgramResponse {
  success: boolean;
  data: UserProgram[];
}

export default function ProgramPage() {
  const [programs, setPrograms] = useState<UserProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ProgramResponse>('/programs/my/programs')
      .then(({ data }) => {
        if (data.success) setPrograms(data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trainingProgram = programs.find(p => p.type === 'TRAINING');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!trainingProgram) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white uppercase tracking-wide">
            Antrenman <span className="text-gold italic">Programım</span>
          </h1>
          <p className="text-ash/50 mt-2 text-sm">Sizin için hazırlanan kişisel programınız</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-charcoal/40 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={28} className="text-gold/50" />
          </div>
          <p className="text-ash/40 font-display italic text-lg">
            Henüz atanmış bir antrenman programınız bulunmamaktadır.
          </p>
          <p className="text-ash/30 text-sm mt-2">
            Yasin Hoca programınızı hazırladığında burada görünecek.
          </p>
        </div>
      </div>
    );
  }

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace('/api/v1', '');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white uppercase tracking-wide">
          Antrenman <span className="text-gold italic">Programım</span>
        </h1>
        <p className="text-ash/50 mt-2 text-sm">Sizin için hazırlanan kişisel programınız</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gold/10 bg-charcoal/60 p-6 shadow-xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-xl border border-gold/20">
              <Dumbbell size={22} className="text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gold/60">Aktif Program</p>
              <h2 className="text-xl font-display text-white uppercase tracking-wide mt-1">
                {trainingProgram.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-ash/40 text-xs">
            <Calendar size={12} />
            <span>{new Date(trainingProgram.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        {trainingProgram.contentType === 'FILE' && trainingProgram.fileUrl ? (
          <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gold/70" />
                <span className="text-ash/70">Program Dosyası</span>
              </div>
              <a
                href={trainingProgram.fileUrl.startsWith('http://') || trainingProgram.fileUrl.startsWith('https://') ? trainingProgram.fileUrl : `${API_URL}${trainingProgram.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                <Download size={14} /> Dosyayı Görüntüle
              </a>
            </div>
          </div>
        ) : trainingProgram.content ? (
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <p className="text-white/80 font-light whitespace-pre-wrap leading-relaxed">
                {trainingProgram.content}
              </p>
            </div>
            <div className="flex items-center gap-2 text-ash/40 text-xs pt-2">
              <Clock size={12} />
              <span>Son güncelleme: {new Date(trainingProgram.updatedAt).toLocaleString('tr-TR')}</span>
            </div>
          </div>
        ) : (
          <p className="text-ash/40 italic">Program içeriği henüz eklenmemiş.</p>
        )}
      </motion.div>
    </div>
  );
}