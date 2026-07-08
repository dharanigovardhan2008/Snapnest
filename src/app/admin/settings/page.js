'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, DollarSign, Gift, Phone, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { configService } from '../../../lib/firestore';
import toast from 'react-hot-toast';

function AdminSettingsContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    upiId: '',
    mobileNumber: '',
    pointsPerOrder: 10,
    pointsPerReferral: 50,
    pointValueInRupees: 1, // NEW: Dynamic point value
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await configService.getConfig();
      setConfig({
        ...data,
        pointValueInRupees: data.pointValueInRupees || 1, // Fallback to ₹1 if not set
      });
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.upiId || !config.mobileNumber) {
      toast.error('Please fill all payment fields');
      return;
    }

    if (config.pointsPerOrder < 0 || config.pointsPerReferral < 0 || config.pointValueInRupees <= 0) {
      toast.error('Points and values must be positive numbers');
      return;
    }

    setSaving(true);
    try {
      await configService.updateConfig(config);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-8 font-[family-name:var(--font-geist)]">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-2">
            Platform Settings
          </h1>
          <p className="text-[16px] text-[#64748B] font-light">
            Configure payment routing and loyalty economics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Payment Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-[#F1F5F9]"
          >
            <div className="flex items-center gap-4 mb-8 border-b border-[#F1F5F9] pb-6">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-[16px] flex items-center justify-center">
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">Payment Routing</h2>
                <p className="text-[13px] text-[#64748B]">Where funds are collected</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Official UPI ID</label>
                <input
                  type="text"
                  value={config.upiId}
                  onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-medium transition-all outline-none text-[15px]"
                  placeholder="yourname@upi"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Support Mobile Number</label>
                <input
                  type="text"
                  value={config.mobileNumber}
                  onChange={(e) => setConfig({ ...config, mobileNumber: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-medium transition-all outline-none text-[15px]"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </motion.div>

          {/* Loyalty Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-[#F1F5F9]"
          >
            <div className="flex items-center gap-4 mb-8 border-b border-[#F1F5F9] pb-6">
              <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-[16px] flex items-center justify-center">
                <Gift className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">Loyalty Economics</h2>
                <p className="text-[13px] text-[#64748B]">Configure points and conversion</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Per Order</label>
                  <input
                    type="number"
                    value={config.pointsPerOrder}
                    onChange={(e) => setConfig({ ...config, pointsPerOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-medium transition-all outline-none text-[15px]"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Per Referral</label>
                  <input
                    type="number"
                    value={config.pointsPerReferral}
                    onChange={(e) => setConfig({ ...config, pointsPerReferral: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-medium transition-all outline-none text-[15px]"
                    min="0"
                  />
                </div>
              </div>

              {/* NEW: Editable Point Value */}
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Point Value (in ₹)</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                  <input
                    type="number"
                    step="0.5"
                    value={config.pointValueInRupees}
                    onChange={(e) => setConfig({ ...config, pointValueInRupees: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 pl-12 pr-5 text-[#0F172A] font-bold transition-all outline-none text-[16px]"
                    min="0.1"
                  />
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-[16px] p-4 flex gap-3">
                <ShieldCheck className="text-indigo-500 shrink-0" size={18} />
                <p className="text-[13px] text-indigo-900 leading-relaxed font-medium">
                  With current settings, <strong className="font-bold text-[#0F172A]">1 Point = ₹{config.pointValueInRupees}</strong>. This dictates how much discount customers receive when applying points at checkout.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end pt-4"
        >
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="group bg-[#0F172A] hover:bg-black text-white rounded-full h-[56px] px-10 font-bold text-[16px] transition-all shadow-[0_8px_20px_-6px_rgba(15,23,42,0.5)] active:scale-[0.98] flex items-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                Save Settings
              </>
            )}
          </button>
        </motion.div>

      </div>
    </AdminLayout>
  );
}

export default function AdminSettings() {
  return (
    <ProtectedRoute adminOnly>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}