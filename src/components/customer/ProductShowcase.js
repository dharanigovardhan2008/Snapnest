'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ProductShowcase() {
  const { products, loading } = useProducts();

  // Map the exact prices you provided
  const pricingData = {
    'polaroid': { original: 20, final: 10 },
    'polaroid-custom': { original: 25, final: 20 },
    'poster-a5': { original: 40, final: 30 },
    'poster-a5-custom': { original: 50, final: 40 },
    'poster-a3': { original: 70, final: 60 },
    'poster-a3-custom': { original: 100, final: 70 },
  };

  // Premium Tactile Illustrations with Paper Depth & Cinematic Reveal
  const productIllustrations = {
    'polaroid': {
      title: 'Polaroid Prints',
      badge: 'Bestseller',
      visual: (
        <div className="relative w-full h-48 flex items-center justify-center transform group-hover:-translate-y-3 transition-transform duration-500 ease-[0.16,1,0.3,1]">
          {/* Back Polaroid */}
          <div className="absolute w-28 h-32 bg-white shadow-polaroid rounded-sm p-2 pb-8 -rotate-6 opacity-40 translate-y-2" />
          
          {/* Front Polaroid */}
          <div className="absolute w-32 h-36 bg-white shadow-polaroid rounded-sm p-2.5 pb-9 rotate-3 group-hover:rotate-6 transition-transform duration-500">
            {/* The Paper Area (with inner shadow for depth) */}
            <div className="w-full h-full bg-studio-grey border border-studio-border/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] relative overflow-hidden">
              {/* Photo Reveal (Scales down and fades in) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/50 via-purple-400/40 to-orange-300/50 opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out" />
            </div>
            {/* Gloss Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </div>
      )
    },
    'poster-a5': {
      title: 'A5 Posters',
      badge: null,
      visual: (
        <div className="relative w-full h-48 flex items-center justify-center transform group-hover:-translate-y-3 transition-transform duration-500 ease-[0.16,1,0.3,1]">
          {/* Back Paper */}
          <div className="absolute w-28 h-40 bg-white shadow-polaroid border border-studio-border rounded-sm translate-x-2 -rotate-2 opacity-50" />
          
          {/* Front Poster */}
          <div className="absolute w-28 h-40 bg-white shadow-polaroid border border-white p-1 rounded-sm rotate-1 group-hover:-rotate-2 transition-transform duration-500">
            <div className="w-full h-full bg-studio-grey shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 via-teal-300/40 to-blue-400/40 opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out" />
            </div>
          </div>
        </div>
      )
    },
    'poster-a3': {
      title: 'A3 Posters',
      badge: 'Premium Size',
      visual: (
        <div className="relative w-full h-48 flex items-center justify-center transform group-hover:-translate-y-3 transition-transform duration-500 ease-[0.16,1,0.3,1]">
          {/* Large Poster */}
          <div className="absolute w-36 h-44 bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-white p-1.5 rounded-sm transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-full bg-studio-grey shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-rose-400/40 via-orange-300/40 to-amber-200/40 opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out" />
            </div>
          </div>
        </div>
      )
    }
  };

  if (loading) {
    return (
      <section className="py-32 bg-studio-grey/50">
        <div className="max-w-7xl mx-auto text-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  const displayProducts = [
    products.find(p => p.id === 'polaroid') || products[0],
    products.find(p => p.id === 'poster-a5') || products[2],
    products.find(p => p.id === 'poster-a3') || products[4]
  ].filter(Boolean);

  return (
    <section className="py-32 bg-studio-grey/50 relative overflow-hidden" id="products">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="mb-20 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-ink-black mb-5 tracking-tight">Formats crafted for your memories.</h2>
            <p className="text-xl text-ink-muted leading-relaxed">Museum-quality paper, vibrant colors, and tactile layouts designed to bring your digital gallery to life.</p>
          </div>
          <Link href="/products" className="hidden lg:inline-flex items-center gap-2 text-ink-black font-semibold hover:text-brand-primary transition-colors group">
            Explore catalog 
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayProducts.map((product, index) => {
            const visualKey = Object.keys(productIllustrations).find(k => product.id.includes(k)) || 'polaroid';
            const visual = productIllustrations[visualKey];
            
            const pricing = pricingData[product.id] || { original: product.price + 10, final: product.price };
            const discountPercent = Math.round(((pricing.original - pricing.final) / pricing.original) * 100);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link 
                  href={`/order?product=${product.id}`}
                  className="group block h-full flex flex-col items-center justify-between p-10 bg-white rounded-studio border border-studio-border shadow-soft hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-studio-grey/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Badges */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
                    {visual.badge ? (
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-ink-black border border-studio-border shadow-sm">
                        {visual.badge === 'Bestseller' && <Sparkles size={13} className="text-brand-primary" />}
                        {visual.badge}
                      </div>
                    ) : <div />}
                    
                    <div className="bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] px-3 py-1.5 rounded-full text-xs font-black shadow-sm tracking-wide">
                      {discountPercent}% OFF
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="mb-8 w-full z-10 mt-6">
                    {visual.visual}
                  </div>

                  {/* Content & Pricing */}
                  <div className="text-center space-y-4 mb-8 w-full z-10">
                    <h3 className="text-2xl font-bold text-ink-black">{visual.title}</h3>
                    
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-lg font-semibold text-ink-muted/70 line-through decoration-ink-muted/40">
                        ₹{pricing.original}
                      </span>
                      <span className="text-3xl font-black text-ink-black tracking-tighter">
                        ₹{pricing.final}
                      </span>
                    </div>
                  </div>

                  {/* Pre-colored Interactive Button */}
                  <div className="w-full text-center py-4 rounded-pill bg-ink-black text-white font-bold group-hover:bg-brand-primary group-hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] group-hover:-translate-y-1 transition-all duration-300 z-10">
                    Order Now
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center lg:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-ink-black font-semibold">
            Explore catalog <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
}