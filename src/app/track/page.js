'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Package, Fingerprint } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }
    router.push(`/track/${orderId.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist)] selection:bg-[#0F172A]/10 selection:text-[#0F172A] flex flex-col relative overflow-hidden">
      
      {/* --- STUDIO BACKGROUND & DECORATION --- */}
      {/* Subtle Studio Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white rounded-full blur-[100px] pointer-events-none opacity-80" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Floating Polaroids (Abstract) */}
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [-6, -4, -6] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] w-32 h-40 bg-white/40 backdrop-blur-md rounded-[12px] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 pointer-events-none hidden lg:block"
      >
        <div className="w-full h-28 bg-[#F1F5F9]/50 rounded-[8px]" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [8, 10, 8] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[25%] right-[12%] w-28 h-36 bg-white/40 backdrop-blur-md rounded-[12px] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 pointer-events-none hidden lg:block"
      >
        <div className="w-full h-24 bg-blue-50/50 rounded-[8px]" />
      </motion.div>
      {/* -------------------------------------- */}

      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 flex items-center justify-center relative z-10">
        <div className="w-full max-w-[640px] px-6">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            {/* Premium Radar Pin */}
            <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 duration-[3000ms]" />
              <div className="absolute inset-2 bg-blue-100/50 rounded-full animate-pulse opacity-50" />
              <div className="relative w-20 h-20 bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full flex items-center justify-center text-[#0F172A] z-10">
                <MapPin size={32} strokeWidth={1.5} className="text-[#0F172A]" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-[56px] font-bold mb-5 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight leading-none">
              Track Order
            </h1>
            <p className="text-[17px] text-[#64748B] font-light max-w-[340px] mx-auto leading-relaxed">
              Enter your tracking ID below to locate your prints in real-time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/80 backdrop-blur-2xl rounded-[48px] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-white relative overflow-hidden"
          >
            {/* Top glass reflection line */}
            <div className="absolute top-0 left-[10%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="relative">
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-6 mb-4 flex items-center gap-2">
                  <Fingerprint size={14} />
                  Reference ID
                </label>
                
                <div className="relative group">
                  <Search
                    className={`absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-500 z-10 ${
                      isFocused ? 'text-[#0F172A] scale-110' : 'text-[#94A3B8]'
                    }`}
                    size={24}
                    strokeWidth={isFocused ? 2 : 1.5}
                  />
                  
                  {/* The Tactile Input Field */}
                  <input
                    type="text"
                    value={orderId}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setOrderId(e.target.value)}
                    className={`w-full h-[76px] rounded-full pl-16 pr-8 text-[18px] md:text-[20px] font-mono font-medium transition-all duration-500 outline-none uppercase placeholder:normal-case placeholder:font-sans placeholder:font-light placeholder:tracking-normal placeholder:text-[#94A3B8] relative z-0
                      ${isFocused 
                        ? 'bg-white border-2 border-[#E2E8F0] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] text-[#0F172A] ring-4 ring-[#0F172A]/5 translate-y-[-2px]' 
                        : 'bg-[#F1F5F9] border-2 border-transparent text-[#334155] shadow-inner hover:bg-[#E2E8F0]/50'
                      }
                    `}
                    placeholder="e.g. ORD-123456"
                  />
                  
                  <div className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 ${isFocused ? 'opacity-100 text-[#CBD5E1] scale-100' : 'opacity-0 scale-75'}`}>
                    <Package size={22} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="relative group mt-4">
                {/* Button Glow Aura */}
                <div className={`absolute inset-0 bg-blue-500 rounded-full blur-xl transition-opacity duration-500 pointer-events-none ${orderId.length > 3 ? 'opacity-30 group-hover:opacity-50' : 'opacity-0'}`} />
                
                {/* The Hardware Button */}
                <button 
                  type="submit" 
                  disabled={!orderId.trim()}
                  className={`relative w-full rounded-full h-[72px] text-[18px] font-bold transition-all duration-500 flex items-center justify-center gap-3 font-[family-name:var(--font-outfit)] overflow-hidden
                    ${orderId.trim() 
                      ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.7)] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 cursor-pointer' 
                      : 'bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#94A3B8] shadow-sm cursor-not-allowed'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Locate Shipment
                    <ArrowRight 
                      size={20} 
                      strokeWidth={2.5} 
                      className={`transition-transform duration-500 ${orderId.trim() ? 'group-hover:translate-x-2' : ''}`} 
                    />
                  </span>
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-[#64748B] text-[15px] flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-[#E2E8F0]" />
              Need help?{' '}
              <a href="/login" className="text-[#0F172A] font-semibold hover:text-[#2563EB] transition-colors relative group inline-block">
                Sign in to your account
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#2563EB] transition-all duration-300 group-hover:w-full" />
              </a>
              <span className="w-8 h-px bg-[#E2E8F0]" />
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}