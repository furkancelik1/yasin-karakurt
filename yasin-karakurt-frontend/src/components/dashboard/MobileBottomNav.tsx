'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Salad, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Genel'      },
  { href: '/dashboard/program',  icon: Dumbbell,        label: 'Program'    },
  { href: '/dashboard/beslenme', icon: Salad,           label: 'Beslenme'   },
  { href: '/dashboard/gelisim',  icon: TrendingUp,      label: 'Gelişim'    },
  { href: '/dashboard/ayarlar',  icon: Settings,        label: 'Ayarlar'    },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/5 bg-obsidian/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                active ? 'text-gold' : 'text-ash-500 hover:text-ash-300'
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-gold/8" />
              )}
              <item.icon size={20} className="relative z-10" />
              <span className="relative z-10 text-[9px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
