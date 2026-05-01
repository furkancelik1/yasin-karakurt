import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title:      string;
  value:      string | number;
  subtitle?:  string;
  icon:       LucideIcon;
  progress?:  number;            // 0-100
  trend?:     { label: string; positive: boolean };
  accent?:    'gold' | 'green' | 'blue';
  className?: string;
}

const ACCENT = {
  gold:  { icon: 'text-gold',        ring: 'bg-gold/10',      bar: 'bg-gold',           border: 'hover:border-gold/25'  },
  green: { icon: 'text-emerald-400', ring: 'bg-emerald-500/10', bar: 'bg-emerald-400',  border: 'hover:border-emerald-500/25' },
  blue:  { icon: 'text-sky-400',     ring: 'bg-sky-500/10',    bar: 'bg-sky-400',       border: 'hover:border-sky-500/25'    },
};

export function StatCard({
  title, value, subtitle, icon: Icon, progress, trend, accent = 'gold', className,
}: StatCardProps) {
  const a = ACCENT[accent];

  return (
    <div className={cn(
      'group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-charcoal/40 p-5',
      'backdrop-blur-sm transition-all duration-300',
      a.border, 'hover:bg-charcoal/60',
      className
    )}>
      {/* İç parıltı hover'da */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,rgba(201,168,76,0.04),transparent)]" />

      {/* Başlık + ikon */}
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide uppercase text-ash-500">{title}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', a.ring)}>
          <Icon size={15} className={a.icon} />
        </div>
      </div>

      {/* Değer */}
      <div>
        <p className="font-display text-3xl font-bold text-white leading-none">{value}</p>
        {subtitle && (
          <p className="mt-1.5 text-xs text-ash-500">{subtitle}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="space-y-1.5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={cn('h-full rounded-full transition-all duration-700', a.bar)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-ash-600">{progress}% tamamlandı</p>
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className={cn(
          'inline-flex items-center gap-1 text-xs font-medium',
          trend.positive ? 'text-emerald-400' : 'text-red-400'
        )}>
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
