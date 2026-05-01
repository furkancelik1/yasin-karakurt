'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':          'Genel Bakış',
  '/dashboard/program':  'Antrenman Programım',
  '/dashboard/beslenme': 'Beslenme Planı',
  '/dashboard/gelisim':  'Gelişim Takibi',
  '/dashboard/ayarlar':  'Ayarlar',
};

export function Topbar() {
  const pathname             = usePathname();
  const router               = useRouter();
  const { user, logout }     = useAuth();
  const [menuOpen, setMenu]  = useState(false);

  const pageTitle = ROUTE_LABELS[pathname] ?? 'Dashboard';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.profile
    ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email ?? 'Kullanıcı';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-obsidian/90 px-6 backdrop-blur-lg">

      {/* ── Sol: sayfa başlığı ── */}
      <div>
        <h1 className="font-display text-lg font-semibold text-white">{pageTitle}</h1>
      </div>

      {/* ── Sağ: aksiyonlar ── */}
      <div className="flex items-center gap-3">

        {/* Bildirim zili */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 text-ash-500 transition-all duration-200 hover:border-gold/20 hover:text-gold">
          <Bell size={16} />
          {/* Okunmamış badge */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>

        {/* Kullanıcı menüsü */}
        <div className="relative">
          <button
            onClick={() => setMenu((p) => !p)}
            className={cn(
              'flex items-center gap-2.5 rounded-lg border px-3 py-1.5 transition-all duration-200',
              menuOpen
                ? 'border-gold/30 bg-gold/5'
                : 'border-white/5 hover:border-gold/20 hover:bg-white/3'
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-[11px] font-bold text-gold font-display">
              {initials}
            </div>
            <span className="hidden sm:block text-sm text-ash-200 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={14}
              className={cn('text-ash-500 transition-transform duration-200', menuOpen && 'rotate-180')}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />

                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,   scale: 1    }}
                  exit={{    opacity: 0, y: -6, scale: 0.97  }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-white/8 bg-charcoal/95 p-1.5 shadow-dark-card backdrop-blur-xl"
                >
                  {/* Kullanıcı bilgisi */}
                  <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                    <p className="text-sm font-medium text-ash-100 truncate">{displayName}</p>
                    <p className="text-xs text-ash-500 truncate mt-0.5">{user?.email}</p>
                  </div>

                  {[
                    { icon: User,     label: 'Profilim',  href: '/dashboard/ayarlar' },
                    { icon: Settings, label: 'Ayarlar',   href: '/dashboard/ayarlar' },
                  ].map(({ icon: Icon, label, href }) => (
                    <button
                      key={label}
                      onClick={() => { router.push(href); setMenu(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ash-400 hover:text-ash-100 hover:bg-white/4 transition-all duration-150"
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}

                  <div className="mt-1 border-t border-white/5 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ash-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
                    >
                      <LogOut size={14} />
                      Çıkış Yap
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
