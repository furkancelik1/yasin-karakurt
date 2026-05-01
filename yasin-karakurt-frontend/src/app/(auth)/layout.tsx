import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-obsidian px-4 py-16">

      {/* ── Arka plan efektleri ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Merkez üst altın parıltı */}
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gold/[0.08] blur-[120px]" />
        {/* Sol alt */}
        <div className="absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-gold/[0.04] blur-[80px]" />
        {/* Işın ızgara */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Radyal vinyeti */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_30%,rgba(10,10,10,0.9)_100%)]" />
      </div>

      {/* ── Logo ── */}
      <Link href="/" className="group relative z-10 mb-10 flex flex-col items-center leading-none">
        <span className="font-display text-2xl font-bold tracking-wide text-white transition-colors duration-300 group-hover:text-gold">
          YASIN KARAKURT
        </span>
        <span className="mt-1 text-[9px] tracking-luxury uppercase text-gold/60">
          Personal Training
        </span>
      </Link>

      {/* ── Sayfa içeriği ── */}
      <div className="relative z-10 w-full max-w-[440px]">
        {children}
      </div>

      {/* ── Alt not ── */}
      <p className="relative z-10 mt-10 text-center text-xs text-ash-600">
        © {new Date().getFullYear()} Yasin Karakurt · Tüm hakları saklıdır.
      </p>
    </div>
  );
}
