'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Star, Megaphone, MessageSquareText, HelpCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { faqService, reviewService, bannerService } from '../../../lib/firestore';
import toast from 'react-hot-toast';

function AdminContentContent() {
  const [activeTab, setActiveTab] = useState('faqs');
  const [loading, setLoading] = useState(true);

  // FAQs
  const [faqs, setFaqs] = useState([]);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [faqData, setFaqData] = useState({ question: '', answer: '', order: 1 });

  // Reviews
  const [reviews, setReviews] = useState([]);

  // Banner
  const [banner, setBanner] = useState(null);
  const [editingBanner, setEditingBanner] = useState(false);
  const [bannerData, setBannerData] = useState({ active: true, text: '', color: 'mint' });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [faqsData, reviewsData, bannerData] = await Promise.all([
        faqService.getFAQs(),
        reviewService.getReviews(),
        bannerService.getBanner(),
      ]);
      // Sort FAQs by order
      setFaqs(faqsData.sort((a, b) => a.order - b.order));
      setReviews(reviewsData);
      setBanner(bannerData);
      setBannerData(bannerData);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // FAQ Functions
  const handleEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setFaqData({ question: faq.question, answer: faq.answer, order: faq.order });
  };

  const handleSaveFaq = async (faqId) => {
    if (!faqData.question || !faqData.answer) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await faqService.updateFAQ(faqId, faqData);
      toast.success('FAQ updated');
      setEditingFaqId(null);
      setFaqData({ question: '', answer: '', order: 1 });
      loadContent();
    } catch (error) {
      toast.error('Failed to update FAQ');
    }
  };

  const handleAddFaq = async () => {
    if (!faqData.question || !faqData.answer) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await faqService.addFAQ(faqData);
      toast.success('FAQ added');
      setShowAddFaq(false);
      setFaqData({ question: '', answer: '', order: 1 });
      loadContent();
    } catch (error) {
      toast.error('Failed to add FAQ');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await faqService.deleteFAQ(faqId);
      toast.success('FAQ deleted');
      loadContent();
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  // Review Functions
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to remove this review?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted');
      loadContent();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  // Banner Functions
  const handleSaveBanner = async () => {
    try {
      await bannerService.updateBanner(bannerData);
      toast.success('Banner updated');
      setEditingBanner(false);
      loadContent();
    } catch (error) {
      toast.error('Failed to update banner');
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

  return (
    <AdminLayout>
      <div className="space-y-8 font-[family-name:var(--font-geist)] max-w-5xl">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-2">Content Management</h1>
          <p className="text-[16px] text-[#64748B] font-light">Control the front-end messaging and customer testimonials.</p>
        </div>

        {/* Premium Segmented Tabs */}
        <div className="inline-flex p-1.5 bg-white border border-[#E2E8F0] rounded-full overflow-x-auto w-full sm:w-auto shadow-sm">
          {[
            { key: 'faqs', label: 'FAQ Data', icon: HelpCircle },
            { key: 'reviews', label: 'Testimonials', icon: MessageSquareText },
            { key: 'banner', label: 'Site Banner', icon: Megaphone },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-3 rounded-full text-[14px] font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  isActive ? 'text-white' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeContentTab"
                    className="absolute inset-0 bg-[#0F172A] rounded-full z-0 shadow-md"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon size={16} className={`relative z-10 ${isActive ? 'text-white' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- FAQS TAB --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'faqs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-[32px] p-6 border border-[#F1F5F9] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">Frequently Asked Questions</h2>
                  <p className="text-[14px] text-[#64748B]">Manage answers displayed on the homepage.</p>
                </div>
                <button onClick={() => setShowAddFaq(true)} className="mt-4 sm:mt-0 flex items-center gap-2 bg-[#0F172A] hover:bg-[#2563EB] text-white px-6 py-3 rounded-full text-[14px] font-bold transition-all shadow-[0_4px_14px_rgba(15,23,42,0.2)] active:scale-95">
                  <Plus size={18} /> Add New FAQ
                </button>
              </div>

              {showAddFaq && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-blue-500/20 rounded-[32px] shadow-lg p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
                  <h3 className="text-[18px] font-bold text-[#0F172A] mb-6">Create New FAQ</h3>
                  <FAQForm
                    data={faqData}
                    setData={setFaqData}
                    onSave={handleAddFaq}
                    onCancel={() => { setShowAddFaq(false); setFaqData({ question: '', answer: '', order: 1 }); }}
                  />
                </motion.div>
              )}

              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isEditing = editingFaqId === faq.id;
                  return (
                    <motion.div key={faq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white rounded-[24px] border border-[#F1F5F9] p-6 transition-all ${isEditing ? 'shadow-lg border-[#0F172A]' : 'shadow-[0_4px_15px_-10px_rgba(0,0,0,0.05)] hover:border-[#E2E8F0]'}`}>
                      {isEditing ? (
                        <FAQForm
                          data={faqData}
                          setData={setFaqData}
                          onSave={() => handleSaveFaq(faq.id)}
                          onCancel={() => { setEditingFaqId(null); setFaqData({ question: '', answer: '', order: 1 }); }}
                        />
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] font-mono text-[12px] font-bold shrink-0 mt-1">
                              {faq.order}
                            </div>
                            <div>
                              <h3 className="font-bold text-[16px] text-[#0F172A] mb-2">{faq.question}</h3>
                              <p className="text-[14px] text-[#64748B] leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleEditFaq(faq)} className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB]/30 transition-colors">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteFaq(faq.id)} className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {faqs.length === 0 && !showAddFaq && (
                  <div className="text-center py-12 bg-white border border-[#F1F5F9] rounded-[32px]">
                    <HelpCircle size={40} className="mx-auto text-[#E2E8F0] mb-3" />
                    <p className="text-[#64748B] font-medium">No FAQs created yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* --- REVIEWS TAB --- */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               <div className="bg-white rounded-[32px] p-6 border border-[#F1F5F9] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
                <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">Public Testimonials</h2>
                <p className="text-[14px] text-[#64748B]">Manage reviews submitted by customers after their prints arrive.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, index) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] border border-[#F1F5F9] p-8 relative group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-[#E2E8F0]'} />
                        ))}
                      </div>
                      <button onClick={() => handleDeleteReview(review.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[15px] text-[#334155] leading-relaxed mb-6 italic">"{review.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-[14px]">
                        {review.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A] text-[14px]">{review.name}</p>
                        <p className="text-[12px] text-[#94A3B8]">Verified Buyer</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {reviews.length === 0 && (
                <div className="text-center py-16 bg-white border border-[#F1F5F9] rounded-[32px]">
                  <MessageSquareText size={40} className="mx-auto text-[#E2E8F0] mb-3" />
                  <p className="text-[#64748B] font-medium text-[15px]">No reviews have been submitted yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* --- BANNER TAB --- */}
          {activeTab === 'banner' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-[#F1F5F9]">
                <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] mb-1">Store Announcement Banner</h2>
                <p className="text-[14px] text-[#64748B] mb-8">This banner appears at the very top of the customer-facing website.</p>

                {editingBanner ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] flex items-center justify-between cursor-pointer" onClick={() => setBannerData({ ...bannerData, active: !bannerData.active })}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${bannerData.active ? 'bg-emerald-500' : 'bg-[#CBD5E1]'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${bannerData.active ? 'translate-x-6' : ''}`} />
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] text-[15px] block">Banner Visibility</span>
                          <span className="text-[12px] text-[#64748B]">Toggle whether the banner is shown to visitors</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Announcement Text</label>
                      <input
                        type="text"
                        value={bannerData.text}
                        onChange={(e) => setBannerData({ ...bannerData, text: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-medium transition-all outline-none text-[15px]"
                        placeholder="e.g. Free shipping on all orders over ₹999!"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Accent Color</label>
                      <select
                        value={bannerData.color}
                        onChange={(e) => setBannerData({ ...bannerData, color: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-bold transition-all outline-none text-[15px] appearance-none"
                      >
                        <option value="mint">Mint Green</option>
                        <option value="coral">Soft Coral</option>
                        <option value="lavender">Lavender Purple</option>
                        <option value="gold">Warm Gold</option>
                        <option value="blue">Ocean Blue</option>
                      </select>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button onClick={handleSaveBanner} className="flex-1 bg-[#0F172A] hover:bg-black text-white rounded-full h-[52px] font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2">
                        <Save size={18} /> Save Changes
                      </button>
                      <button onClick={() => { setEditingBanner(false); setBannerData(banner); }} className="flex-1 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full h-[52px] font-bold text-[15px] transition-all flex items-center justify-center gap-2">
                        <X size={18} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${banner.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                        <span className="font-bold text-[#0F172A]">{banner.active ? 'Currently Active' : 'Currently Hidden'}</span>
                      </div>
                      <button onClick={() => setEditingBanner(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] text-[#0F172A] text-[13px] font-bold transition-all">
                        <Edit size={16} /> Edit Banner
                      </button>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-3">Live Preview</p>
                      <div className={`w-full py-4 px-6 rounded-[16px] text-center font-medium text-[14px] flex items-center justify-center gap-2 ${
                          banner.color === 'mint' ? 'bg-[#A8E6CF]/30 text-[#047857]' :
                          banner.color === 'coral' ? 'bg-[#FFB6B9]/30 text-[#BE123C]' :
                          banner.color === 'lavender' ? 'bg-[#C7B8EA]/30 text-[#6D28D9]' :
                          banner.color === 'gold' ? 'bg-[#FFD89B]/30 text-[#B45309]' :
                          'bg-[#A5C8F2]/30 text-[#1D4ED8]'
                        }`}>
                        <AlertCircle size={16} />
                        {banner.text || "No text provided"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}

// Reusable FAQ Form Component
function FAQForm({ data, setData, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Question</label>
        <input
          type="text"
          value={data.question}
          onChange={(e) => setData({ ...data, question: e.target.value })}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-bold transition-all outline-none text-[15px]"
          placeholder="e.g. How long does shipping take?"
        />
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Answer</label>
        <textarea
          value={data.answer}
          onChange={(e) => setData({ ...data, answer: e.target.value })}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-medium transition-all outline-none text-[15px] resize-none"
          rows="3"
          placeholder="Detailed answer..."
        />
      </div>

      <div>
        <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2">Display Order Number</label>
        <input
          type="number"
          value={data.order}
          onChange={(e) => setData({ ...data, order: parseInt(e.target.value) || 1 })}
          className="w-32 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:bg-white focus:ring-4 focus:ring-[#0F172A]/5 rounded-2xl py-3.5 px-5 text-[#0F172A] font-bold transition-all outline-none text-[15px]"
          min="1"
        />
      </div>

      <div className="pt-2 flex gap-3">
        <button onClick={onSave} className="flex-1 bg-[#0F172A] hover:bg-black text-white rounded-full h-[52px] font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
          <Save size={18} /> Save FAQ
        </button>
        <button onClick={onCancel} className="flex-1 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full h-[52px] font-bold text-[15px] transition-all flex items-center justify-center gap-2 active:scale-95">
          <X size={18} /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminContent() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContentContent />
    </ProtectedRoute>
  );
}