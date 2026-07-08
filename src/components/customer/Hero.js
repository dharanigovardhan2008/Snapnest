'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  // Wait for client to mount to avoid hydration mismatch with animations
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-32 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex items-center overflow-hidden">
      
      {/* Subtle Studio Lighting (Warm wash, not a colorful blob) */}
      <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-[#FFF8F0] rounded-full blur-[120px] pointer-events-none -z-20 opacity-70" />

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
        
        {/* Left Side: Typography & Action */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 z-10"
        >
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-studio-grey border border-studio-grey text-[13px] font-bold text-ink-black tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Studio is taking orders
          </div>

          <div className="space-y-5">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-ink-black font-[family-name:var(--font-outfit)] tracking-tight">
              Print your <br />
              <span className="text-[#8B7355] italic font-medium">digital gallery</span> <br />
              into reality.
            </h1>
            <p className="text-lg lg:text-xl text-ink-muted max-w-md font-body leading-relaxed">
              Premium photo prints, polaroids, and posters. Transform your favorite moments into tactile memories you can hold.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto bg-white border border-[#E2E8F0] shadow-glass rounded-full p-2 pr-2 pl-6 transition-all hover:border-[#CBD5E1]">
              <ImageIcon size={20} className="text-ink-muted shrink-0" />
              <input
                type="text"
                placeholder="Upload a photo..."
                className="outline-none bg-transparent font-body text-ink-black placeholder:text-ink-muted/60 w-full sm:w-56 text-[15px]"
                readOnly
              />
              <button className="bg-ink-black hover:bg-[#1E293B] text-white rounded-full px-6 py-3.5 font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 shadow-md">
                Preview <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Social Proof to anchor the left side */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#F1F5F9] max-w-md">
            <div className="flex -space-x-3">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
              ].map((src, i) => (
                <img key={i} src={src} alt="Customer" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-[13px] font-medium text-ink-muted mt-0.5">Loved by 10,000+ customers</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: The Photo Wall Moment */}
        <div className="relative h-[550px] w-full flex items-center justify-center">
          
          {/* The String (Drawn with a subtle SVG so it looks real) */}
          <div className="absolute top-[35%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent z-0" />
          
          {/* Subtle wall shadow under the string */}
          <div className="absolute top-[35%] left-0 w-full h-[20px] bg-gradient-to-b from-black/[0.02] to-transparent z-0" />

          <div className="relative w-full max-w-lg h-full flex justify-center items-start pt-[15%]">
            
            {/* Background Polaroid 1 (Left) */}
            <motion.div 
              initial={{ opacity: 0, rotate: -6 }}
              animate={{ opacity: 1, rotate: -6 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute left-0 lg:-left-4 top-[15%] w-36 sm:w-44 bg-white p-3 pb-12 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] rounded-sm z-0 group hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-5 bg-white border border-[#E2E8F0] rounded-[2px] shadow-sm z-20" />
              <div className="w-full aspect-square bg-[#F8FAFC] border border-[#F1F5F9] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=400&auto=format&fit=crop" alt="Memory" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
            </motion.div>

            {/* Background Polaroid 2 (Right) */}
            <motion.div 
              initial={{ opacity: 0, rotate: 8 }}
              animate={{ opacity: 1, rotate: 8 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="absolute right-0 lg:-right-4 top-[25%] w-40 sm:w-48 bg-white p-3.5 pb-14 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] rounded-sm z-0 group hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-5 bg-white border border-[#E2E8F0] rounded-[2px] shadow-sm z-20" />
              <div className="w-full aspect-[4/5] bg-[#F8FAFC] border border-[#F1F5F9] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400&auto=format&fit=crop" alt="Memory" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
            </motion.div>

            {/* The Hero Polaroid (Drops in and Snaps) */}
            {mounted && (
              <motion.div
                initial={{ y: -300, opacity: 0, rotate: -12 }}
                animate={{ y: 0, opacity: 1, rotate: 2 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 90, 
                  damping: 12, 
                  mass: 1.2,
                  delay: 0.6 
                }}
                className="relative w-56 sm:w-64 bg-white p-4 pb-16 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] rounded-sm z-20 origin-top mt-10"
              >
                {/* The Clip (animates snapping on) */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.2 }}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-7 bg-white border border-[#E2E8F0] rounded-[2px] shadow-md z-30"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-px bg-[#CBD5E1]" />
                </motion.div>

                {/* The Photo (Fades in beautifully after snap) */}
                <div className="w-full aspect-square bg-[#F8FAFC] overflow-hidden relative border border-[#F1F5F9]">
                  <motion.div 
                    initial={{ opacity: 0, scale: 1.1, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ delay: 1.1, duration: 1, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    {/* High quality vibrant memory image */}
                    <img 
                      src="https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?q=80&w=600&auto=format&fit=crop" 
                      alt="Your Print" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  {/* Subtle glass glare overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}