'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, MapPin, Building2, PhoneCall, Route } from 'lucide-react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { addressService } from '../../../lib/firestore';
import toast from 'react-hot-toast';

function AdminAddressesContent() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'campus',
    partnerPhone: '', // NEW: Delivery Partner Phone Number
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setShowAddForm(false);
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type || 'campus',
      partnerPhone: address.partnerPhone || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', address: '', city: '', state: '', pincode: '', type: 'campus', partnerPhone: '' });
  };

  const validateForm = () => {
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill all mandatory fields');
      return false;
    }
    return true;
  };

  const handleSave = async (addressId) => {
    if (!validateForm()) return;
    try {
      await addressService.updateAddress(addressId, formData);
      toast.success('Location updated');
      handleCancel();
      loadAddresses();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      await addressService.addAddress(formData);
      toast.success('Location added');
      handleCancel();
      loadAddresses();
    } catch (error) {
      toast.error('Failed to add');
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Delete this delivery route?')) return;
    try {
      await addressService.deleteAddress(addressId);
      toast.success('Route deleted');
      loadAddresses();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center min-h-[60vh] items-center"><LoadingSpinner /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 font-[family-name:var(--font-geist)] max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-[#0F172A] p-8 md:p-10 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] tracking-tight mb-2">
              Logistics & Routes
            </h1>
            <p className="text-[#94A3B8] font-light">
              Manage operational drop-zones and delivery agent contacts.
            </p>
          </div>
          <button 
            onClick={() => { handleCancel(); setShowAddForm(true); }} 
            className="relative z-10 flex items-center justify-center gap-2 bg-white text-[#0F172A] hover:bg-[#F8FAFC] px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)] active:scale-95"
          >
            <Route size={18} /> Add Route
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#F1F5F9] overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8 border-b border-[#F1F5F9] pb-6">
                  <h2 className="text-[22px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] flex items-center gap-3">
                    <MapPin size={24} className="text-[#2563EB]" /> Setup New Route
                  </h2>
                  <button onClick={handleCancel} className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors"><X size={20} /></button>
                </div>
                <AddressForm formData={formData} setFormData={setFormData} onSave={handleAdd} onCancel={handleCancel} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {addresses.map((address, index) => {
            const isEditing = editingId === address.id;
            return (
              <motion.div key={address.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="relative group">
                {isEditing ? (
                  <div className="bg-white rounded-[40px] border-2 border-[#0F172A] shadow-xl p-8">
                    <h2 className="text-[20px] font-bold text-[#0F172A] mb-6 font-[family-name:var(--font-outfit)]">Edit Route</h2>
                    <AddressForm formData={formData} setFormData={setFormData} onSave={() => handleSave(address.id)} onCancel={handleCancel} />
                  </div>
                ) : (
                  <div className="bg-white rounded-[40px] border border-[#E2E8F0] hover:border-[#CBD5E1] p-8 transition-all duration-300 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col h-full">
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${address.type === 'campus' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                          {address.type === 'campus' ? <Building2 size={24} /> : <MapPin size={24} />}
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${address.type === 'campus' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            {address.type === 'campus' ? 'Campus Hub' : 'Custom Zone'}
                          </span>
                          <h3 className="text-[22px] font-bold text-[#0F172A] mt-2 font-[family-name:var(--font-outfit)] leading-tight">{address.name}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-[24px] p-6 mb-6 flex-grow">
                      <p className="text-[#0F172A] font-medium text-[16px] mb-1">{address.address}</p>
                      <p className="text-[#64748B] text-[15px]">{address.city}, {address.state}</p>
                      <p className="text-[#94A3B8] font-mono font-bold text-[14px] mt-4 pt-4 border-t border-[#E2E8F0] tracking-widest">
                        PIN: {address.pincode}
                      </p>
                    </div>

                    {/* Agent Contact Block */}
                    <div className="flex items-center justify-between mt-auto">
                      {address.partnerPhone ? (
                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-full text-blue-700">
                          <PhoneCall size={16} />
                          <span className="font-bold text-[14px] font-mono">{address.partnerPhone}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#94A3B8] text-[13px] font-medium px-2">
                          <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" /> No agent assigned
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(address)} className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A] transition-all shadow-sm">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(address.id)} className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

function AddressForm({ formData, setFormData, onSave, onCancel }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">Location Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white rounded-full py-4 px-6 text-[#0F172A] font-bold transition-all outline-none text-[16px]" placeholder="e.g. Saveetha Hub" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">Location Type</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white rounded-full py-4 px-6 text-[#0F172A] font-bold transition-all outline-none text-[16px] appearance-none cursor-pointer">
            <option value="campus">University / Campus Drop</option>
            <option value="custom">Custom Zone</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">Delivery Agent Phone (Optional)</label>
        <div className="relative">
          <PhoneCall size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input type="text" value={formData.partnerPhone} onChange={(e) => setFormData({ ...formData, partnerPhone: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:bg-white rounded-full py-4 pl-14 pr-6 text-[#0F172A] font-mono font-bold transition-all outline-none text-[16px]" placeholder="+91 9876543210" />
        </div>
      </div>

      <div className="w-full h-px bg-[#F1F5F9] my-2" />

      <div>
        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">Full Address</label>
        <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white rounded-full py-4 px-6 text-[#0F172A] font-medium transition-all outline-none text-[16px]" placeholder="Building, street, area..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">City</label>
          <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white rounded-full py-4 px-6 text-[#0F172A] font-medium transition-all outline-none text-[16px]" placeholder="City" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">State</label>
          <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white rounded-full py-4 px-6 text-[#0F172A] font-medium transition-all outline-none text-[16px]" placeholder="State" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] ml-4 mb-2">PIN</label>
          <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white rounded-full py-4 px-6 text-[#0F172A] font-bold font-mono tracking-widest transition-all outline-none text-[16px]" placeholder="600001" maxLength="6" />
        </div>
      </div>

      <div className="flex gap-4 pt-6 mt-2">
        <button onClick={onSave} className="flex-1 bg-[#0F172A] hover:bg-black text-white rounded-full h-[60px] font-bold text-[16px] transition-all shadow-[0_8px_20px_rgba(15,23,42,0.3)] active:scale-95 flex items-center justify-center gap-2">
          <Save size={20} /> Save Route
        </button>
        <button onClick={onCancel} className="w-[120px] bg-white border-2 border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full h-[60px] font-bold text-[16px] transition-all flex items-center justify-center active:scale-95">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminAddresses() {
  return (
    <ProtectedRoute adminOnly>
      <AdminAddressesContent />
    </ProtectedRoute>
  );
}