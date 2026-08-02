import React, { useState } from 'react';
import Hero from '@/components/Hero';
import ProductGallery from '@/components/ProductGallery';
import ProductDetailModal from '@/components/ProductDetailModal';
import HomeVideoSection from '@/components/HomeVideoSection';
import NewsletterSignup from '@/components/NewsletterSignup';
import LeaderboardPreview from '@/components/LeaderboardPreview';
import CaptainSpotlight from '@/components/CaptainSpotlight';
import DonationCard from '@/components/DonationCard';
import CommunityHint from '@/components/CommunityHint';
import TiltSection from '@/components/TiltSection';

const HEX_BG = 'https://media.base44.com/images/public/6a5139318a957c718bd166bb/028d7bbbc_Gemini_Generated_Image_a664rta664rta6641.png';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="relative">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.15]"
        style={{ backgroundImage: `url(${HEX_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      />
      <div className="relative z-10">
        <Hero />
        <TiltSection><HomeVideoSection /></TiltSection>
        <TiltSection><LeaderboardPreview /></TiltSection>
        <TiltSection className="px-6 md:px-12 pb-8">
          <div className="max-w-7xl mx-auto">
            <CaptainSpotlight />
          </div>
        </TiltSection>
        <TiltSection><NewsletterSignup /></TiltSection>
        <TiltSection><ProductGallery onSelect={setSelectedProduct} /></TiltSection>
        <TiltSection className="px-6 md:px-12 pb-24">
          <div className="max-w-3xl mx-auto">
            <DonationCard />
          </div>
        </TiltSection>
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
      <CommunityHint />
    </div>
  );
}