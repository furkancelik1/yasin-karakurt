'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '#hakkimda',   label: 'Hakkımda'    },
  { href: '#programlar', label: 'Programlar'  },
  { href: '#basarilar',  label: 'Başarılar'   },
  { href: '#iletisim',   label: 'İletişim'    },
];

export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass-dark border-b border-white/5 py-3'
          : 'bg-transparent py-6'
      )}
    >
      <nav className="section-padding mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-xl font-bold tracking-wide text-white group-hover:text-gold transition-colors duration-300">
            YASIN KARAKURT
          </span>
          <span className="text-[10px] tracking-luxury text-gold/70 uppercase">
            Personal Training
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs tracking-luxury uppercase text-ash-300 hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/giris">
            <Button variant="ghost" size="sm">Giriş</Button>
          </Link>
          <Link href="/uye-ol">
            <Button variant="gold" size="sm">Başla</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ash-200 hover:text-gold transition-colors"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Menü"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-dark border-t border-white/5"
          >
            <ul className="section-padding flex flex-col gap-5 py-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm tracking-luxury uppercase text-ash-200 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <Link href="/giris"  onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="md" className="w-full">Giriş</Button>
                </Link>
                <Link href="/uye-ol" onClick={() => setMenuOpen(false)}>
                  <Button variant="gold"  size="md" className="w-full">Başla</Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
