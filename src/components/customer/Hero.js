'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  // Wait for client to mount to avoid hydration mismatch with animations
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-32 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Typography & Action */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 z-10"
        >
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-ink-black">
              Print your<br />
              <span className="text-ink-muted">digital gallery</span><br />
              into reality.
            </h1>
            <p className="text-lg lg:text-xl text-ink-muted max-w-md font-body leading-relaxed">
              Premium photo prints, polaroids, and posters. Transform your favorite moments into tactile memories you can hold.
            </p>
          </div>

          {/* New Pill Action Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <div className="flex items-center gap-3 w-full sm:w-auto bg-white border border-studio-border shadow-soft rounded-pill p-2 pr-2 pl-6">
              <ImageIcon size={20} className="text-ink-muted" />
              <input
                type="text"
                placeholder="Upload a photo to preview..."
                className="outline-none bg-transparent font-body text-ink-black placeholder:text-ink-muted/60 w-full sm:w-64"
                readOnly
              />
              <button className="bg-ink-black hover:bg-brand-primary text-white rounded-pill px-6 py-3 font-semibold transition-colors flex items-center gap-2 shrink-0">
                Preview <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Side: The Photo Wall Moment */}
        <div className="relative h-[500px] w-full flex items-center justify-center">
          {/* The String */}
          <div className="absolute top-1/3 left-0 w-full photo-wall-string -z-10" />

          <div className="relative w-full max-w-md h-full flex justify-center items-start pt-[20%]">
            
            {/* Existing Background Polaroid 1 */}
            <motion.div 
              initial={{ opacity: 0, rotate: -4 }}
              animate={{ opacity: 1, rotate: -4 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute left-4 top-[15%] w-40 bg-white p-3 pb-10 shadow-polaroid rounded-sm z-0"
            >
              {/* The Clip */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-6 bg-white border border-studio-border rounded-sm shadow-sm z-20" />
              <div className="w-full aspect-square bg-studio-grey border border-studio-border/50" />
            </motion.div>

            {/* Existing Background Polaroid 2 */}
            <motion.div 
              initial={{ opacity: 0, rotate: 6 }}
              animate={{ opacity: 1, rotate: 6 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="absolute right-0 top-[30%] w-48 bg-white p-3.5 pb-12 shadow-polaroid rounded-sm z-0"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-6 bg-white border border-studio-border rounded-sm shadow-sm z-20" />
              <div className="w-full aspect-square bg-studio-grey border border-studio-border/50" />
            </motion.div>

            {/* The Hero Polaroid (Drops in and Snaps) */}
            {mounted && (
              <motion.div
                initial={{ y: -300, opacity: 0, rotate: -15 }}
                animate={{ y: 0, opacity: 1, rotate: 2 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 120, 
                  damping: 14, 
                  mass: 1.2,
                  delay: 0.6 
                }}
                className="relative w-64 bg-white p-4 pb-16 shadow-polaroid rounded-sm z-10 origin-top"
              >
                {/* The Clip (animates snapping on) */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.2 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-7 bg-white border border-studio-border rounded-sm shadow-sm z-20"
                >
                  {/* Clip hinge detail */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-ink-muted/30" />
                </motion.div>

                {/* The Photo (Fades in after snap) */}
                <div className="w-full aspect-square bg-studio-grey overflow-hidden relative border border-studio-border/50">
                  <motion.div 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center text-ink-muted/40 font-heading text-sm"
                  >
                    Your Photo Here
                  </motion.div>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}