"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Users, ClipboardList, Dumbbell, Settings, BarChart, LogOut } from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth(); // Zustand store'dan user ve logout'u alıyoruz

  const adminLinks = [
    { name: "Danışanlarım", href: "/dashboard/danisanlar", icon: Users },
    { name: "Gelen Check-inler", href: "/dashboard/checkinler", icon: ClipboardList },
    { name: "Paket Yönetimi", href: "/dashboard/paketler", icon: Dumbbell },
  ];

  const clientLinks = [
    { name: "Genel Bakış", href: "/dashboard", icon: BarChart },
    { name: "Gelişim Takibi", href: "/dashboard/gelisim", icon: ClipboardList },
    { name: "Antrenmanım", href: "/dashboard/program", icon: Dumbbell },
    { name: "Beslenme", href: "/dashboard/beslenme", icon: ClipboardList },
  ];

  const links = user?.role === "ADMIN" ? adminLinks : clientLinks;

  return (
    <aside className="w-64 min-h-screen bg-charcoal border-r border-gold/10 p-6 flex flex-col justify-between fixed left-0 top-0 z-50">
      <div className="space-y-8">
        <div className="text-2xl font-serif text-gold tracking-widest text-center mt-4">
          YK PLATFORM
        </div>
        
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gold/10 text-gold border border-gold/20 shadow-[0_0_15px_rgba(201,168,76,0.1)]" 
                    : "text-ash/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-gold" : "text-ash/50"} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        <Link 
          href="/dashboard/ayarlar"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-ash/70 hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings size={20} className="text-ash/50" />
          <span className="font-medium">Ayarlar</span>
        </Link>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};