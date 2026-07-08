'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Package,
  Eye,
  Download,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ImageIcon,
  PhoneCall // NEW: Imported PhoneCall icon
} from 'lucide-react';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../lib/firestore';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppLink,
  generateOrderWhatsAppMessage,
} from '../../utils/helpers';
import toast from 'react-hot-toast';

function MyOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getUserOrders(user.uid);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    window.location.href = `/order?product=${order.productId}`;
  };

  // Generates and downloads a direct .pdf file
  const downloadReceipt = (order) => {
    toast.loading('Generating Premium PDF...', { id: 'pdf-toast' });

    // 1. Create a hidden container for the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    
    // Premium A4 PDF Layout
    container.innerHTML = `
      <div id="pdf-receipt-content" style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; width: 800px; background: white;">
        <div style="text-align: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 30px; margin-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: 800; letter-spacing: -1px; margin: 0; color: #0F172A;">SnapNest</h1>
          <p style="color: #64748B; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Official Studio Receipt</p>
        </div>
        
        <table style="width: 100%; margin-bottom: 40px;">
          <tr>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Billed To</p>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">${order.userName}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748B;">${order.userEmail}</p>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Order Reference</p>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">${order.orderId}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748B;">${formatDate(order.createdAt)}</p>
            </td>
          </tr>
        </table>

        <div style="background: #F8FAFC; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748B; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">Order Details</h3>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #334155; font-weight: 500;">Product Format</span>
            <span style="font-weight: 600; color: #0F172A;">${order.productName}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #334155; font-weight: 500;">Delivery Method</span>
            <span style="font-weight: 600; color: #0F172A;">${order.deliveryType === 'delivery' ? 'Home Delivery' : 'Studio Pickup'}</span>
          </div>

          ${order.deliveryType === 'delivery' ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #334155; font-weight: 500;">Destination</span>
            <span style="font-weight: 600; color: #0F172A; text-align: right;">${order.address?.name || ''}, ${order.address?.city || ''}</span>
          </div>
          ` : ''}

          ${order.address?.partnerPhone ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #334155; font-weight: 500;">Agent Contact</span>
            <span style="font-weight: 600; color: #0F172A; text-align: right;">${order.address.partnerPhone}</span>
          </div>
          ` : ''}
        </div>

        <div style="background: #0F172A; border-radius: 16px; padding: 30px; color: white;">
          <h3 style="margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; border-bottom: 1px solid #334155; padding-bottom: 10px;">Payment Summary</h3>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #CBD5E1;">Base Price</span>
            <span style="font-weight: 600;">${formatCurrency(order.price)}</span>
          </div>

          ${order.discountApplied > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #34D399;">Loyalty Discount Applied</span>
            <span style="font-weight: 600; color: #34D399;">-${formatCurrency(order.discountApplied)}</span>
          </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #CBD5E1;">Advance Paid</span>
            <span style="font-weight: 600;">${formatCurrency(order.halfPayment)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #334155; font-size: 24px; font-weight: 800;">
            <span>Total Value</span>
            <span>${formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 50px; color: #94A3B8; font-size: 12px;">
          <p>Thank you for trusting SnapNest with your memories.</p>
          <p>Generated automatically on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);

    // 2. Load the HTML2PDF library dynamically to generate the file
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = document.getElementById('pdf-receipt-content');
      const opt = {
        margin:       0,
        filename:     `SnapNest_Receipt_${order.orderId}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // Generate and save
      window.html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(container);
        toast.success('PDF Receipt Downloaded!', { id: 'pdf-toast' });
      }).catch((err) => {
        console.error('PDF Error:', err);
        toast.error('Failed to generate PDF', { id: 'pdf-toast' });
        document.body.removeChild(container);
      });
    };
    document.head.appendChild(script);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending_verification';
    if (filter === 'active')
      return ['verified', 'printing', 'shipped', 'out_for_delivery'].includes(order.status);
    if (filter === 'completed') return order.status === 'delivered';
    return true;
  });

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <Navigation />
        <div className="pt-32 pb-24 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-[family-name:var(--font-geist)] selection:bg-[#2563EB]/10 selection:text-[#0F172A]">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">
                Client Gallery
              </h1>
              <p className="text-[17px] text-[#64748B] font-light">
                Track and manage your printed memories.
              </p>
            </div>
            <button 
              onClick={loadOrders} 
              className="flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] px-6 py-3 rounded-full text-[14px] font-medium transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={16} />
              Sync Data
            </button>
          </div>

          {/* Premium Filter Tabs (Segmented Control) */}
          <div className="mb-10 inline-flex p-1.5 bg-[#E2E8F0]/50 rounded-full overflow-x-auto custom-scrollbar w-full sm:w-auto">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'active', label: 'In Studio' },
              { key: 'completed', label: 'Completed' },
            ].map((tab) => {
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`relative px-6 py-2.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'text-[#0F172A] shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-white rounded-full z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-[#F1F5F9] rounded-[40px] text-center py-24 px-6 shadow-sm"
              >
                <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={32} className="text-[#94A3B8]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#0F172A] font-[family-name:var(--font-outfit)]">No orders found</h3>
                <p className="text-[16px] text-[#64748B] mb-8 font-light">Your gallery is currently empty.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#2563EB] text-white px-8 py-4 rounded-full text-[15px] font-medium transition-all hover:shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95">
                  Browse Catalog
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : (
              <motion.div className="space-y-6">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white border border-[#F1F5F9] rounded-[32px] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] transition-all duration-300"
                  >
                    {/* Top Row: Meta Data */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-[#E2E8F0] text-[12px] font-bold text-[#0F172A] tracking-wider uppercase">
                          ID: {order.orderId}
                        </div>
                        <span className="text-[13px] text-[#94A3B8] font-medium">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Middle Row: Product & Images */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      {/* Images Gallery Block */}
                      {(order.designUrl || order.proofUrl) && (
                        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                          {order.designUrl && (
                            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-[16px] overflow-hidden border border-[#E2E8F0] shrink-0 bg-[#F8FAFC] group cursor-pointer">
                              <img src={order.designUrl} alt="Design" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-1.5 text-center">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Original</span>
                              </div>
                            </div>
                          )}
                          {order.proofUrl && (
                            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-[16px] overflow-hidden border border-[#E2E8F0] shrink-0 bg-[#F8FAFC] group cursor-pointer">
                              <img src={order.proofUrl} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 backdrop-blur-sm p-1.5 text-center">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Printed Proof</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Details & Pricing */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-[#0F172A] mb-2 font-[family-name:var(--font-outfit)]">{order.productName}</h3>
                          
                          {/* NEW: Expected Delivery + Partner Phone */}
                          <div className="space-y-1.5 mt-2">
                            {order.estimatedDelivery && (
                              <p className="text-[14px] text-[#64748B] flex items-center gap-2">
                                <Package size={16} className="text-[#94A3B8]" />
                                Expected by: <span className="font-medium text-[#0F172A]">{formatDate(order.estimatedDelivery)}</span>
                              </p>
                            )}
                            {order.address?.partnerPhone && (
                              <p className="text-[14px] text-[#64748B] flex items-center gap-2">
                                <PhoneCall size={16} className="text-[#94A3B8]" />
                                Agent Contact: <a href={`tel:${order.address.partnerPhone}`} className="font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors">{order.address.partnerPhone}</a>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex items-end justify-between md:justify-start md:gap-8">
                          <div>
                            <p className="text-[12px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1">Total Value</p>
                            <p className="text-2xl font-bold text-[#0F172A]">{formatCurrency(order.total)}</p>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1">Advance Paid</p>
                            <p className="text-[16px] font-medium text-[#64748B]">{formatCurrency(order.halfPayment)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#F1F5F9]">
                      <Link
                        href={`/track/${order.orderId}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] text-[14px] font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Track
                      </Link>
                      
                      <button
                        onClick={() => downloadReceipt(order)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] text-[14px] font-medium transition-colors"
                      >
                        <Download size={16} />
                        Save PDF
                      </button>
                      
                      <a
                        href={generateWhatsAppLink('+919876543210', generateOrderWhatsAppMessage(order))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#047857] text-[14px] font-medium transition-colors"
                      >
                        <MessageCircle size={16} />
                        Studio Chat
                      </a>

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleReorder(order)}
                          className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#2563EB] text-white text-[14px] font-medium transition-all shadow-[0_4px_14px_rgba(15,23,42,0.2)] active:scale-95"
                        >
                          <RefreshCw size={16} />
                          Print Again
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <MyOrdersContent />
    </ProtectedRoute>
  );
}