'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, CheckCircle, Sparkles, Share2, Award } from 'lucide-react';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { loyaltyService, configService } from '../../lib/firestore';
import { copyToClipboard } from '../../utils/helpers';
import toast from 'react-hot-toast';

function LoyaltyContent() {
  const [loyalty, setLoyalty] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Safely catch errors if documents don't exist yet
      const loyaltyData = await loyaltyService.getLoyalty(user.uid).catch(() => null);
      const configData = await configService.getConfig().catch(() => null);
      
      // NULL-SAFETY: If the user has no loyalty data yet, give them a default state
      setLoyalty(loyaltyData || {
        points: 0,
        referrals: [],
        referralCode: user?.uid?.substring(0, 6).toUpperCase() || 'SNAPNEW'
      });

      // NULL-SAFETY: Default config if missing
      setConfig(configData || {
        pointsPerOrder: 10,
        pointsPerReferral: 50
      });

    } catch (error) {
      console.error('Error loading loyalty data:', error);
      toast.error('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!loyalty?.referralCode) return;
    const success = await copyToClipboard(loyalty.referralCode);
    if (success) {
      toast.success('Referral code copied!');
    } else {
      toast.error('Failed to copy code');
    }
  };

  const handleCopyLink = async () => {
    if (!loyalty?.referralCode) return;
    const referralLink = `${window.location.origin}/signup?ref=${loyalty.referralCode}`;
    const success = await copyToClipboard(referralLink);
    if (success) {
      toast.success('Referral link copied!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  if (loading || !loyalty) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center pt-24">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist)] selection:bg-[#2563EB]/10 selection:text-[#0F172A] flex flex-col relative overflow-hidden">
      
      {/* --- STUDIO BACKGROUND & DECORATION --- */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white rounded-full blur-[100px] pointer-events-none opacity-80" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/80 rounded-full blur-[120px] pointer-events-none" />
      {/* -------------------------------------- */}

      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-[720px] mx-auto space-y-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-4"
          >
            <div className="w-16 h-16 bg-white border border-[#E2E8F0] shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift size={28} className="text-[#0F172A]" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">
              Rewards & Referrals
            </h1>
            <p className="text-[17px] text-[#64748B] font-light max-w-[400px] mx-auto leading-relaxed">
              Earn points with every print and unlock exclusive studio rewards.
            </p>
          </motion.div>

          {/* Points Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-[40px] p-10 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden text-center group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 opacity-80" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-6">
                <Sparkles size={14} className="text-indigo-500" />
                <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider">Available Balance</span>
              </div>
              
              <h2 className="text-[72px] md:text-[88px] font-black text-[#0F172A] leading-none tracking-tighter font-[family-name:var(--font-outfit)] mb-2 group-hover:scale-105 transition-transform duration-500">
                {loyalty.points || 0}
              </h2>
              
              <p className="text-[15px] text-[#64748B] font-medium bg-[#F8FAFC] px-4 py-2 rounded-full border border-[#E2E8F0]">
                1 point = <span className="font-bold text-[#0F172A]">₹{config?.pointValueInRupees || 1} discount</span> on your next order
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* How to Earn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white rounded-[40px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-[#F1F5F9]"
            >
              <h3 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] mb-6 flex items-center gap-2">
                <Award size={20} className="text-[#64748B]" />
                How to Earn
              </h3>
              
              <div className="space-y-4">
                <div className="bg-[#F8FAFC] rounded-[24px] p-4 flex gap-4 items-center border border-transparent hover:border-[#E2E8F0] transition-colors">
                  <div className="w-12 h-12 bg-white border border-[#E2E8F0] shadow-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-emerald-500" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-[15px]">Complete an Order</h4>
                    <p className="text-[13px] text-[#64748B] mt-0.5">
                      Earn <strong className="text-[#0F172A]">{config?.pointsPerOrder || 10} points</strong> per print run.
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-[24px] p-4 flex gap-4 items-center border border-transparent hover:border-[#E2E8F0] transition-colors">
                  <div className="w-12 h-12 bg-white border border-[#E2E8F0] shadow-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-blue-500" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-[15px]">Refer a Friend</h4>
                    <p className="text-[13px] text-[#64748B] mt-0.5">
                      Get <strong className="text-[#0F172A]">{config?.pointsPerReferral || 50} points</strong> on their first order.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Referral Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-[#0F172A] rounded-[40px] p-8 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
              
              <h3 className="text-[20px] font-bold font-[family-name:var(--font-outfit)] mb-8 flex items-center gap-2 relative z-10">
                <Share2 size={20} className="text-blue-400" />
                Referral Stats
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-[13px] text-[#94A3B8] font-medium uppercase tracking-wider mb-1">Total Referrals</p>
                  <p className="text-[40px] font-bold font-[family-name:var(--font-outfit)] leading-none text-white">
                    {loyalty.referrals?.length || 0}
                  </p>
                </div>
                
                <div className="w-full h-px bg-white/10" />

                <div>
                  <p className="text-[13px] text-[#94A3B8] font-medium uppercase tracking-wider mb-1">Points Earned</p>
                  <p className="text-[40px] font-bold font-[family-name:var(--font-outfit)] leading-none text-blue-400">
                    +{(loyalty.referrals?.length || 0) * (config?.pointsPerReferral || 50)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Share Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-[#F1F5F9]"
          >
            <h3 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] mb-8 text-center">
              Invite friends, earn points
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-4 mb-3">
                  Your Referral Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loyalty.referralCode}
                    readOnly
                    className="w-full h-[64px] bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] rounded-full pl-6 pr-16 text-[#0F172A] text-[18px] font-mono font-bold outline-none transition-colors"
                  />
                  <button 
                    onClick={handleCopyCode} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0F172A] shadow-sm border border-[#E2E8F0] hover:bg-[#F1F5F9] active:scale-90 transition-all group"
                  >
                    <Copy size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-4 mb-3">
                  Your Share Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${loyalty.referralCode}`}
                    readOnly
                    className="w-full h-[64px] bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] rounded-full pl-6 pr-16 text-[#0F172A] text-[15px] font-medium outline-none transition-colors overflow-hidden text-ellipsis"
                  />
                  <button 
                    onClick={handleCopyLink} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0F172A] rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(15,23,42,0.3)] hover:bg-[#2563EB] active:scale-90 transition-all group"
                  >
                    <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoyaltyPage() {
  return (
    <ProtectedRoute>
      <LoyaltyContent />
    </ProtectedRoute>
  );
}