"use client";

import { useAuth } from "@/hooks/useAuth";
import { Users, ClipboardList, TrendingUp, Activity, Zap, Flame } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth(); // Auth hook'umuz

  // 1. Yüklenme Durumu (Veri gelmeden sayfa render edilmesin diye)
  if (isLoading || user === undefined) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gold animate-pulse font-serif tracking-widest text-lg">YÜKLENİYOR...</div>
      </div>
    );
  }

  // 2. ADMIN GÖRÜNÜMÜ: Yasin Hoca'nın Paneli
  if (user?.role === "ADMIN") {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <header>
          <h1 className="text-4xl font-serif text-white tracking-tight">Hoş geldiniz, Yasin Bey.</h1>
          <p className="text-gold/60 mt-2 text-lg font-light italic">Platformunuzdaki son güncellemeler ve danışan hareketleri.</p>
        </header>

        {/* Admin İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Aktif Öğrenci" value="12" icon={<Users className="text-gold" />} trend="+2 Yeni" />
          <StatCard title="Bekleyen Check-in" value="5" icon={<ClipboardList className="text-orange-400" />} trend="Kritik" />
          <StatCard title="Aylık İlerleme" value="%88" icon={<TrendingUp className="text-green-400" />} trend="Başarılı" />
          <StatCard title="Program Güncelleme" value="3" icon={<Activity className="text-blue-400" />} trend="Bekliyor" />
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="bg-glass-dark border border-gold/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-medium text-white mb-6 font-serif tracking-widest">HIZLI AKSİYONLAR</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-6 bg-gold/5 hover:bg-gold/10 border border-gold/20 rounded-2xl text-gold transition-all text-center font-medium uppercase tracking-widest">
              Yeni Program Hazırla
            </button>
            <button className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-ash transition-all text-center font-medium uppercase tracking-widest">
              Ödemeleri Kontrol Et
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. DANIŞAN GÖRÜNÜMÜ: Öğrencilerin Paneli (Senin mevcut ekranın)
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <p className="text-ash/60 mb-1">1 Mayıs Cuma</p>
        <h1 className="text-4xl font-serif text-white tracking-tight">
          İyi akşamlar, <span className="text-gold uppercase">{(user as any)?.name || "ŞAMPİYON"}</span>.
        </h1>
        <p className="text-ash/60 mt-2">Programında <span className="text-white font-medium">3 antrenman</span> tamamlandı · bu hafta hedefin 5 antrenman.</p>
      </header>

      {/* Antrenman Kartı */}
      <div className="bg-glass-dark border border-gold/10 rounded-2xl p-6 flex justify-between items-center shadow-xl">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
            <Activity className="text-gold" />
          </div>
          <div>
            <p className="text-gold uppercase text-xs font-bold tracking-widest mb-1">BUGÜNKÜ ANTRENMAN</p>
            <h2 className="text-2xl font-serif text-white">Üst Gövde — Kuvvet</h2>
            <p className="text-ash/60 text-sm mt-1">8 egzersiz • 55 dk</p>
          </div>
        </div>
        <button className="bg-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-gold/90 transition-colors tracking-wide">
          BAŞLA →
        </button>
      </div>

      {/* Gelişim İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-glass-dark border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-ash/60 uppercase text-xs font-bold tracking-widest">HAFTALIK İLERLEME</p>
            <Zap className="text-gold w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-white">3 / 5</p>
          <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-gold h-full w-[60%]"></div>
          </div>
        </div>
        
        <div className="bg-glass-dark border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-ash/60 uppercase text-xs font-bold tracking-widest">KALAN KALORİ</p>
            <Flame className="text-green-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-white">1.240</p>
          <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-green-400 h-full w-[48%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}