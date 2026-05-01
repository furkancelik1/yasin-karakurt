'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        // Altın CTA — birincil eylem
        gold: [
          'bg-gold text-obsidian tracking-luxury uppercase text-xs',
          'hover:bg-gold-200 hover:shadow-gold-glow',
          'active:scale-[0.98]',
        ],
        // Altın çerçeve
        'gold-outline': [
          'border border-gold/50 text-gold tracking-luxury uppercase text-xs',
          'hover:border-gold hover:bg-gold/10 hover:shadow-gold-soft',
        ],
        // Saydam / cam efektli
        ghost: 'text-ash-200 hover:text-white hover:bg-charcoal-50',
        // Yıkıcı
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        // Düz
        default: 'bg-charcoal text-ash-100 hover:bg-charcoal-50',
      },
      size: {
        sm:   'h-9  px-5  text-xs  rounded-sm',
        md:   'h-11 px-8  text-sm  rounded',
        lg:   'h-12 px-10 text-sm  rounded',
        xl:   'h-14 px-12 text-base rounded',
        icon: 'h-10 w-10 rounded',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
