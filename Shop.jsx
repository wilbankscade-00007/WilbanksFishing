import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import ProductDetailModal from '@/components/ProductDetailModal';
import DonationCard from '@/components/DonationCard';

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <ProductGallery onSelect={setSelectedProduct} />
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

        <div className="mt-16">
          <DonationCard />
        </div>
      </div>
    </div>
  );
}