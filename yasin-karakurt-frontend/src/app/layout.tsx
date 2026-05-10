import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import '@/app/globals.css';
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Yasin Karakurt Coaching | Premium Fitness Management',
    template: '%s | Yasin Karakurt Coaching',
  },
  description:
    'Bilimsel antrenman metodolojisi ve bireysel beslenme programlariyla vucudunu donustur.',
  keywords: ['personal trainer', 'fitness', 'antrenman', 'beslenme', 'yasin karakurt'],
  authors: [{ name: 'Yasin Karakurt' }],
  creator: 'Yasin Karakurt',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    title: 'Yasin Karakurt Coaching | Premium Fitness Management',
    description: 'Bilimsel antrenman metodolojisi ile vucudunu donustur.',
    siteName: 'Yasin Karakurt Coaching',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yasin Karakurt Coaching | Premium Fitness Management',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            classNames: {
              toast:   'glass-dark border border-white/10 text-ash-100',
              success: '!border-gold/30',
              error:   '!border-red-500/30',
            },
          }}
        />
      </body>
    </html>
  );
}
