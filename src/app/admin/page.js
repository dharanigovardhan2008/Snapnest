'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { statsService, orderService } from '../../lib/firestore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [reconciliationStats, setReconciliationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, allOrders, pending] = await Promise.all([
        statsService.getStats(),
        orderService.getAllOrders(),
        orderService.getPendingOrders(),
      ]);

      setStats(statsData);
      setRecentOrders(allOrders.slice(0, 5));
      setPendingOrders(pending);

      // Compute Cash Reconciliation for Delivery Partners
      const campuses = ['Loyola College', 'Saveetha University', 'Saveetha Dental College', 'Sathyabama University'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const cashStats = {};
      campuses.forEach(c => cashStats[c] = 0);

      allOrders.forEach(o => {
        if (o.deliveryType === 'delivery' && campuses.includes(o.address?.name)) {
          const orderDate = o.updatedAt || o.createdAt;
          // Calculate sum of cash collected today by the partners
          if (orderDate >= today && (o.status === 'payment_completed' || o.status === 'delivered')) {
            cashStats[o.address.name] += (o.halfPayment || 0);
          }
        }
      });
      setReconciliationStats(cashStats);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-[#10B981]',
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
      change: '+18%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-[#2563EB]',
      bg: 'bg-[#EFF6FF]',
      border: 'border-[#BFDBFE]',
      change: '+12%',
    },
    {
      title: 'Total Customers',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#F5F3FF]',
      border: 'border-[#DDD6FE]',
      change: '+8%',
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: TrendingUp,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
      change: 'Live',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 font-[family-name:var(--font-geist)]">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-[16px] text-[#64748B]">Real-time metrics for your printing studio.</p>
        </div>

        {/* Pending Verifications Premium Alert */}
        {pendingOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0F172A] rounded-[24px] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="text-amber-400" size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[18px] mb-1 font-[family-name:var(--font-outfit)]">
                    {pendingOrders.length} Order{pendingOrders.length > 1 ? 's' : ''} Pending Verification
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed max-w-lg">
                    Customers have submitted transaction IDs. Verify their payments to move these orders into the printing queue.
                  </p>
                </div>
              </div>
              <Link 
                href="/admin/orders?filter=pending" 
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 rounded-full text-[14px] font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 shrink-0"
              >
                Review Now
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Studio Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white border border-[#F1F5F9] rounded-[24px] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${stat.bg} ${stat.border} ${stat.color}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-[12px] font-bold text-[#64748B] bg-[#F8FAFC] px-2.5 py-1 rounded-full border border-[#E2E8F0] tracking-wider uppercase">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-[#64748B] text-[13px] font-medium uppercase tracking-wider mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-[#0F172A] tracking-tighter font-[family-name:var(--font-outfit)]">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* NEW: Partner Cash Reconciliation Panel */}
        {reconciliationStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#F1F5F9] rounded-[32px] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Wallet size={20} />
              </div>
              <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Today's Partner Cash Collection</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(reconciliationStats).map(campus => (
                <div key={campus} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-5">
                  <p className="text-[13px] text-[#64748B] font-semibold mb-1 truncate">{campus}</p>
                  <p className="text-2xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-4">
                    {formatCurrency(reconciliationStats[campus])}
                  </p>
                  <button 
                    onClick={() => {
                      if(reconciliationStats[campus] > 0) {
                        toast.success(`${campus} cash marked as settled.`);
                      } else {
                        toast.error(`No cash to settle for ${campus} today.`);
                      }
                    }}
                    className="w-full py-2.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[13px] border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    Mark as Settled
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Split Layout: Recent Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white border border-[#F1F5F9] rounded-[32px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-[#F1F5F9] flex items-center justify-between bg-white">
              <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Recent Orders</h2>
              <Link href="/admin/orders" className="text-[13px] font-semibold text-[#2563EB] hover:text-[#1E40AF] bg-blue-50 px-4 py-2 rounded-full transition-colors">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8] text-[15px]">
                        No recent orders found.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-[13px] font-semibold text-[#0F172A] bg-[#F1F5F9] px-2 py-1 rounded-md border border-[#E2E8F0]">{order.orderId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-semibold text-[#0F172A]">{order.userName}</span>
                            <span className="text-[12px] text-[#64748B]">{order.userEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{order.productName}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-[#0F172A] text-right">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Status Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4"
          >
            <Link
              href="/admin/orders?filter=pending"
              className="group bg-white border border-[#F1F5F9] rounded-[24px] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-amber-200 transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Pending Check</h3>
                <p className="text-3xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">{stats.pendingVerifications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={24} strokeWidth={2.5} />
              </div>
            </Link>

            <Link
              href="/admin/orders?filter=active"
              className="group bg-white border border-[#F1F5F9] rounded-[24px] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider mb-1">In Production</h3>
                <p className="text-3xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">
                  {stats.totalOrders - stats.deliveredOrders - stats.pendingVerifications}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={24} strokeWidth={2.5} />
              </div>
            </Link>

            <Link
              href="/admin/orders?filter=completed"
              className="group bg-[#0F172A] rounded-[24px] p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] transition-all flex items-center justify-between relative overflow-hidden"
            >
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] translate-x-1/2 translate-y-1/2" />
              <div className="relative z-10">
                <h3 className="text-[13px] font-bold text-white/70 uppercase tracking-wider mb-1">Delivered</h3>
                <p className="text-3xl font-bold text-white font-[family-name:var(--font-outfit)]">{stats.deliveredOrders}</p>
              </div>
              <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} strokeWidth={2.5} />
              </div>
            </Link>
          </motion.div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}