import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-luxury uppercase transition-colors',
  {
    variants: {
      variant: {
        gold:    'border-gold/40 bg-gold/10 text-gold',
        outline: 'border-white/20 text-ash-300',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      },
    },
    defaultVariants: { variant: 'gold' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
