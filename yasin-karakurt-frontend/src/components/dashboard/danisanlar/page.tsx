"use client";
import { useEffect, useState } from "react";
import { Search, MoreVertical, Activity } from "lucide-react";
import api from "@/lib/api";

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: { goal: string; weight: number };
}

export default function DanisanlarPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get("/users/clients");
        setClients(data.data);
      } catch (error) {
        console.error("Danışanlar getirilirken hata oluştu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto ml-64">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Danışanlarım</h1>
          <p className="text-ash/60 mt-2">Sistemdeki tüm aktif öğrencilerin ve temel durumları.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ash/50" size={18} />
          <input 
            type="text"
            placeholder="İsim veya e-posta ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-charcoal border border-gold/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-ash/50 focus:border-gold/50 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-glass-dark rounded-2xl border border-gold/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gold/10 bg-black/40 text-ash/70 text-sm tracking-wide">
                <th className="p-5 font-medium">Ad Soyad</th>
                <th className="p-5 font-medium">İletişim</th>
                <th className="p-5 font-medium">Hedef / Güncel Kilo</th>
                <th className="p-5 font-medium">Kayıt Tarihi</th>
                <th className="p-5 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gold animate-pulse">Veriler yükleniyor...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-ash/50">Eşleşen danışan bulunamadı.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 font-medium text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold">
                        {client.name ? client.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      {client.name || "İsimsiz Kullanıcı"}
                    </td>
                    <td className="p-5 text-ash/70">{client.email}</td>
                    <td className="p-5">
                      {client.profile ? (
                        <div className="flex flex-col">
                          <span className="text-white text-sm">{client.profile.goal || "Belirtilmedi"}</span>
                          <span className="text-ash/50 text-xs">{client.profile.weight ? `${client.profile.weight} kg` : "-"}</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium">
                          Profil Eksik
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-ash/70 text-sm">
                      {new Date(client.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-5 text-right">
                      <button className="p-2 text-ash/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}