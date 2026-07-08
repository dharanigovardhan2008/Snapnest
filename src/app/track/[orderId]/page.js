'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  ClipboardList,
  ShieldCheck,
  Printer,
  Package,
  Truck,
  MapPin,
  Download,
  MessageCircle,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import Navigation from '../../../components/shared/Navigation';
import Footer from '../../../components/shared/Footer';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import toast from 'react-hot-toast';

// FIREBASE IMPORTS
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Define the exact pipeline steps
const STATUS_FLOW = [
  { id: 'pending_verification', label: 'Order Placed', icon: ClipboardList, desc: 'Awaiting payment verification' },
  { id: 'verified', label: 'Payment Verified', icon: ShieldCheck, desc: 'Sent to production queue' },
  { id: 'printing', label: 'In Production', icon: Printer, desc: 'Being printed in our studio' },
  { id: 'shipped', label: 'Shipped', icon: Package, desc: 'Handed over to delivery partner' },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, desc: 'Arriving very soon' },
  { id: 'delivered', label: 'Delivered', icon: MapPin, desc: 'Enjoy your prints!' }
];

export default function TrackOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!params.orderId) return;

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('orderId', '==', params.orderId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const rawData = doc.data();
          
          // Fix for the Date Error: Convert Firestore Timestamps to ISO Strings safely
          const normalizedData = {
            id: doc.id,
            ...rawData,
            createdAt: rawData.createdAt?.toDate 
              ? rawData.createdAt.toDate().toISOString() 
              : rawData.createdAt,
            estimatedDelivery: rawData.estimatedDelivery?.toDate 
              ? rawData.estimatedDelivery.toDate().toISOString() 
              : rawData.estimatedDelivery,
          };
          
          setOrder(normalizedData);
        } else {
          toast.error('Order not found');
          router.push('/track');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center pt-24">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STATUS_FLOW.findIndex(s => s.id === order.status);
  
  // Calculate progress percentage for the connecting line
  const progressPercentage = currentStepIndex === -1 ? 0 : 
    currentStepIndex === STATUS_FLOW.length - 1 ? 100 : 
    (currentStepIndex / (STATUS_FLOW.length - 1)) * 100;

  const handleSupportClick = () => {
    const message = encodeURIComponent(`Hi SnapNest, I need help with my order: ${order.orderId}`);
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist)] selection:bg-[#0F172A]/10 selection:text-[#0F172A] flex flex-col relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60 translate-x-1/3 -translate-y-1/3" />
      
      <Navigation />
      
      <main className="flex-grow pt-32 pb-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Action */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/track')}
            className="group flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors font-medium text-[15px] bg-white border border-[#E2E8F0] px-4 py-2 rounded-full shadow-sm hover:shadow-md w-max"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Tracking
          </motion.button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="lg:col-span-7 bg-white rounded-[40px] p-8 md:p-10 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.05)] border border-[#F1F5F9] relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-1">
                    Tracking Details
                  </h1>
                  <p className="text-[#64748B] font-mono text-[14px] bg-[#F8FAFC] px-3 py-1 rounded-[8px] border border-[#E2E8F0] inline-block mt-2">
                    {order.orderId}
                  </p>
                </div>
                
                {order.estimatedDelivery && (
                  <div className="inline-flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-2xl w-max">
                    <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <Calendar size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[11px] text-blue-600/80 uppercase tracking-wider font-bold mb-0.5">Est. Delivery</p>
                      <p className="text-[15px] font-bold text-blue-700">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Timeline Component */}
              <div className="relative pl-4 md:pl-8">
                {/* Connecting Line (Background) */}
                <div className="absolute left-[35px] md:left-[51px] top-6 bottom-10 w-[2px] bg-[#F1F5F9]" />
                
                {/* Connecting Line (Active Progress) */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-[35px] md:left-[51px] top-6 w-[2px] bg-[#0F172A]" 
                />

                <div className="space-y-10">
                  {STATUS_FLOW.map((step, index) => {
                    const isCompleted = order.status === 'delivered' ? true : index < currentStepIndex;
                    const isCurrent = order.status === 'delivered' ? false : index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="relative flex items-start gap-6 group">
                        
                        {/* Step Icon Indicator */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0F172A] rounded-full flex items-center justify-center shadow-md">
                              <Check size={18} className="text-white" strokeWidth={3} />
                            </div>
                          ) : isCurrent ? (
                            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                              <div className="absolute inset-0 bg-white border-2 border-[#0F172A] rounded-full shadow-lg" />
                              <Icon size={18} className="text-[#0F172A] relative z-10" strokeWidth={2.5} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-[#E2E8F0] rounded-full flex items-center justify-center transition-colors group-hover:border-[#CBD5E1]">
                              <Icon size={18} className="text-[#94A3B8]" strokeWidth={2} />
                            </div>
                          )}
                        </div>

                        {/* Step Text */}
                        <div className={`pt-1 md:pt-2 flex-grow ${!isCompleted && !isCurrent ? 'opacity-50' : 'opacity-100'}`}>
                          <h3 className={`text-[16px] md:text-[18px] font-bold ${isCurrent ? 'text-[#0F172A]' : 'text-[#334155]'} font-[family-name:var(--font-outfit)]`}>
                            {step.label}
                          </h3>
                          <p className={`text-[14px] mt-1 ${isCurrent ? 'text-[#0F172A]' : 'text-[#64748B]'} font-light`}>
                            {step.desc}
                          </p>
                          
                          {/* Special message if waiting for manual payment verification */}
                          {isCurrent && step.id === 'pending_verification' && (
                            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-[12px] p-3 text-[13px] text-amber-800">
                              Please ensure you have paid via UPI. We are manually verifying your transaction ID.
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Details & Actions */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-[#F1F5F9]"
              >
                <h3 className="text-[18px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] mb-6 border-b border-[#F1F5F9] pb-4">
                  Order Summary
                </h3>
                
                <div className="flex items-center gap-4 mb-6">
                  {order.designUrl ? (
                    <div className="w-20 h-20 rounded-[16px] border border-[#E2E8F0] overflow-hidden flex-shrink-0 bg-[#F8FAFC]">
                      <img src={order.designUrl} alt="Product Design" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col items-center justify-center text-[#94A3B8] flex-shrink-0">
                      <ImageIcon size={24} className="mb-1" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#0F172A] text-[16px]">{order.productName}</p>
                    <p className="text-[14px] text-[#64748B] capitalize mt-0.5">{order.deliveryType} Delivery</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-[#64748B]">Order Date</span>
                    <span className="font-medium text-[#0F172A]">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-[#64748B]">Total Amount</span>
                    <span className="font-medium text-[#0F172A]">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] font-bold text-[#0F172A]">Amount Paid</span>
                    <span className="text-[18px] font-bold text-emerald-600 font-[family-name:var(--font-outfit)]">
                      {formatCurrency(order.halfPayment)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons (Desktop layout) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden md:flex flex-col gap-4"
              >
                <button 
                  onClick={handlePrintReceipt}
                  className="w-full bg-white hover:bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#0F172A] text-[#0F172A] rounded-full py-4 text-[16px] font-bold transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Download size={20} />
                  Download Receipt
                </button>
                <button 
                  onClick={handleSupportClick}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full py-4 text-[16px] font-bold transition-all shadow-lg shadow-[#25D366]/30 active:scale-95 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={20} />
                  Contact Support
                </button>
              </motion.div>

            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-[#E2E8F0] p-4 z-50 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handlePrintReceipt}
          className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-full py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Download size={18} /> Receipt
        </button>
        <button 
          onClick={handleSupportClick}
          className="flex-1 bg-[#25D366] text-white rounded-full py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md shadow-[#25D366]/20"
        >
          <MessageCircle size={18} /> Support
        </button>
      </div>

      <Footer />
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          main, main * { visibility: visible; }
          main { position: absolute; left: 0; top: 0; padding: 0; margin: 0; width: 100%; }
          .md\\:hidden, button, nav, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}