"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Scale, Activity, Eye, Loader2 } from "lucide-react";

// Tip Tanımlamaları (TypeScript güvenliği için)
interface CheckIn {
  id: string;
  weight: number;
  bodyFat: number;
  notes: string;
  submittedAt: string;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  photos: { url: string }[];
}

export default function CheckinsGalleryPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        // Backend API adresin (Kendi URL'in ile kontrol et)
        const response = await axios.get("http://localhost:4000/api/v1/checkins", {
          withCredentials: true
        });
        if (response.data.success) {
          setCheckins(response.data.data);
        }
      } catch (error) {
        console.error("Check-inler yüklenirken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
        <p className="text-ash/60 font-serif tracking-widest italic animate-pulse">VERİLER ÇEKİLİYOR...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-gold/10 pb-6">
        <h1 className="text-4xl font-serif text-white tracking-tight uppercase">Gelen Check-inler</h1>
        <p className="text-gold/60 mt-2 text-lg font-light italic">Danışanlarınızın canlı form güncellemeleri.</p>
      </header>

      {checkins.length === 0 ? (
        <div className="text-center py-20 bg-glass-dark rounded-3xl border border-white/5">
          <p className="text-ash/40 text-xl font-serif italic">Henüz gönderilmiş bir check-in bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {checkins.map((checkin) => {
            const dateObj = new Date(checkin.submittedAt);
            const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

            return (
              <div key={checkin.id} className="relative group rounded-3xl overflow-hidden bg-glass-dark border border-white/5 hover:border-gold/30 transition-all duration-500 aspect-[3/4]">
                {/* İlk Fotoğrafı Göster */}
                <img 
                  src={checkin.photos[0]?.url || "https://via.placeholder.com/800x1000?text=Fotoğraf+Yok"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Danışan Formu"
                />

                {/* Alt Bilgi */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-500 group-hover:opacity-0">
                  <h3 className="text-2xl font-serif text-white uppercase tracking-wider">
                    {checkin.user.profile.firstName} {checkin.user.profile.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-gold/80 text-sm font-medium tracking-widest">
                    <Calendar size={14} />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/85 flex flex-col justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm">
                  <h3 className="text-3xl font-serif text-gold uppercase tracking-wider mb-6 border-b border-gold/20 pb-4">
                    {checkin.user.profile.firstName}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-ash/60 text-[10px] tracking-widest uppercase mb-1">Ağırlık</p>
                      <p className="text-2xl font-serif text-white">{checkin.weight} kg</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-ash/60 text-[10px] tracking-widest uppercase mb-1">Yağ Oranı</p>
                      <p className="text-2xl font-serif text-white">%{checkin.bodyFat}</p>
                    </div>
                  </div>

                  <p className="text-white/80 font-light italic line-clamp-4 leading-relaxed mb-8">
                    "{checkin.notes}"
                  </p>

                  <button className="mt-auto py-4 bg-gold text-black rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    Detayı Görüntüle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}