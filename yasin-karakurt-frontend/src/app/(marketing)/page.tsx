import type { Metadata } from 'next';
import { HeroSection }          from '@/components/sections/HeroSection';
import { AboutSection }         from '@/components/sections/AboutSection';
import { ProcessSection }       from '@/components/sections/ProcessSection';
import { TestimonialsSection }  from '@/components/sections/TestimonialsSection';
import { PricingSection }       from '@/components/sections/PricingSection';
import { CtaSection }           from '@/components/sections/CtaSection';

export const metadata: Metadata = {
  title: 'Yasin Karakurt | Premium Personal Training',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
    </>
  );
}
