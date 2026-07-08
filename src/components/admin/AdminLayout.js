'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  MapPin,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/addresses', icon: MapPin, label: 'Addresses' },
  { href: '/admin/content', icon: Star, label: 'Content' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist)] selection:bg-[#2563EB]/20 selection:text-[#0F172A]">
      
      {/* Mobile Premium Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F1F5F9] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-[2px]" />
            </div>
            <h1 className="text-[18px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Studio Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-[#F8FAFC] text-[#0F172A] rounded-full border border-[#E2E8F0]"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay & Animation */}
      <AnimatePresence>
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <>
            {/* Mobile Dark Overlay */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40"
              />
            )}

            {/* Dark Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0B1121] border-r border-white/5 z-50 lg:z-auto flex flex-col shadow-2xl lg:shadow-none"
            >
              {/* Logo Area */}
              <div className="p-8 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      <div className="w-3 h-3 bg-[#0B1121] rounded-[3px]" />
                    </div>
                    <h1 className="text-[22px] font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight">SnapNest</h1>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Command Center</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="px-4 py-4 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-all duration-300 ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)]'
                          : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-[#64748B] group-hover:text-white transition-colors'} />
                      <span className={`text-[15px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Area */}
              <div className="p-4 mt-auto border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-[#F43F5E] hover:bg-[#F43F5E]/10 hover:text-[#FDA4AF] w-full transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="text-[15px] font-medium">Secure Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Workspace */}
      <div className="lg:pl-[280px] min-h-screen flex flex-col">
        <main className="flex-1 p-4 md:p-8 pt-24 lg:pt-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}