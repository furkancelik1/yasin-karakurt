"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Kendi auth hook'un
import { Users, ClipboardList, Dumbbell, Settings, BarChart } from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth(); // Kullanıcı rolünü alıyoruz

  // Role göre menü öğeleri
  const adminLinks = [
    { name: "Danışanlarım", href: "/dashboard/danisanlar", icon: Users },
    { name: "Gelen Check-inler", href: "/dashboard/checkinler", icon: ClipboardList },
    { name: "Paket Yönetimi", href: "/dashboard/paketler", icon: Dumbbell },
  ];

  const clientLinks = [
    { name: "Genel Bakış", href: "/dashboard", icon: BarChart },
    { name: "Gelişim Takibi", href: "/dashboard/gelisim", icon: ClipboardList },
    { name: "Antrenmanım", href: "/dashboard/program", icon: Dumbbell },
  ];

  const links = user?.role === "ADMIN" ? adminLinks : clientLinks;

  return (
    <aside className="w-64 min-h-screen bg-glass-dark border-r border-gold/10 p-6 flex flex-col gap-8">
      <div className="text-2xl font-serif text-gold tracking-widest">YK PLATFORM</div>
      
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-gold/10 text-gold border border-gold/20" 
                  : "text-ash/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={20} className={isActive ? "text-gold" : "text-ash/50"} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Çıkış Yap butonu vb. buraya eklenebilir */}
    </aside>
  );
};