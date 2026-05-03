"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Scale, FileText, Camera } from "lucide-react";

export default function GelisimPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight) {
      toast.error("Lütfen güncel kilonuzu girin.");
      return;
    }

    if (files.length === 0) {
      toast.error("Lütfen en az bir gelişim fotoğrafı yükleyin.");
      return;
    }

    setIsLoading(true);

    try {
      // Dosya gönderimi için FormData kullanıyoruz
      const formData = new FormData();
      formData.append("weight", weight);
      formData.append("notes", notes);
      
      // Her bir dosyayı 'photos' key'i ile ekliyoruz (Backend bu ismi bekler)
      files.forEach((file) => {
        formData.append("photos", file);
      });

      await api.post("/checkins", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Gelişim formunuz başarıyla Yasin Hoca'ya iletildi!");
      router.push("/dashboard"); // İşlem bitince ana ekrana dön
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Form gönderilirken bir hata oluştu.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto ml-64 space-y-8">
      {/* Başlık Alanı */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">
          Haftalık <span className="text-gold italic">Gelişim</span> Check-in
        </h1>
        <p className="text-ash/60 mt-2">
          Güncel verilerini ve fotoğraflarını yükle. Yasin Hoca en kısa sürede inceleyip sana dönüş yapacaktır.
        </p>
      </div>

      {/* Form Alanı */}
      <div className="bg-glass-dark rounded-2xl border border-gold/10 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Üst Kısım: Kilo ve Notlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="weight" className="text-ash flex items-center gap-2 text-base">
                <Scale size={18} className="text-gold" />
                Güncel Kilo (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Örn: 75.5"
                className="bg-charcoal border-gold/20 text-white placeholder:text-ash/40 focus:border-gold/50 h-12 text-lg rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-ash flex items-center gap-2 text-base">
                <FileText size={18} className="text-gold" />
                Hocana Notun (İsteğe Bağlı)
              </Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bu hafta antrenmanlar nasıl geçti? Zorlandığın bir yer oldu mu?"
                className="w-full bg-charcoal border border-gold/20 rounded-xl p-3 text-white placeholder:text-ash/40 focus:border-gold/50 focus:outline-none transition-all resize-none h-12 min-h-[48px]"
                rows={1}
              />
            </div>
          </div>

          {/* Orta Kısım: Fotoğraf Yükleme */}
          <div className="space-y-4 pt-4 border-t border-gold/10">
            <div className="flex flex-col">
              <Label className="text-ash flex items-center gap-2 text-base mb-1">
                <Camera size={18} className="text-gold" />
                Gelişim Fotoğrafları
              </Label>
              <span className="text-xs text-ash/50">
                Ön, yan ve arka profil fotoğraflarını net bir ışıkta çekmeye özen göster (Max 5 dosya).
              </span>
            </div>
            
            {/* Önceden oluşturduğumuz komponenti çağırıyoruz */}
            <div className="bg-charcoal/50 rounded-xl p-2 border border-gold/5">
              <ImageUpload onFilesChange={setFiles} />
            </div>
          </div>

          {/* Alt Kısım: Gönder Butonu */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-gold/80 to-yellow-600 hover:from-gold hover:to-yellow-500 text-black font-bold px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2"
            >
              {isLoading ? (
                "Gönderiliyor..."
              ) : (
                <>
                  Formu İlet <Send size={18} />
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}