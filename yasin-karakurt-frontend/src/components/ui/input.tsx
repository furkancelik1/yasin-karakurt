import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        /* Base */
        'flex h-11 w-full rounded border bg-obsidian/60 px-4 py-2',
        'text-sm text-ash-100 placeholder:text-ash-600',
        'transition-all duration-200 outline-none',
        /* Default border */
        'border-charcoal-50',
        /* Hover */
        'hover:border-gold/30',
        /* Focus */
        'focus:border-gold/60 focus:ring-2 focus:ring-gold/10',
        /* Error state */
        error && 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/10',
        /* Disabled */
        'disabled:cursor-not-allowed disabled:opacity-40',
        /* Autofill override */
        '[&:-webkit-autofill]:bg-charcoal',
        '[&:-webkit-autofill]:[-webkit-text-fill-color:#E5E5E5]',
        '[&:-webkit-autofill]:[transition:background-color_9999s_ease]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
