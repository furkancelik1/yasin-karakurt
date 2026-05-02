"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Scale,
  Droplets,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from "lucide-react";

type CheckInStatus = "PENDING" | "REVIEWED" | "COMPLETED";

interface Photo {
  url: string;
  angle?: string;
}

interface CheckInData {
  id: string;
  status: CheckInStatus;
  weight: number | null;
  bodyFat: number | null;
  notes: string | null;
  trainerNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  photos: Photo[];
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  };
}

interface PageData {
  checkin: CheckInData;
  previousCheckin: CheckInData | null;
}

const statusConfig: Record<CheckInStatus, { label: string; className: string }> = {
  PENDING:   { label: "Bekliyor",   className: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  REVIEWED:  { label: "İncelendi",  className: "bg-sky-500/15 text-sky-300 border border-sky-500/30" },
  COMPLETED: { label: "Tamamlandı", className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" },
};

function DeltaCard({
  label,
  current,
  previous,
  unit,
  icon,
}: {
  label: string;
  current: number | null;
  previous: number | null;
  unit: string;
  icon: React.ReactNode;
}) {
  const diff = current != null && previous != null ? +(current - previous).toFixed(1) : null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-ash/60 text-[11px] tracking-widest uppercase font-medium">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-serif text-white">
        {current ?? "—"} <span className="text-lg text-ash/50">{unit}</span>
      </p>
      {diff !== null && (
        <div
          className={`flex items-center gap-1.5 text-sm font-semibold ${
            diff < 0 ? "text-emerald-400" : diff > 0 ? "text-rose-400" : "text-ash/50"
          }`}
        >
          {diff < 0 ? (
            <TrendingDown size={14} />
          ) : diff > 0 ? (
            <TrendingUp size={14} />
          ) : (
            <Minus size={14} />
          )}
          {diff > 0 ? "+" : ""}
          {diff} {unit} önceki haftaya göre
        </div>
      )}
    </div>
  );
}

export default function CheckinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/v1/checkins/${id}`, {
          withCredentials: true,
        });
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error("Detay yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const markAsReviewed = async () => {
    if (!data) return;
    setMarking(true);
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/v1/checkins/${id}/status`,
        { status: "REVIEWED" },
        { withCredentials: true }
      );
      if (res.data.success) {
        setData((prev) =>
          prev ? { ...prev, checkin: { ...prev.checkin, status: "REVIEWED" } } : prev
        );
      }
    } catch (err) {
      console.error("Statü güncellenemedi:", err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
        <p className="text-ash/60 font-serif tracking-widest italic animate-pulse">YÜKLENİYOR...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-ash/40 text-xl font-serif italic">Check-in bulunamadı.</p>
        <button
          onClick={() => router.back()}
          className="text-gold text-sm underline underline-offset-4"
        >
          Geri dön
        </button>
      </div>
    );
  }

  const { checkin, previousCheckin } = data;
  const fullName = `${checkin.user.profile.firstName} ${checkin.user.profile.lastName}`;
  const formattedDate = new Date(checkin.submittedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentPhoto = checkin.photos[0]?.url;
  const previousPhoto = previousCheckin?.photos[0]?.url;

  const isReviewed = checkin.status === "REVIEWED" || checkin.status === "COMPLETED";

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 border-b border-gold/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-white/10 hover:border-gold/40 text-ash hover:text-gold transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight uppercase">{fullName}</h1>
            <p className="text-gold/50 text-sm mt-1 italic">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full ${statusConfig[checkin.status].className}`}
          >
            {statusConfig[checkin.status].label}
          </span>

          {!isReviewed && (
            <button
              onClick={markAsReviewed}
              disabled={marking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {marking ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              İncelendi Olarak İşaretle
            </button>
          )}
        </div>
      </header>

      {/* Before / After Görseller */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-ash/40">
          Görsel Karşılaştırma
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Önceki Hafta */}
          <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-white/[0.03] border border-white/8">
            {previousPhoto ? (
              <img
                src={previousPhoto}
                alt="Önceki Hafta"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-ash/20 font-serif italic text-sm">Önceki veri yok</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[10px] tracking-widest uppercase text-ash/50 font-bold">
                Önceki Hafta
              </p>
              {previousCheckin && (
                <p className="text-white/60 text-xs mt-0.5">
                  {new Date(previousCheckin.submittedAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Bu Hafta */}
          <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-white/[0.03] border border-gold/20">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Bu Hafta"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-ash/20 font-serif italic text-sm">Fotoğraf yok</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[10px] tracking-widest uppercase text-gold/70 font-bold">
                Bu Hafta
              </p>
              <p className="text-white/60 text-xs mt-0.5">{formattedDate}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrik Kartlar */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-ash/40">
          Vücut Metrikleri
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <DeltaCard
            label="Ağırlık"
            current={checkin.weight}
            previous={previousCheckin?.weight ?? null}
            unit="kg"
            icon={<Scale size={13} />}
          />
          <DeltaCard
            label="Yağ Oranı"
            current={checkin.bodyFat}
            previous={previousCheckin?.bodyFat ?? null}
            unit="%"
            icon={<Droplets size={13} />}
          />
        </div>
      </section>

      {/* Danışan Notu */}
      {checkin.notes && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold tracking-widest uppercase text-ash/40">
            Danışan Notu
          </h2>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <p className="text-white/70 font-light italic leading-relaxed">"{checkin.notes}"</p>
          </div>
        </section>
      )}

      {/* Trainer Feedback */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest uppercase text-ash/40 flex items-center gap-2">
          <MessageSquare size={12} />
          Antrenör Geri Bildirimi
        </h2>
        <div className="rounded-2xl border border-gold/15 bg-white/[0.02] p-6">
          {checkin.trainerNote ? (
            <p className="text-white/80 font-light italic leading-relaxed">
              "{checkin.trainerNote}"
            </p>
          ) : (
            <p className="text-ash/25 font-serif italic text-sm">
              Henüz geri bildirim girilmemiş.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
