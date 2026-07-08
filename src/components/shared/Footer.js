import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white pt-24 pb-8 rounded-t-[3rem] mt-20 relative overflow-hidden">
      
      {/* Subtle background glow for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        
        {/* New Editorial Pre-Footer CTA */}
        <div className="pb-20 border-b border-white/10 mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-semibold text-white font-[family-name:var(--font-outfit)] tracking-tight leading-[1.1] mb-6">
              Ready to hold your memories?
            </h2>
            <p className="text-[#94A3B8] text-xl font-light">
              Stop letting your favorite photos live on a screen.
            </p>
          </div>
          <Link 
            href="/products" 
            className="group flex items-center gap-3 bg-white text-[#0F172A] px-8 py-4 rounded-full text-[17px] font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.15)] shrink-0"
          >
            Print Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          <div className="col-span-1 md:col-span-4">
            <Link 
              href="/" 
              className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-6 font-[family-name:var(--font-outfit)]"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                 <div className="w-3 h-3 bg-[#0F172A] rounded-[2px]" />
              </div>
              SnapNest
            </Link>
            <p className="text-[#94A3B8] text-[15px] leading-relaxed font-light pr-4">
              A boutique printing studio dedicated to turning your digital camera roll into a tactile, high-quality gallery. Handled with care, printed to last.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-6 text-[#F8FAFC]">Products</h4>
            <ul className="space-y-4 text-[#94A3B8] text-[15px] font-light">
              <li><Link href="/products" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Polaroids</Link></li>
              <li><Link href="/products" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">A5 Posters</Link></li>
              <li><Link href="/products" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">A3 Posters</Link></li>
              <li><Link href="/products" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Custom Prints</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-6 text-[#F8FAFC]">Support</h4>
            <ul className="space-y-4 text-[#94A3B8] text-[15px] font-light">
              <li><Link href="/track" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Track Order</Link></li>
              <li><Link href="/loyalty" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Loyalty Rewards</Link></li>
              <li><Link href="/login" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">My Account</Link></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Contact Us</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-6 text-[#F8FAFC]">Legal</h4>
            <ul className="space-y-4 text-[#94A3B8] text-[15px] font-light">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Refund Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[#64748B] text-[13px] font-light">
          <p>© {new Date().getFullYear()} SnapNest Studio. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Printed with care in</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}