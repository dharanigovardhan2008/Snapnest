'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../lib/firestore';
import { MapPin, Phone, MessageCircle, Check, X, Package, LogOut, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

function DeliveryDashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if they have an assigned location
    if (user?.assignedLocation) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // We will add getDeliveryPartnerOrders to firestore.js in the next step
      const data = await orderService.getDeliveryPartnerOrders(user.assignedLocation);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, extraData = {}) => {
    try {
      await orderService.updateOrder(orderId, { status: newStatus, ...extraData });
      toast.success(newStatus === 'payment_completed' ? 'Payment marked collected!' : `Order marked as ${newStatus.replace('_', ' ')}`);
      fetchOrders(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleFailedDelivery = (orderId) => {
    const reason = window.prompt('Reason for failed delivery? (e.g., Customer unreachable, Wrong address)');
    if (reason && reason.trim() !== '') {
      updateOrderStatus(orderId, 'delivery_failed', { failureReason: reason });
    }
  };

  const openMaps = (addressObj) => {
    if(!addressObj) return;
    const query = encodeURIComponent(`${addressObj.address || ''}, ${addressObj.city || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Filter orders based on active tab
  const displayOrders = orders.filter(o => 
    activeTab === 'active' 
      ? ['out_for_delivery', 'payment_completed'].includes(o.status)
      : ['delivered', 'delivery_failed'].includes(o.status)
  );

  const stats = {
    todayCount: orders.filter(o => o.status === 'delivered').length,
    toCollect: orders.filter(o => o.status === 'out_for_delivery').reduce((acc, curr) => acc + (curr.halfPayment || 0), 0)
  };

  if (!user || user.role !== 'delivery') {
    return <div className="p-8 text-center mt-20">Unauthorized access. Delivery partners only.</div>;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-[family-name:var(--font-geist)] pb-24 text-[#0F172A] selection:bg-[#2563EB]/10">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#F1F5F9] sticky top-0 z-50 px-4 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">Partner Portal</h1>
          <p className="text-[13px] text-[#64748B] font-medium flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-[#2563EB]" /> {user?.assignedLocation || 'No Campus Assigned'}
          </p>
        </div>
        <button onClick={logout} className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-rose-500 hover:border-rose-200 transition-all">
          <LogOut size={18} />
        </button>
      </nav>

      <div className="max-w-xl mx-auto px-4 mt-6">
        
        {/* Daily Summary Strip */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-white border border-[#F1F5F9] rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Package size={20} />
            </div>
            <span className="text-[28px] font-bold font-[family-name:var(--font-outfit)] tracking-tight leading-none">{stats.todayCount}</span>
            <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mt-1">Delivered</span>
          </div>
          
          <div className="flex-1 bg-[#0F172A] text-white rounded-[32px] p-5 shadow-lg shadow-slate-800/20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center mb-2">
              <IndianRupee size={20} />
            </div>
            <span className="text-[28px] font-bold font-[family-name:var(--font-outfit)] tracking-tight leading-none">₹{stats.toCollect}</span>
            <span className="text-[11px] text-white/60 font-bold uppercase tracking-wider mt-1">To Collect</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#E2E8F0]/50 p-1.5 rounded-full mb-6">
          {['active', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-full text-[14px] font-bold capitalize tracking-wide transition-all ${
                activeTab === tab ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" /></div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[32px] border border-[#F1F5F9]">
            <Package size={32} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#64748B] font-medium">No {activeTab} deliveries right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div key={order.id} className="bg-white border border-[#F1F5F9] rounded-[32px] p-5 md:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)]">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[18px] font-bold font-[family-name:var(--font-outfit)] leading-tight">{order.userName || 'Customer'}</h3>
                    <p className="text-[14px] text-[#64748B] mt-1">{order.productName}</p>
                    <p className="text-[13px] text-[#94A3B8] font-mono mt-1">#{order.orderId}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[13px] font-bold border flex flex-col items-end ${
                    order.status === 'payment_completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    order.status === 'delivered' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                    order.status === 'delivery_failed' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {order.status === 'payment_completed' || order.status === 'delivered' ? 'Paid in Full' : `Collect ${formatCurrency(order.halfPayment)}`}
                  </div>
                </div>

                {activeTab === 'active' && (
                  <>
                    {/* Quick Actions Strip */}
                    <div className="flex gap-2 mb-6 border-b border-[#F1F5F9] pb-6">
                      <button onClick={() => window.open(`tel:${order.address?.mobile || ''}`)} className="flex-1 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center gap-2 text-[#0F172A] font-medium text-[14px] hover:bg-slate-100">
                        <Phone size={16} /> Call
                      </button>
                      <button onClick={() => window.open(`https://wa.me/${(order.address?.mobile || '').replace('+','')}`)} className="flex-1 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-2 text-emerald-700 font-medium text-[14px] hover:bg-emerald-100">
                        <MessageCircle size={16} /> WhatsApp
                      </button>
                      <button onClick={() => openMaps(order.address)} className="w-12 h-12 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-100">
                        <MapPin size={18} />
                      </button>
                    </div>

                    {/* Status Flow Buttons */}
                    <div className="space-y-3">
                      {order.status === 'out_for_delivery' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'payment_completed')}
                          className="w-full h-14 rounded-full bg-white border-2 border-[#0F172A] text-[#0F172A] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#F8FAFC]"
                        >
                          <Check size={18} /> Payment Collected
                        </button>
                      )}
                      
                      {/* Only allow delivery marking AFTER payment is collected */}
                      {order.status === 'payment_completed' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="w-full h-14 rounded-full bg-[#0F172A] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-md hover:bg-[#2563EB] transition-colors"
                        >
                          <Package size={18} /> Handed to Customer
                        </button>
                      )}

                      <button 
                        onClick={() => handleFailedDelivery(order.id)}
                        className="w-full h-12 rounded-full bg-transparent text-[#94A3B8] font-medium text-[14px] flex items-center justify-center gap-2 hover:text-rose-500 mt-2"
                      >
                        <X size={16} /> Couldn't Deliver
                      </button>
                    </div>
                  </>
                )}

                {/* History View Info */}
                {activeTab === 'history' && (
                  <div className="pt-4 border-t border-[#F1F5F9]">
                    <p className="text-[14px] font-medium text-[#0F172A] flex items-center gap-2">
                      {order.status === 'delivered' ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-rose-500" />}
                      {order.status === 'delivered' ? 'Successfully Delivered' : `Failed: ${order.failureReason || 'Unknown reason'}`}
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  return (
    <ProtectedRoute>
      <DeliveryDashboardContent />
    </ProtectedRoute>
  );
}