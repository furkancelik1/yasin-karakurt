'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, color = 'bg-gold', className = '' }: ProgressBarProps) {
  const prevValue = useRef(value);
  const [glowing, setGlowing] = useState(false);
  const isComplete = value >= 100;

  useEffect(() => {
    if (value !== prevValue.current) {
      setGlowing(true);
      const timer = setTimeout(() => setGlowing(false), 600);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const glowColor = isComplete ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.3)';

  return (
    <div className={`w-full bg-white/10 h-1 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={
          isComplete
            ? { width: '100%', opacity: [1, 0.6, 1], scaleX: [1, 1.02, 1] }
            : { width: `${Math.min(value, 100)}%` }
        }
        transition={
          isComplete
            ? {
                width: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                scaleX: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }
            : { width: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
        }
        style={{
          boxShadow: glowing
            ? `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`
            : isComplete
              ? `0 0 5px ${glowColor}`
              : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      />
    </div>
  );
}
