"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/dashboard/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function GelisimPage() {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    if (images.length === 0) return toast.error("Lütfen form fotoğraflarını ekleyin.");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('weight', data.weight);
    formData.append('notes', data.notes);
    images.forEach(img => formData.append('images', img));

    try {
      await api.post('/checkins', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Check-in başarıyla gönderildi. Yasin Hoca en kısa sürede inceleyecektir.");
      reset();
      setImages([]);
    } catch (error) {
      toast.error("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gold">Haftalık Check-in</h1>
        <p className="text-ash/60">Gelişimini takip edebilmemiz için güncel verilerini paylaş.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-glass-dark p-6 rounded-2xl border border-gold/10">
          <div className="space-y-4">
            <label className="text-sm text-ash/80">Güncel Kilo (kg)</label>
            <Input {...register('weight')} type="number" step="0.1" placeholder="75.5" required />
          </div>
          
          <div className="space-y-4">
            <label className="text-sm text-ash/80">Notların (Nasıl hissediyorsun?)</label>
            <textarea 
              {...register('notes')}
              className="w-full bg-charcoal border border-gold/10 rounded-lg p-3 text-white focus:border-gold/50 outline-none h-32"
              placeholder="Bu hafta enerji seviyem yüksekti..."
            />
          </div>
        </div>

        <div className="bg-glass-dark p-6 rounded-2xl border border-gold/10 space-y-6">
          <ImageUpload label="Form Fotoğrafları (Ön - Yan - Arka)" onFilesChange={setImages} />
          <Button type="submit" className="w-full h-12 bg-gold text-black hover:bg-gold/80" disabled={loading}>
            {loading ? "Yükleniyor..." : "Check-in Gönder"}
          </Button>
        </div>
      </form>
    </div>
  );
}