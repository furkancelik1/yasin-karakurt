import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Beslenme Planı' };

export default function BeslenmePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/5 bg-charcoal/40 p-8 text-center">
        <p className="font-display text-xl text-white mb-2">Beslenme Planı</p>
        <p className="text-sm text-ash-500">Bu bölüm yakında aktif olacak.</p>
      </div>
    </div>
  );
}
