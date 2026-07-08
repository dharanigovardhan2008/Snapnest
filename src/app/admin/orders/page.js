'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Calendar, Truck, Package, X,
  ShieldCheck, CheckCircle2, Printer, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import StatusBadge from '../../../components/shared/StatusBadge';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { orderService, loyaltyService, configService } from '../../../lib/firestore';
import { formatCurrency, formatDate, downloadCSV, calculateDeliveryDate } from '../../../utils/helpers';
import toast from 'react-hot-toast';

// FIREBASE FIX: Direct import to force merge true
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({ days: 3 });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (filter !== 'all') {
      if (filter === 'pending') {
        filtered = filtered.filter((o) => o.status === 'pending_verification');
      } else if (filter === 'active') {
        filtered = filtered.filter((o) =>
          ['verified', 'printing', 'shipped', 'out_for_delivery'].includes(o.status)
        );
      } else if (filter === 'completed') {
        filtered = filtered.filter((o) => o.status === 'delivered');
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(term) ||
          o.userName.toLowerCase().includes(term) ||
          o.userEmail.toLowerCase().includes(term) ||
          o.productName.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleVerify = async () => {
    if (!verifyData.days || verifyData.days < 1) {
      toast.error('Please enter valid delivery days');
      return;
    }

    try {
      const estimatedDelivery = calculateDeliveryDate(parseInt(verifyData.days));
      await orderService.updateOrder(selectedOrder.id, {
        status: 'verified',
        estimatedDelivery,
        verifiedAt: new Date().toISOString(),
      });

      toast.success('Order verified successfully');
      setShowVerifyModal(false);
      setSelectedOrder(null);
      setVerifyData({ days: 3 });
      loadOrders();
    } catch (error) {
      console.error('Error verifying order:', error);
      toast.error('Failed to verify order');
    }
  };

  // FIXED: Bulletproof points addition
  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await orderService.updateOrder(order.id, { status: newStatus });
      
      if (newStatus === 'delivered') {
        const config = await configService.getConfig();
        const pointsToAward = config?.pointsPerOrder || 10;
        
        try {
          const userLoyalty = await loyaltyService.getLoyalty(order.userId).catch(() => null);
          const newPoints = (userLoyalty?.points || 0) + pointsToAward;
          
          // Force merge:true so it creates the profile if it doesn't exist!
          const loyaltyRef = doc(db, 'loyalty', order.userId);
          await setDoc(loyaltyRef, { 
            points: newPoints,
            referralCode: userLoyalty?.referralCode || order.userId.substring(0,6).toUpperCase()
          }, { merge: true });
          
          toast.success(`Delivered! ${pointsToAward} points added to ${order.userName}.`);
        } catch (loyaltyError) {
          console.error("Error adding loyalty points:", loyaltyError);
          toast.error("Delivered, but failed to add loyalty points.");
        }
      } else {
        toast.success('Order status updated');
      }
      
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredOrders.map((order) => ({
      OrderID: order.orderId,
      Customer: order.userName,
      Email: order.userEmail,
      Product: order.productName,
      Status: order.status,
      Amount: order.total,
      Paid: order.halfPayment,
      TransactionID: order.transactionId,
      DeliveryType: order.deliveryType,
      Date: formatDate(order.createdAt),
    }));

    downloadCSV(exportData, 'orders');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 font-[family-name:var(--font-geist)]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-2">
              Order Operations
            </h1>
            <p className="text-[16px] text-[#64748B] font-light">
              Managing <span className="font-semibold text-[#0F172A]">{filteredOrders.length}</span> active print orders
            </p>
          </div>
          <button 
            onClick={handleExportCSV} 
            className="group flex items-center gap-2 bg-white border border-[#E2E8F0] hover:border-[#0F172A] text-[#0F172A] px-6 py-3 rounded-full text-[14px] font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
          >
            <Download size={18} className="text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
            Export CSV
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-full p-2 flex flex-col md:flex-row gap-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-[#F1F5F9]">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by order ID, customer, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 py-3.5 pl-14 pr-4 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] placeholder:font-light text-[15px]"
            />
          </div>
          <div className="w-px h-8 bg-[#E2E8F0] hidden md:block self-center" />
          <div className="relative md:w-64">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 py-3.5 pl-5 pr-10 text-[#0F172A] font-semibold transition-all outline-none text-[15px] appearance-none cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending Verification</option>
              <option value="active">Active Production</option>
              <option value="completed">Completed</option>
            </select>
            <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={18} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#F1F5F9] rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]/60">
                  <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Design & Meta</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Customer</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Status</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Financials</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4 border border-[#E2E8F0]">
                          <Package size={28} className="text-[#94A3B8]" />
                        </div>
                        <h3 className="text-[#0F172A] font-bold text-[18px] mb-1 font-[family-name:var(--font-outfit)]">No orders found</h3>
                        <p className="text-[#64748B] text-[15px] font-light">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8FAFC]/60 transition-colors group">
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {order.designUrl ? (
                            <a href={order.designUrl} target="_blank" rel="noopener noreferrer" className="relative w-16 h-16 rounded-[12px] bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden group/image flex-shrink-0">
                              <img src={order.designUrl} alt="Customer Design" className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110" />
                              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center">
                                <ExternalLink size={16} className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" />
                              </div>
                            </a>
                          ) : (
                            <div className="w-16 h-16 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-center text-[#94A3B8] flex-shrink-0">
                              <ImageIcon size={18} className="mb-1" />
                              <span className="text-[9px] font-semibold uppercase tracking-wider">No Img</span>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex w-max font-mono text-[12px] font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded-[6px] border border-[#E2E8F0] shadow-sm">
                              {order.orderId}
                            </span>
                            <span className="text-[14px] font-semibold text-[#0F172A] mt-0.5">{order.productName}</span>
                            <span className="text-[12px] text-[#64748B] font-light">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] font-bold text-[#0F172A]">{order.userName}</span>
                          <span className="text-[13px] text-[#64748B] font-light hover:text-[#2563EB] cursor-pointer transition-colors">
                            {order.userEmail}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col items-start gap-2">
                          <StatusBadge status={order.status} />
                          {order.estimatedDelivery && (
                            <span className="text-[12px] text-[#64748B] font-medium flex items-center gap-1.5 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100/50">
                              <Calendar size={12} className="text-blue-500" />
                              Est: {formatDate(order.estimatedDelivery)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[16px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">
                            {formatCurrency(order.total)}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-max border border-emerald-200 uppercase tracking-wider">
                            Paid: {formatCurrency(order.halfPayment)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">

                          {order.status === 'pending_verification' && (
                            <button
                              onClick={() => { setSelectedOrder(order); setShowVerifyModal(true); }}
                              className="px-5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[13px] font-bold transition-colors flex items-center gap-2 whitespace-nowrap active:scale-95"
                            >
                              <ShieldCheck size={16} /> Verify Payment
                            </button>
                          )}

                          {order.status === 'verified' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'printing')}
                              className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#2563EB] text-white text-[13px] font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] flex items-center gap-2 whitespace-nowrap active:scale-95"
                            >
                              <Printer size={16} /> Start Print
                            </button>
                          )}

                          {order.status === 'printing' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'shipped')}
                              className="px-5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[13px] font-bold transition-colors flex items-center gap-2 whitespace-nowrap active:scale-95"
                            >
                              <Package size={16} /> Mark Shipped
                            </button>
                          )}

                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'out_for_delivery')}
                              className="px-5 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[13px] font-bold transition-colors flex items-center gap-2 whitespace-nowrap active:scale-95"
                            >
                              <Truck size={16} /> Out for Delivery
                            </button>
                          )}

                          {order.status === 'out_for_delivery' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'delivered')}
                              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] flex items-center gap-2 whitespace-nowrap active:scale-95"
                            >
                              <CheckCircle2 size={16} /> Mark Delivered
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-[family-name:var(--font-geist)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] p-8 md:p-10 max-w-md w-full shadow-[0_20px_80px_-15px_rgba(0,0,0,0.2)] border border-[#F1F5F9]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Verify Payment</h2>
                  <p className="text-[14px] text-[#64748B] mt-1 font-light">Confirm transaction to start production.</p>
                </div>
                <button onClick={() => setShowVerifyModal(false)} className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] flex items-center justify-center hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all active:scale-90">
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-[#F8FAFC] rounded-[24px] p-6 border border-[#F1F5F9] space-y-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#64748B] font-medium">Order ID</span>
                    <span className="font-mono font-bold text-[#0F172A] bg-white px-2.5 py-1 rounded-[8px] border border-[#E2E8F0] shadow-sm">{selectedOrder?.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#64748B] font-medium">Transaction ID</span>
                    <span className="font-mono font-bold text-[#2563EB] tracking-wider bg-blue-50 px-2.5 py-1 rounded-[8px] border border-blue-100">{selectedOrder?.transactionId}</span>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-bold text-[#0F172A]">Amount to Verify</span>
                    <span className="text-[24px] font-black text-emerald-600 font-[family-name:var(--font-outfit)] tracking-tight">{formatCurrency(selectedOrder?.halfPayment)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] uppercase tracking-wider ml-4 mb-3">Est. Production Time</label>
                  <div className="relative">
                    <input type="number" min="1" value={verifyData.days} onChange={(e) => setVerifyData({ days: e.target.value })} className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#CBD5E1] focus:bg-white focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-full py-4 pl-6 pr-16 text-[#0F172A] text-[18px] font-bold transition-all outline-none text-center" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#94A3B8] font-medium pointer-events-none">Days</span>
                  </div>
                </div>

                <button onClick={handleVerify} className="group w-full bg-[#0F172A] hover:bg-black text-white rounded-full h-[60px] font-bold text-[16px] transition-all shadow-[0_8px_25px_-8px_rgba(15,23,42,0.5)] hover:shadow-[0_12px_30px_-8px_rgba(15,23,42,0.7)] active:scale-[0.98] flex items-center justify-center gap-2">
                  <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" /> Approve & Send to Printer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}

export default function AdminOrders() {
  return (
    <ProtectedRoute adminOnly>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"><LoadingSpinner /></div>}>
        <OrdersContent />
      </Suspense>
    </ProtectedRoute>
  );
}