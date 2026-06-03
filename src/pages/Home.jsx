import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedCoffees from '@/components/landing/FeaturedCoffees';
import OriginsPreview from '@/components/landing/OriginsPreview';
import LoyaltyPreview from '@/components/landing/LoyaltyPreview';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedCoffees />
      <OriginsPreview />
      <LoyaltyPreview />
    </div>
  );
}