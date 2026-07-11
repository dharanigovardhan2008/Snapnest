'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  Palette,
  ShieldCheck,
  Receipt,
  Copy,
  CheckCircle2,
  PackageCheck,
  Gift,
  CheckSquare
} from 'lucide-react';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import ImageUpload from '../../components/shared/ImageUpload';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { orderService, addressService, configService, loyaltyService } from '../../lib/firestore';
import { formatCurrency, generateOrderId } from '../../utils/helpers';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('../../components/3d/Scene3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] bg-[#F8FAFC] rounded-[24px] animate-pulse border border-[#F1F5F9]" />,
});

function OrderContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const router = useRouter();
  const { user } = useAuth();
  const { products, getProduct } = useProducts();

  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [designUrl, setDesignUrl] = useState(null);
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customAddress, setCustomAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [transactionId, setTransactionId] = useState('');
  const [config, setConfig] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    loadData();
  }, [products, user]);

  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.type !== 'custom' && selectedProduct.imageUrl) {
        setDesignUrl(selectedProduct.imageUrl);
      } else if (selectedProduct.type === 'custom') {
        // For custom products, only reset designUrl when product changes
        // This allows users to upload their own design
        setDesignUrl(null);
      }
    }
  }, [selectedProduct?.id]); // Changed dependency to only trigger when product ID changes

  const loadData = async () => {
    if (productId && products.length > 0) {
      const product = getProduct(productId);
      setSelectedProduct(product);
    }

    const addressData = await addressService.getAddresses();
    setAddresses(addressData);

    const configData = await configService.getConfig();
    setConfig(configData);

    if (user?.uid) {
      const loyaltyData = await loyaltyService.getLoyalty(user.uid);
      setLoyalty(loyaltyData);
    }
  };

  const handleImageUpload = (url) => {
    if (url && selectedProduct?.type === 'custom') {
      setDesignUrl(url);
      toast.success('Image uploaded successfully!');
    } else if (url && selectedProduct?.type !== 'custom') {
      toast.error('This product doesn\'t require image upload.');
    } else if (!url) {
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (step === 2 && !designUrl) {
      toast.error(selectedProduct.type === 'custom' ? 'Please upload your design' : 'Product image missing from catalog');
      return;
    }

    if (step === 3) {
      if (deliveryType === 'delivery' && !selectedAddress && !isCustomAddressFilled()) {
        toast.error('Please select or enter a delivery address');
        return;
      }
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const isCustomAddressFilled = () => {
    return (
      customAddress.name &&
      customAddress.address &&
      customAddress.city &&
      customAddress.state &&
      customAddress.pincode
    );
  };

  // --- Dynamic Pricing Calculations ---
  const basePrice = selectedProduct?.price || 0;
  const pointValueRupees = config?.pointValueInRupees || 1;
  const userPoints = loyalty?.points || 0;
  const maxDiscountValue = userPoints * pointValueRupees;
  
  // They can't discount more than the base product price
  const appliedDiscount = usePoints ? Math.min(maxDiscountValue, basePrice) : 0;
  const finalPrice = Math.max(0, basePrice - appliedDiscount);
  const halfPayment = finalPrice / 2;
  const pointsUsed = usePoints ? Math.ceil(appliedDiscount / pointValueRupees) : 0;
  // ------------------------------------

  const handlePlaceOrder = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setLoading(true);

    try {
      const orderId = generateOrderId();

      const orderData = {
        orderId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.name,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        designUrl,
        price: basePrice,
        discountApplied: appliedDiscount,
        pointsUsed: pointsUsed,           
        total: finalPrice,
        halfPayment: halfPayment,
        deliveryType,
        address:
          deliveryType === 'delivery'
            ? selectedAddress || customAddress
            : { type: 'self-pickup' },
        transactionId: transactionId.trim().toUpperCase(),
      };

      await orderService.createOrder(orderData);

      // Deduct used points from user immediately upon order placement
      if (pointsUsed > 0) {
        await loyaltyService.updateLoyalty(user.uid, {
          points: userPoints - pointsUsed
        });
      }

      toast.success('Order placed successfully!');
      router.push('/my-orders');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!selectedProduct && products.length > 0) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen font-[family-name:var(--font-geist)]">
        <Navigation />
        <main className="pt-40 pb-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">
              Select a Product
            </h1>
            <p className="text-[17px] text-[#64748B] mb-12 font-light">
              Choose the format for your next masterpiece.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    router.push(`/order?product=${product.id}`);
                  }}
                  className="group bg-[#FFFFFF] border border-[#F1F5F9] rounded-[32px] p-8 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="aspect-square bg-[#F8FAFC] rounded-[20px] mb-6 flex items-center justify-center group-hover:bg-blue-50/50 transition-colors overflow-hidden">
                    {product.imageUrl ? (
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                       product.type === 'custom' ? <Palette size={48} className="text-[#E11D48]" /> : <Sparkles size={48} className="text-[#2563EB]" />
                    )}
                  </div>
                  <h3 className="text-[20px] font-semibold mb-2 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">{product.name}</h3>
                  <p className="text-[24px] font-bold text-[#0F172A]">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-[family-name:var(--font-geist)] selection:bg-[#2563EB]/10 selection:text-[#0F172A]">
      <Navigation />
      <main className="pt-28 md:pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          
          {/* Progress Tracker */}
          <div className="mb-12 hidden md:block">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#E2E8F0] z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#0F172A] z-0 transition-all duration-500 ease-[0.16,1,0.3,1]" 
                style={{ width: `${((step - 1) / 3) * 100}%` }} 
              />
              
              {['Product', selectedProduct?.type === 'custom' ? 'Upload' : 'Review', 'Delivery', 'Payment'].map((label, index) => {
                const s = index + 1;
                const isActive = s === step;
                const isCompleted = s < step;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-[15px] transition-all duration-500 ${
                        isActive ? 'bg-[#0F172A] text-white shadow-[0_4px_14px_rgba(15,23,42,0.3)] scale-110' :
                        isCompleted ? 'bg-[#0F172A] text-white' : 'bg-white border-2 border-[#E2E8F0] text-[#94A3B8]'
                      }`}
                    >
                      {isCompleted ? <Check size={18} strokeWidth={3} /> : s}
                    </div>
                    <span className={`text-[13px] font-medium absolute -bottom-7 w-max transition-colors duration-300 ${isActive ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Progress Indicator */}
          <div className="md:hidden flex items-center justify-between mb-8 px-2">
            <span className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider">Step {step} of 4</span>
            <span className="text-[15px] font-semibold text-[#0F172A] font-[family-name:var(--font-outfit)]">
              {['Format', selectedProduct?.type === 'custom' ? 'Upload Design' : 'Review Design', 'Delivery', 'Payment'][step - 1]}
            </span>
          </div>

          {/* Main Card */}
          <div className="bg-[#FFFFFF] border border-[#F1F5F9] rounded-[32px] md:rounded-[40px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] p-5 md:p-12 overflow-hidden relative min-h-[500px] flex flex-col">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex-grow flex flex-col"
              >
                
                {/* Step 1: Product Selection */}
                {step === 1 && selectedProduct && (
                  <div>
                    <h2 className="text-3xl font-semibold mb-8 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Format Details</h2>
                    <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                      <div className="aspect-square w-full bg-[#F8FAFC] rounded-[32px] border border-[#F1F5F9] flex items-center justify-center shadow-inner overflow-hidden relative">
                        {selectedProduct.imageUrl ? (
                          <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-8xl">
                            {selectedProduct.type === 'custom' ? '✨' : '📸'}
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider text-[#0F172A] border border-[#E2E8F0]">
                          {selectedProduct.type === 'custom' ? 'Custom Print' : 'Pre-Printed Edition'}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-[32px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-2">{selectedProduct.name}</h3>
                          <p className="text-[17px] text-[#64748B] leading-relaxed">{selectedProduct.description}</p>
                        </div>
                        <div className="space-y-3 bg-[#F8FAFC] p-6 rounded-[24px] border border-[#F1F5F9]">
                          <div className="flex justify-between items-center text-[15px]">
                            <span className="text-[#64748B]">Dimensions</span>
                            <span className="font-medium text-[#0F172A]">{selectedProduct.size}</span>
                          </div>
                          {selectedProduct.type === 'custom' && (
                            <div className="flex justify-between items-center text-[15px]">
                              <span className="text-[#64748B]">Min Resolution</span>
                              <span className="font-medium text-[#0F172A]">{selectedProduct.minResolution?.width || 0}x{selectedProduct.minResolution?.height || 0}px</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-2">
                          <p className="text-[36px] font-bold text-[#0F172A] tracking-tighter">
                            {formatCurrency(selectedProduct.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Design Upload / Review */}
                {step === 2 && selectedProduct && (
                  <div className="flex flex-col flex-grow">
                    <h2 className="text-3xl font-semibold mb-6 md:mb-8 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">
                      {selectedProduct.type === 'custom' ? 'Your Masterpiece' : 'Product Review'}
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 flex-grow">
                      <div className="bg-[#F8FAFC] rounded-[24px] md:rounded-[32px] border border-[#F1F5F9] p-4 md:p-6 min-h-[300px] md:min-h-0 flex flex-col">
                        {selectedProduct.type === 'custom' ? (
                          <ImageUpload
                            onUploadSuccess={handleImageUpload}
                            minResolution={selectedProduct.minResolution}
                            folder="designs"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <div className="w-16 h-16 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
                              <PackageCheck size={32} />
                            </div>
                            <h3 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] mb-2">Standard Studio Edition</h3>
                            <p className="text-[#64748B] text-[15px] leading-relaxed max-w-[250px]">
                              This is a pre-designed product. No upload is required.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-[#F8FAFC] rounded-[24px] md:rounded-[32px] border border-[#F1F5F9] p-4 md:p-6 flex flex-col min-h-[400px] lg:min-h-0">
                        <h3 className="font-semibold text-[#0F172A] mb-4 text-[16px] flex items-center justify-between">
                          <span>Studio Live Preview</span>
                          <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Interactive 3D</span>
                        </h3>
                        <div className="flex-grow w-full rounded-[16px] md:rounded-[20px] overflow-hidden border border-[#E2E8F0]/50 bg-white relative">
                          <Scene3D imageUrl={designUrl} type={selectedProduct.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Delivery */}
                {step === 3 && (
                  <div>
                    <h2 className="text-3xl font-semibold mb-8 text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Receiving Your Prints</h2>
                    
                    <div className="mb-8 md:mb-10">
                      <div className="grid grid-cols-2 gap-2 md:gap-4 bg-[#F8FAFC] p-1.5 md:p-2 rounded-full border border-[#F1F5F9]">
                        <button
                          onClick={() => setDeliveryType('delivery')}
                          className={`py-3 md:py-3.5 px-4 md:px-6 rounded-full flex items-center justify-center gap-2 md:gap-3 text-[14px] md:text-[15px] font-medium transition-all duration-300 ${
                            deliveryType === 'delivery'
                              ? 'bg-[#0F172A] text-white shadow-md'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                          }`}
                        >
                          <MapPin size={18} />
                          <span className="hidden sm:inline">Studio Delivery</span>
                          <span className="sm:hidden">Delivery</span>
                        </button>
                        <button
                          onClick={() => setDeliveryType('pickup')}
                          className={`py-3 md:py-3.5 px-4 md:px-6 rounded-full flex items-center justify-center gap-2 md:gap-3 text-[14px] md:text-[15px] font-medium transition-all duration-300 ${
                            deliveryType === 'pickup'
                              ? 'bg-[#0F172A] text-white shadow-md'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                          }`}
                        >
                          <Upload size={18} />
                          Self Pickup
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {deliveryType === 'delivery' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-8"
                        >
                          <div>
                            <h3 className="font-semibold text-[#0F172A] mb-4 text-[16px]">Saved Locations</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {addresses.map((addr) => {
                                const isSelected = selectedAddress?.id === addr.id;
                                return (
                                  <label
                                    key={addr.id}
                                    className={`relative block p-5 rounded-[24px] cursor-pointer transition-all duration-300 ${
                                      isSelected
                                        ? 'bg-white border-2 border-[#0F172A] shadow-[0_4px_14px_rgba(15,23,42,0.06)]'
                                        : 'bg-[#F8FAFC] border-2 border-[#F1F5F9] hover:border-[#E2E8F0]'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="address"
                                      className="hidden"
                                      onChange={() => {
                                        setSelectedAddress(addr);
                                        setCustomAddress({ name: '', address: '', city: '', state: '', pincode: '' });
                                      }}
                                    />
                                    {isSelected && (
                                      <div className="absolute top-4 right-4 text-[#0F172A]">
                                        <Check size={20} strokeWidth={3} />
                                      </div>
                                    )}
                                    <p className="font-bold text-[#0F172A] mb-1.5 text-[16px]">{addr.name}</p>
                                    <p className="text-[14px] text-[#64748B] leading-relaxed pr-6">
                                      {addr.address},<br/>{addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-[#E2E8F0]"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-white px-4 text-[13px] font-medium text-[#94A3B8] uppercase tracking-wider">Or</span>
                            </div>
                          </div>

                          <div className={`border-2 rounded-[24px] md:rounded-[32px] p-5 md:p-6 transition-all duration-300 ${!selectedAddress && isCustomAddressFilled() ? 'border-[#0F172A] bg-white' : 'border-[#F1F5F9] bg-[#F8FAFC]'}`}>
                            <p className="font-semibold text-[#0F172A] mb-5 text-[16px]">Enter New Address</p>
                            <div className="space-y-4">
                              <input type="text" placeholder="Name / Building" value={customAddress.name} onChange={(e) => { setCustomAddress({ ...customAddress, name: e.target.value }); setSelectedAddress(null); }} className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-full py-3.5 px-5 md:px-6 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px]" />
                              <input type="text" placeholder="Street Address" value={customAddress.address} onChange={(e) => setCustomAddress({ ...customAddress, address: e.target.value })} className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-full py-3.5 px-5 md:px-6 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px]" />
                              <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <input type="text" placeholder="City" value={customAddress.city} onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })} className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-full py-3.5 px-5 md:px-6 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px]" />
                                <input type="text" placeholder="State" value={customAddress.state} onChange={(e) => setCustomAddress({ ...customAddress, state: e.target.value })} className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-full py-3.5 px-5 md:px-6 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px]" />
                              </div>
                              <input type="text" placeholder="Pincode" value={customAddress.pincode} onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })} className="w-full bg-white border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-full py-3.5 px-5 md:px-6 text-[#0F172A] transition-all outline-none placeholder:text-[#94A3B8] text-[15px]" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Step 4: Premium Secure Payment & LOYALTY */}
                {step === 4 && selectedProduct && config && (
                  <div className="max-w-2xl mx-auto w-full">
                    
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-100">
                        <ShieldCheck size={28} strokeWidth={2} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-semibold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">Secure Transfer</h2>
                    </div>

                    {userPoints > 0 && (
                      <div className={`mb-6 p-5 border-2 rounded-[24px] transition-all duration-300 cursor-pointer ${usePoints ? 'border-indigo-500 bg-indigo-50' : 'border-[#F1F5F9] bg-[#F8FAFC] hover:border-[#E2E8F0]'}`} onClick={() => setUsePoints(!usePoints)}>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${usePoints ? 'bg-indigo-500 text-white' : 'bg-white border border-[#E2E8F0] text-indigo-500'}`}>
                              <Gift size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A] text-[16px]">Apply Loyalty Points</p>
                              <p className="text-[13px] text-[#64748B]">You have {userPoints} points (Worth {formatCurrency(maxDiscountValue)})</p>
                            </div>
                          </div>
                          <div>
                            {usePoints ? (
                              <CheckSquare size={24} className="text-indigo-600" />
                            ) : (
                              <div className="w-6 h-6 rounded border-2 border-[#CBD5E1]" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#0F172A] rounded-[24px] md:rounded-[32px] p-6 md:p-10 text-white relative overflow-hidden mb-8 shadow-2xl shadow-blue-900/20">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        
                        <div className="w-full md:w-auto">
                          <p className="text-[#94A3B8] text-[12px] md:text-[13px] uppercase tracking-widest font-semibold mb-2">Amount Due Now (50%)</p>
                          
                          <div className="flex items-end gap-3 mb-3">
                            <p className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-outfit)] tracking-tighter text-white">
                              {formatCurrency(halfPayment)}
                            </p>
                            {usePoints && appliedDiscount > 0 && (
                              <p className="text-lg md:text-xl font-medium text-white/40 line-through pb-1">
                                {formatCurrency(basePrice / 2)}
                              </p>
                            )}
                          </div>
                          
                          <p className="text-[#64748B] text-[12px] md:text-[13px] bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">
                            Remaining {formatCurrency(halfPayment)} paid on delivery
                          </p>
                        </div>
                        
                        <div className="w-full md:w-[360px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 md:p-6 shadow-xl shrink-0">
                          <p className="text-[12px] text-white/90 uppercase tracking-[0.1em] mb-5 flex items-center gap-2 font-bold">
                            <CreditCard size={15} className="text-blue-400" strokeWidth={2.5} />
                            Transfer Details
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4 bg-[#0B1121] py-3.5 px-4 rounded-[16px] border border-white/[0.02] shadow-inner">
                              <span className="text-[#94A3B8] text-[13px] font-medium w-12">UPI ID</span>
                              <span className="font-mono text-[14px] font-bold text-white tracking-wide truncate">{config.upiId}</span>
                              <button onClick={() => handleCopy(config.upiId, 'UPI ID')} className="text-blue-400 hover:text-blue-300">
                                {copiedField === 'UPI ID' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4 bg-[#0B1121] py-3.5 px-4 rounded-[16px] border border-white/[0.02] shadow-inner">
                              <span className="text-[#94A3B8] text-[13px] font-medium w-12">Mobile</span>
                              <span className="font-mono text-[14px] font-bold text-white tracking-wide truncate">{config.mobileNumber}</span>
                              <button onClick={() => handleCopy(config.mobileNumber, 'Mobile Number')} className="text-blue-400 hover:text-blue-300">
                                {copiedField === 'Mobile Number' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-[24px] md:rounded-[32px] p-6 md:p-8">
                      <div className="flex items-center justify-center gap-3 mb-3 text-center">
                        <Receipt size={20} className="text-[#0F172A]" />
                        <h3 className="text-[18px] font-semibold text-[#0F172A] font-[family-name:var(--font-outfit)]">Verify Payment</h3>
                      </div>
                      <p className="text-[14px] text-[#64748B] mb-8 text-center max-w-md mx-auto">
                        Enter the 12-digit UTR or Transaction ID to confirm.
                      </p>
                      <div className="relative max-w-sm mx-auto">
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          className="w-full bg-white border-2 border-[#E2E8F0] focus:border-[#2563EB] rounded-2xl py-4 px-6 text-[#0F172A] text-center text-[18px] font-mono transition-all outline-none"
                          placeholder="e.g. 312345678901"
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between mt-8 md:mt-10 pt-6 border-t border-[#F1F5F9] gap-4">
              {step > 1 ? (
                <button onClick={handlePrevStep} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full h-[56px] px-8 font-medium">
                  <ArrowLeft size={18} /> Back
                </button>
              ) : <div className="hidden sm:block" />}

              {step < 4 ? (
                <button onClick={handleNextStep} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#2563EB] text-white rounded-full h-[56px] px-10 font-medium sm:ml-auto">
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#2563EB] text-white rounded-full h-[56px] px-12 font-medium sm:ml-auto">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Confirm Payment</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrderPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen pt-32 flex items-center justify-center"><LoadingSpinner /></div>}>
        <OrderContent />
      </Suspense>
    </ProtectedRoute>
  );
}