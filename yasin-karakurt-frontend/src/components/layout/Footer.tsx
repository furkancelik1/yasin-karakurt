import Link from 'next/link';
import { Instagram, Youtube, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Programlar',    href: '#programlar' },
    { label: 'Beslenme',      href: '#beslenme'   },
    { label: 'Başarı Hikayeleri', href: '#basarilar' },
    { label: 'Fiyatlar',      href: '#fiyatlar'   },
  ],
  Hesap: [
    { label: 'Üye Ol',   href: '/uye-ol' },
    { label: 'Giriş',    href: '/giris'  },
    { label: 'Panel',    href: '/panel'  },
  ],
  Yasal: [
    { label: 'Gizlilik Politikası', href: '/gizlilik' },
    { label: 'Kullanım Şartları',   href: '/kosullar' },
    { label: 'KVKK',                href: '/kvkk'     },
  ],
};

const SOCIALS = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube,   href: 'https://youtube.com',   label: 'YouTube'   },
  { icon: Mail,      href: 'mailto:info@yasinkarakurt.com', label: 'E-Posta' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-obsidian-100">
      <div className="section-padding mx-auto max-w-7xl py-16 md:py-20">
        {/* Top row */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="group flex flex-col leading-none mb-4">
              <span className="font-display text-2xl font-bold text-white group-hover:text-gold transition-colors duration-300">
                YASIN KARAKURT
              </span>
              <span className="text-[10px] tracking-luxury text-gold/70 uppercase mt-1">
                Personal Training
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash-400">
              Hedefe odaklı, bilimsel tabanlı antrenman ve beslenme programlarıyla
              potansiyelinizin sınırlarını zorluyoruz.
            </p>
            <div className="mt-6 flex gap-4">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-ash-400 transition-all duration-300 hover:border-gold/50 hover:text-gold hover:shadow-gold-soft"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-4 text-[10px] font-semibold tracking-luxury uppercase text-gold/80">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ash-400 transition-colors duration-200 hover:text-ash-100"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-ash-500 md:flex-row">
          <p>© {new Date().getFullYear()} Yasin Karakurt. Tüm hakları saklıdır.</p>
          <p className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold/60" />
            Türkiye&apos;nin premium kişisel antrenörlük platformu
          </p>
        </div>
      </div>
    </footer>
  );
}
