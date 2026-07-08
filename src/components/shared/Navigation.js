'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, Package, Gift, LogOut, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();
    const result = await signOut();
    if (result.success) {
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      className="fixed top-6 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto relative">
        
        {/* Main Floating Pill */}
        <div className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] rounded-full px-4 py-2.5 flex items-center justify-between">
          
          {/* Logo */}
          <Link 
            href="/" 
            onClick={closeMenu}
            className="pl-3 text-[22px] font-bold tracking-tight text-[#0F172A] font-[family-name:var(--font-outfit)] flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
              <div className="w-2 h-2 bg-white rounded-[2px]" />
            </div>
            SnapNest
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2 bg-[#F8FAFC]/50 p-1 rounded-full border border-[#F1F5F9]">
            <Link href="/" className="px-5 py-2 rounded-full text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              About
            </Link>
            <Link href="/products" className="px-5 py-2 rounded-full text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              Products
            </Link>
            <Link href="/track" className="px-5 py-2 rounded-full text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              Track Order
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 pr-1">
            
            {user ? (
              // LOGGED IN USER DROPDOWN
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all"
                >
                  <span className="max-w-[100px] truncate">{user.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white/90 backdrop-blur-2xl border border-[#E2E8F0] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] rounded-[24px] p-2 flex flex-col z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[#F1F5F9] mb-2">
                        <p className="text-[12px] text-[#64748B] uppercase tracking-wider font-bold">Signed in as</p>
                        <p className="text-[14px] font-bold text-[#0F172A] truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link href="/admin" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-amber-700 hover:bg-amber-50 rounded-[16px] transition-colors">
                          <ShieldCheck size={16} /> Admin Dashboard
                        </Link>
                      )}
                      
                      <Link href="/my-orders" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-[#334155] hover:bg-[#F8FAFC] rounded-[16px] hover:text-[#0F172A] transition-colors">
                        <Package size={16} /> My Orders
                      </Link>

                      <Link href="/wishlist" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-[#334155] hover:bg-[#F8FAFC] rounded-[16px] hover:text-[#0F172A] transition-colors">
                        <Heart size={16} /> My Wishlist
                      </Link>
                      
                      <Link href="/loyalty" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-[#334155] hover:bg-[#F8FAFC] rounded-[16px] hover:text-[#0F172A] transition-colors">
                        <Gift size={16} /> Rewards & Points
                      </Link>
                      
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50 rounded-[16px] text-left transition-colors mt-1">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // LOGGED OUT
              <Link 
                href="/login" 
                className="px-4 py-2 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Login
              </Link>
            )}

            <Link 
              href="/products" 
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-2.5 rounded-full text-[14px] font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(15,23,42,0.2)]"
            >
              Start Printing
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden pr-2 text-[#0F172A] p-2 active:scale-90 transition-transform"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+12px)] left-0 right-0 pointer-events-auto bg-white/95 backdrop-blur-3xl border border-white/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] rounded-[32px] p-4 flex flex-col md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-1 mb-4">
                <Link href="/" onClick={closeMenu} className="px-6 py-4 rounded-[24px] text-[16px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition-colors">About</Link>
                <Link href="/products" onClick={closeMenu} className="px-6 py-4 rounded-[24px] text-[16px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition-colors">Products</Link>
                <Link href="/track" onClick={closeMenu} className="px-6 py-4 rounded-[24px] text-[16px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition-colors">Track Order</Link>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[#F1F5F9] px-2 pb-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 mb-2 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0]">
                      <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold">Signed in</p>
                      <p className="text-[14px] font-bold text-[#0F172A] truncate">{user.email}</p>
                    </div>
                    
                    {isAdmin && (
                       <Link href="/admin" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-amber-700 bg-amber-50 rounded-[16px]">
                         <ShieldCheck size={18} /> Admin Dashboard
                       </Link>
                    )}

                    <Link href="/my-orders" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[#0F172A] bg-[#F8FAFC] rounded-[16px]">
                      <Package size={18} className="text-[#64748B]" /> My Orders
                    </Link>

                    <Link href="/wishlist" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[#0F172A] bg-[#F8FAFC] rounded-[16px]">
                      <Heart size={18} className="text-[#64748B]" /> My Wishlist
                    </Link>
                    
                    <Link href="/loyalty" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[#0F172A] bg-[#F8FAFC] rounded-[16px]">
                      <Gift size={18} className="text-[#64748B]" /> Rewards & Points
                    </Link>
                    
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-red-600 bg-red-50 rounded-[16px] mt-2">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMenu} className="px-4 py-3 text-center text-[16px] font-bold text-[#64748B] hover:text-[#0F172A]">
                    Login to Account
                  </Link>
                )}
                
                <Link href="/products" onClick={closeMenu} className="w-full bg-[#0F172A] active:bg-[#1E293B] text-white px-6 py-4 rounded-full text-[16px] font-bold text-center transition-all shadow-[0_4px_14px_rgba(15,23,42,0.2)] mt-2">
                  Start Printing
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}