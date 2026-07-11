'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Save, X, Palette, Sparkles, Plus, Trash2, AlertTriangle, Package, Zap, Layers } from 'lucide-react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ImageUpload from '../../../components/shared/ImageUpload';
import { productService } from '../../../lib/firestore';
import { formatCurrency } from '../../../utils/helpers';
import toast from 'react-hot-toast';

// QUICK ADD TEMPLATES FOR VARIANTS
const VARIANT_PRESETS = [
  { id: 'p-std', label: 'Normal Polaroid', size: 'Polaroid', price: 10, orig: 15, w: 800, h: 1000 },
  { id: 'p-cus', label: 'Custom Polaroid', size: 'Polaroid', price: 20, orig: 30, w: 800, h: 1000 },
  { id: 'a6-std', label: 'A6 Poster', size: 'A6', price: 25, orig: 35, w: 1240, h: 1748 },
  { id: 'a6-cus', label: 'A6 (Custom)', size: 'A6', price: 30, orig: 45, w: 1240, h: 1748 },
  { id: 'strip', label: 'Photo Strip', size: 'Strip', price: 30, orig: 40, w: 600, h: 1800 },
  { id: 'a5-std', label: 'A5 Poster', size: 'A5', price: 35, orig: 50, w: 1748, h: 2480 },
  { id: 'a5-cus', label: 'A5 (Custom)', size: 'A5', price: 40, orig: 60, w: 1748, h: 2480 },
  { id: 'a3-std', label: 'A3 Poster', size: 'A3', price: 60, orig: 80, w: 3508, h: 4960 },
  { id: 'a3-cus', label: 'A3 (Custom)', size: 'A3', price: 70, orig: 90, w: 3508, h: 4960 },
];

function AdminProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // NEW DATA STRUCTURE: Using 'variants' array instead of flat size/price
  const defaultForm = {
    name: '',
    description: '',
    type: 'standard', // standard or custom
    imageUrl: '',
    variants: [
      { size: '', price: '', originalPrice: '', width: '', height: '' }
    ]
  };

  const [formData, setFormData] = useState(defaultForm);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // --- FORM HANDLERS ---
  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', price: '', originalPrice: '', width: '', height: '' }]
    });
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length === 1) {
      toast.error('Product must have at least one size variant');
      return;
    }
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleQuickAddVariant = (preset) => {
    // If the first variant is completely empty, overwrite it. Otherwise, add a new one.
    const v = formData.variants;
    const isFirstEmpty = v.length === 1 && !v[0].size && !v[0].price;
    
    const newVariant = {
      size: preset.size,
      price: preset.price.toString(),
      originalPrice: preset.orig.toString(),
      width: preset.w.toString(),
      height: preset.h.toString()
    };

    if (isFirstEmpty) {
      setFormData({ ...formData, variants: [newVariant] });
    } else {
      setFormData({ ...formData, variants: [...v, newVariant] });
    }
    toast.success(`Added ${preset.label} size`);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setShowAddModal(false);
    
    // BACKWARD COMPATIBILITY: Convert old flat products to new variant structure
    let formattedVariants = product.variants || [];
    if (formattedVariants.length === 0) {
      formattedVariants = [{
        size: product.size || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        width: product.minResolution?.width?.toString() || '',
        height: product.minResolution?.height?.toString() || ''
      }];
    }

    setFormData({
      name: product.name,
      description: product.description || '',
      type: product.type || 'standard',
      imageUrl: product.imageUrl || '',
      variants: formattedVariants
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddModal(false);
    setFormData(defaultForm);
  };

  const validateForm = () => {
    if (!formData.name || !formData.type) {
      toast.error('Please enter product name and type');
      return false;
    }
    if (formData.type === 'standard' && !formData.imageUrl) {
      toast.error('Standard products must have a photo');
      return false;
    }
    
    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.size || !v.price || !v.width || !v.height) {
        toast.error(`Please fill all fields for Variant ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const prepareDataForSave = () => {
    return {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      imageUrl: formData.imageUrl,
      active: true,
      variants: formData.variants.map(v => ({
        size: v.size,
        price: parseFloat(v.price),
        originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
        width: parseInt(v.width),
        height: parseInt(v.height)
      })),
      updatedAt: new Date().toISOString()
    };
  };

  const handleSave = async (productId) => {
    if (!validateForm()) return;
    try {
      await productService.updateProduct(productId, prepareDataForSave());
      toast.success('Product updated successfully');
      handleCancel();
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update product');
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const payload = prepareDataForSave();
      payload.createdAt = new Date().toISOString();
      await productService.createProduct(payload);
      toast.success('Product created successfully');
      handleCancel();
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(productToDelete.id);
      toast.success('Product deleted successfully');
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.type === filter;
  });

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-8 font-body max-w-6xl mx-auto pb-20">
        
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-[#0F172A] p-8 md:p-10 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-2">
              Products & Sizes
            </h1>
            <p className="text-[#94A3B8] font-light">
              Manage multi-size catalog items and pricing.
            </p>
          </div>
          <button 
            onClick={() => { handleCancel(); setShowAddModal(true); }} 
            className="relative z-10 flex items-center justify-center gap-2 bg-white text-[#0F172A] hover:bg-[#F8FAFC] px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus size={20} /> New Product Group
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1.5 bg-[#E2E8F0]/50 rounded-full overflow-x-auto custom-scrollbar max-w-full">
          {[{ key: 'all', label: 'All Products' }, { key: 'standard', label: 'Standard Prints' }, { key: 'custom', label: 'Custom Designs' }].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`relative px-6 py-2.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${isActive ? 'text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
              >
                {isActive && <motion.div layoutId="adminProductFilter" className="absolute inset-0 bg-white rounded-full z-0" />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Modal (Used for both Add and Edit) */}
        <AnimatePresence mode="wait">
          {(showAddModal || editingId) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-[40px] shadow-lg border border-[#F1F5F9] overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-6 border-b border-[#F1F5F9] pb-6">
                  <h2 className="text-[24px] font-bold text-[#0F172A] font-heading flex items-center gap-3">
                    <Layers className="text-[#2563EB]" /> {editingId ? 'Edit Product Group' : 'New Product Group'}
                  </h2>
                  <button onClick={handleCancel} className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] flex items-center justify-center hover:bg-[#F1F5F9]"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column: Image & Details */}
                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2 block">
                        Product Photo {formData.type === 'standard' && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[24px] p-4 h-[220px] flex flex-col items-center justify-center overflow-hidden">
                        {formData.imageUrl ? (
                          <div className="relative w-full h-full group">
                            <img src={formData.imageUrl} className="w-full h-full object-cover rounded-[12px]" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[12px]">
                               <ImageUpload onUploadSuccess={(url) => setFormData({...formData, imageUrl: url})} folder="products" />
                            </div>
                          </div>
                        ) : (
                          <ImageUpload onUploadSuccess={(url) => setFormData({...formData, imageUrl: url})} folder="products" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Group Name *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl py-3 px-4 text-[#0F172A] font-semibold outline-none" placeholder="e.g. Posters" />
                      </div>
                      <div>
                        <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Type *</label>
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl py-3 px-4 text-[#0F172A] font-medium outline-none">
                          <option value="standard">Standard (Pre-designed)</option>
                          <option value="custom">Custom (Customer Upload)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] rounded-xl py-3 px-4 text-[#0F172A] text-[14px] outline-none resize-none" rows="2" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Variants (Sizes & Prices) */}
                  <div className="lg:col-span-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[32px] p-6 md:p-8">
                    
                    {/* QUICK ADD STRIP */}
                    <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
                      <label className="text-[12px] font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap size={16}/> Quick Add Sizes
                      </label>
                      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {VARIANT_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => handleQuickAddVariant(preset)}
                            className="shrink-0 bg-white border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5"
                          >
                            <Plus size={14}/> {preset.label} (₹{preset.price})
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[16px] font-bold text-[#0F172A] font-heading">Size Variations</h3>
                      <button onClick={handleAddVariant} className="text-[#2563EB] text-[13px] font-bold hover:underline flex items-center gap-1"><Plus size={14}/> Add Custom Size</button>
                    </div>

                    <div className="space-y-4">
                      {formData.variants.map((variant, index) => (
                        <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-[#E2E8F0] rounded-[20px] p-4 flex flex-col md:flex-row gap-4 relative group">
                          
                          <button onClick={() => handleRemoveVariant(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} strokeWidth={3} /></button>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                            <div className="col-span-2 md:col-span-1">
                              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1 block">Size Name</label>
                              <input type="text" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 px-3 text-[13px] font-bold outline-none" placeholder="e.g. A4" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1 block">Sale (₹)</label>
                              <input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 px-3 text-[13px] font-bold text-emerald-600 outline-none" placeholder="99" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1 block">Orig (₹)</label>
                              <input type="number" value={variant.originalPrice} onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 px-3 text-[13px] font-medium outline-none" placeholder="150" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1 block">Min W (px)</label>
                              <input type="number" value={variant.width} onChange={(e) => handleVariantChange(index, 'width', e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 px-3 text-[13px] font-mono outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#64748B] uppercase ml-1 block">Min H (px)</label>
                              <input type="number" value={variant.height} onChange={(e) => handleVariantChange(index, 'height', e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2 px-3 text-[13px] font-mono outline-none" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F1F5F9] flex justify-end gap-3">
                  <button onClick={handleCancel} className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] px-8 py-3.5 rounded-full text-[14px] font-bold transition-all active:scale-95">Cancel</button>
                  <button onClick={editingId ? () => handleSave(editingId) : handleAdd} className="bg-[#0F172A] hover:bg-[#2563EB] text-white px-8 py-3.5 rounded-full text-[14px] font-bold transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 flex items-center gap-2">
                    <Save size={16} /> {editingId ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => {
            // COMPATIBILITY: Map old data to variant array for display
            const displayVariants = product.variants && product.variants.length > 0 
              ? product.variants 
              : [{ size: product.size || 'Default', price: product.price }];

            const minPrice = Math.min(...displayVariants.map(v => v.price));
            const sizesList = displayVariants.map(v => v.size).join(', ');

            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[32px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col group">
                {/* Product Image Banner */}
                <div className="w-full h-40 bg-[#F8FAFC] border-b border-[#F1F5F9] relative flex flex-col items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {product.type === 'custom' ? <Palette size={32} className="text-[#E11D48]" /> : <Sparkles size={32} className="text-[#2563EB]" />}
                    </div>
                  )}
                  <button onClick={() => setProductToDelete(product)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white shadow-sm"><Trash2 size={14} /></button>
                </div>

                <div className="p-6 space-y-4 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[20px] font-bold text-[#0F172A] font-heading">{product.name}</h3>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${product.type === 'custom' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                        {product.type}
                      </span>
                    </div>
                    
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
                      <p className="text-[11px] font-bold text-[#64748B] uppercase mb-1">Available Sizes</p>
                      <p className="text-[13px] font-medium text-[#0F172A] leading-relaxed truncate">{sizesList}</p>
                    </div>

                    <div className="flex items-end gap-2">
                      <span className="text-[14px] text-[#64748B] font-medium mb-1">Starts at</span>
                      <p className="text-[28px] font-bold text-[#0F172A] tracking-tighter">
                        {formatCurrency(minPrice)}
                      </p>
                    </div>
                  </div>

                  <button onClick={() => handleEdit(product)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] hover:bg-white text-[#0F172A] rounded-full py-3 text-[14px] font-bold transition-all flex items-center justify-center gap-2 mt-auto">
                    <Edit size={16} /> Edit Catalog Item
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2 font-heading">Delete Product?</h2>
              <p className="text-[15px] text-[#64748B] mb-8">Permanently delete <strong className="text-[#0F172A]">{productToDelete.name}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setProductToDelete(null)} className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-full py-3.5 text-[14px] font-bold">Cancel</button>
                <button onClick={handleDeleteConfirm} className="flex-1 bg-rose-500 text-white rounded-full py-3.5 text-[14px] font-bold">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

export default function AdminProducts() {
  return (
    <ProtectedRoute adminOnly>
      <AdminProductsContent />
    </ProtectedRoute>
  );
}