'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Palette, ImageIcon } from 'lucide-react';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import { useProducts } from '../../hooks/useProducts';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';

export default function ProductsPage() {
  const { products, loading } = useProducts();

  // Legacy pricing map for your original items
  const pricingData = {
    'polaroid': { original: 20, final: 10 },
    'polaroid-custom': { original: 25, final: 20 },
    'poster-a5': { original: 40, final: 30 },
    'poster-a5-custom': { original: 50, final: 40 },
    'poster-a3': { original: 70, final: 60 },
    'poster-a3-custom': { original: 100, final: 70 },
  };

  // Helper to dynamically calculate pricing for NEW products added via Admin panel
  const getProductPricing = (product) => {
    if (pricingData[product.id]) return pricingData[product.id];
    
    // For newly created products: auto-generate a 20% markup for the "Original" price to show a discount
    const originalPrice = Math.round(product.price * 1.20);
    return {
      original: originalPrice,
      final: product.price
    };
  };

  // Upgraded Visuals: Automatically uses uploaded images if they exist!
  const getProductVisual = (product) => {
    const isCustom = product.type === 'custom';
    
    const standardGradient = "from-blue-400/30 via-indigo-300/30 to-purple-300/30";
    const customGradient = "from-rose-400/30 via-pink-300/30 to-amber-200/30";
    const activeGradient = isCustom ? customGradient : standardGradient;

    // 1. IF THE ADMIN UPLOADED A REAL PHOTO: Display it beautifully
    if (product.imageUrl) {
      return {
        badge: isCustom ? 'Custom Design' : 'Premium Print',
        icon: isCustom ? <Palette size={14} className="text-[#E11D48]" /> : <Sparkles size={14} className="text-[#2563EB]" />,
        visual: (
          <div className="relative w-full h-56 flex items-center justify-center transform group-hover:-translate-y-4 transition-transform duration-700 ease-[0.16,1,0.3,1]">
            <div className="absolute w-44 h-52 bg-white rounded-[20px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-[#F1F5F9] p-2.5 transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 group-hover:rotate-2">
              <div className="w-full h-full bg-[#F8FAFC] rounded-[12px] relative overflow-hidden border border-[#E2E8F0]/50">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )
      };
    }

    // 2. IF NO PHOTO WAS UPLOADED: Fallback to the CSS Mockups based on name/id
    const id = product.id.toLowerCase();
    const name = product.name.toLowerCase();

    if (id.includes('polaroid') || name.includes('polaroid')) {
      return {
        badge: isCustom ? 'Custom Design' : 'Bestseller',
        icon: isCustom ? <Palette size={14} className="text-[#E11D48]" /> : <Sparkles size={14} className="text-[#2563EB]" />,
        visual: (
          <div className="relative w-full h-56 flex items-center justify-center transform group-hover:-translate-y-4 transition-transform duration-700 ease-[0.16,1,0.3,1]">
            <div className="absolute w-32 h-40 bg-white rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2.5 pb-10 -rotate-6 opacity-60 translate-y-2 border border-[#F1F5F9]" />
            <div className="absolute w-36 h-44 bg-white rounded-[16px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] border border-[#F1F5F9] p-3 pb-12 rotate-3 group-hover:rotate-6 transition-transform duration-700 ease-[0.16,1,0.3,1]">
              <div className="w-full h-full bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]/50 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-tr ${activeGradient} opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-[0.16,1,0.3,1]`} />
              </div>
            </div>
          </div>
        )
      };
    }

    if (id.includes('poster-a5') || name.includes('a5')) {
      return {
        badge: isCustom ? 'Custom Design' : null,
        icon: isCustom ? <Palette size={14} className="text-[#E11D48]" /> : null,
        visual: (
          <div className="relative w-full h-56 flex items-center justify-center transform group-hover:-translate-y-4 transition-transform duration-700 ease-[0.16,1,0.3,1]">
            <div className="absolute w-32 h-44 bg-white rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#F1F5F9] translate-x-2 -rotate-2 opacity-60" />
            <div className="absolute w-32 h-44 bg-white rounded-[16px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] border border-[#F1F5F9] p-1.5 rotate-1 group-hover:-rotate-2 transition-transform duration-700 ease-[0.16,1,0.3,1]">
              <div className="w-full h-full bg-[#F8FAFC] rounded-[10px] relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${isCustom ? customGradient : 'from-emerald-400/30 via-teal-300/30 to-blue-400/30'} opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-[0.16,1,0.3,1]`} />
              </div>
            </div>
          </div>
        )
      };
    }

    // Default Fallback for new products without photos
    return {
      badge: isCustom ? 'Custom Premium' : 'Gallery Size',
      icon: isCustom ? <Palette size={14} className="text-[#E11D48]" /> : <Sparkles size={14} className="text-[#2563EB]" />,
      visual: (
        <div className="relative w-full h-56 flex items-center justify-center transform group-hover:-translate-y-4 transition-transform duration-700 ease-[0.16,1,0.3,1]">
          <div className="absolute w-40 h-48 bg-white rounded-[16px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-[#F1F5F9] p-2 transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105">
            <div className="w-full h-full bg-[#F8FAFC] rounded-[10px] relative overflow-hidden border border-[#E2E8F0]/30 flex items-center justify-center">
              <div className={`absolute inset-0 bg-gradient-to-bl ${isCustom ? customGradient : 'from-rose-300/30 via-orange-200/30 to-amber-100/30'} opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-[0.16,1,0.3,1]`} />
              <ImageIcon size={32} className="text-[#94A3B8] z-10" />
            </div>
          </div>
        </div>
      )
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist)] selection:bg-[#2563EB]/10 selection:text-[#0F172A]">
      <Navigation />
      
      <main className="pt-40 pb-32">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] tracking-tight font-[family-name:var(--font-outfit)]">
              The Studio Catalog
            </h1>
            <p className="text-[19px] text-[#64748B] leading-relaxed font-light">
              Select your format. Standard prints for your daily memories, or Custom layouts to build your own masterpiece.
            </p>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-32 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          /* Product Grid */
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => {
                const layout = getProductVisual(product);
                const pricing = getProductPricing(product);
                const discountPercent = Math.round(((pricing.original - pricing.final) / pricing.original) * 100);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link 
                      href={`/order?product=${product.id}`}
                      className="group flex flex-col h-full items-center justify-between p-10 bg-[#FFFFFF] rounded-[40px] border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden"
                    >
                      {/* Top Badges */}
                      <div className="w-full flex justify-between items-start z-20 pointer-events-none mb-4">
                        {layout.badge ? (
                          <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2 rounded-full text-[13px] font-medium text-[#0F172A] border border-[#E2E8F0]">
                            {layout.icon}
                            {layout.badge}
                          </div>
                        ) : <div />}
                        
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[13px] font-bold tracking-wide">
                          {discountPercent}% OFF
                        </div>
                      </div>

                      {/* Visual Mockup Container */}
                      <div className="mb-6 w-full z-10">
                        {layout.visual}
                      </div>

                      {/* Content & Pricing */}
                      <div className="text-center space-y-3 mb-10 w-full z-10 flex-grow flex flex-col justify-end">
                        <h3 className="text-[26px] font-semibold text-[#0F172A] capitalize font-[family-name:var(--font-outfit)] tracking-tight">
                          {product.name || product.id.replace('-', ' ')}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-[17px] font-medium text-[#94A3B8] line-through decoration-[#CBD5E1]">
                            ₹{pricing.original}
                          </span>
                          <span className="text-[32px] font-bold text-[#0F172A] tracking-tighter">
                            ₹{pricing.final}
                          </span>
                        </div>
                      </div>

                      {/* Order Button */}
                      <div className="w-full text-center py-4 rounded-full bg-[#0F172A] text-white font-medium text-[16px] group-hover:bg-[#2563EB] group-hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] group-hover:scale-[1.02] active:scale-95 transition-all duration-300 z-10">
                        Configure & Print
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}