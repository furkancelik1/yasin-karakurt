import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Dark-Luxe Temel Palet ──────────────────────────
        obsidian: {
          DEFAULT: '#0A0A0A',
          50:  '#1A1A1A',
          100: '#141414',
          200: '#0F0F0F',
          300: '#0A0A0A',
        },
        charcoal: {
          DEFAULT: '#1C1C1C',
          50:  '#2E2E2E',
          100: '#262626',
          200: '#1C1C1C',
          300: '#141414',
        },
        // ── Altın Vurgu ───────────────────────────────────
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#F5E9C8',
          100: '#EDD88A',
          200: '#D4AF37',
          300: '#C9A84C',
          400: '#B8962A',
          500: '#9A7B1E',
          600: '#7A6018',
        },
        // ── Nötr / Metin ──────────────────────────────────
        parchment: '#F5F0E8',
        ash: {
          DEFAULT: '#A3A3A3',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
        },
        // ── Shadcn CSS değişken uyumlu ────────────────────
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },

      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        '8xl': ['6rem',     { lineHeight: '1',    letterSpacing: '-0.02em' }],
        '9xl': ['8rem',     { lineHeight: '1',    letterSpacing: '-0.03em' }],
      },

      letterSpacing: {
        luxury:    '0.25em',
        widest:    '0.3em',
        tightest: '-0.04em',
      },

      backgroundImage: {
        'gradient-radial':     'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':      'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-shimmer':        'linear-gradient(105deg, #C9A84C 0%, #F5E9C8 50%, #C9A84C 100%)',
        'dark-vignette':       'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)',
        'hero-gradient':       'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.6) 60%, #0A0A0A 100%)',
      },

      boxShadow: {
        'gold-glow':  '0 0 30px rgba(201,168,76,0.25), 0 0 60px rgba(201,168,76,0.1)',
        'gold-soft':  '0 4px 20px rgba(201,168,76,0.15)',
        'dark-card':  '0 8px 32px rgba(0,0,0,0.6)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },

      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
      },

      animation: {
        'shimmer':        'shimmer 2.5s linear infinite',
        'fade-up':        'fadeUp 0.6s ease-out forwards',
        'fade-in':        'fadeIn 0.8s ease-out forwards',
        'pulse-gold':     'pulseGold 2s ease-in-out infinite',
        'border-flow':    'borderFlow 3s linear infinite',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(201,168,76,0.5)' },
        },
        borderFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
