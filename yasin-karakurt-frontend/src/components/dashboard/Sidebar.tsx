"use client";
import { useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Users, ClipboardList, Dumbbell, Settings, BarChart, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isTrainerOrAdmin = user?.role === "TRAINER" || user?.role === "ADMIN";

  const trainerLinks = [
    { name: "Danışanlar", href: "/danisanlar", icon: Users },
    { name: "Check-inler", href: "/checkins", icon: ClipboardList },
  ];

  const clientLinks = [
    { name: "Genel Bakış", href: "/dashboard", icon: BarChart },
    { name: "Gelişim Takibi", href: "/dashboard/gelisim", icon: ClipboardList },
    { name: "Antrenmanım", href: "/dashboard/program", icon: Dumbbell },
    { name: "Beslenme", href: "/dashboard/beslenme", icon: ClipboardList },
  ];

  const links = isTrainerOrAdmin ? trainerLinks : clientLinks;

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-charcoal border-b border-gold/10 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-gold hover:bg-gold/10 transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="text-lg font-serif text-gold tracking-widest">YK PLATFORM</span>
        <div className="w-10" />
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 min-h-screen bg-charcoal border-r border-gold/10 p-6 flex-col justify-between fixed left-0 top-0 z-50">
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 w-72 min-h-screen bg-charcoal border-r border-gold/10 p-6 flex flex-col justify-between z-50 md:hidden"
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="text-xl font-serif text-gold tracking-widest">
                  YK PLATFORM
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-ash/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-2">
                {links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.name}
                      onClick={() => handleLinkClick(link.href)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 text-left ${
                        isActive 
                          ? "bg-gold/10 text-gold border border-gold/20" 
                          : "text-ash/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={22} className={isActive ? "text-gold" : "text-ash/50"} />
                      <span className="font-medium text-lg">{link.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2">
              <Link 
                href="/dashboard/ayarlar"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-ash/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <Settings size={22} className="text-ash/50" />
                <span className="font-medium">Ayarlar</span>
              </Link>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={22} />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};