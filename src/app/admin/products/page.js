'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Save, X, Palette, Sparkles, Plus, Trash2, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ImageUpload from '../../../components/shared/ImageUpload';
import { productService } from '../../../lib/firestore';
import { formatCurrency } from '../../../utils/helpers';
import toast from 'react-hot-toast';

function AdminProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
  // Add State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    price: '',
    size: '',
    type: 'standard', // standard or custom
    minResWidth: '1000',
    minResHeight: '1000',
    imageUrl: '',
  });

  // Delete State
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

  // --- ADD PRODUCT LOGIC ---
  const handleAddProduct = async () => {
    if (!newData.name || !newData.price || !newData.size) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const productPayload = {
        name: newData.name,
        description: newData.description,
        originalPrice: newData.originalPrice ? parseFloat(newData.originalPrice) : null,
        price: parseFloat(newData.price),
        size: newData.size,
        type: newData.type,
        minResolution: {
          width: parseInt(newData.minResWidth),
          height: parseInt(newData.minResHeight)
        },
        imageUrl: newData.imageUrl,
        active: true,
        createdAt: new Date().toISOString()
      };

      await productService.createProduct(productPayload);
      toast.success('New product launched successfully!');
      setShowAddModal(false);
      setNewData({ name: '', description: '', originalPrice: '', price: '', size: '', type: 'standard', minResWidth: '1000', minResHeight: '1000', imageUrl: '' });
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  // --- EDIT PRODUCT LOGIC ---
  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      originalPrice: product.originalPrice || '',
      price: product.price,
      description: product.description,
      size: product.size,
      imageUrl: product.imageUrl || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (productId) => {
    try {
      await productService.updateProduct(productId, {
        name: editData.name,
        originalPrice: editData.originalPrice ? parseFloat(editData.originalPrice) : null,
        price: parseFloat(editData.price),
        description: editData.description,
        size: editData.size,
        imageUrl: editData.imageUrl,
      });

      toast.success('Product updated successfully');
      setEditingId(null);
      setEditData({});
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  // --- DELETE PRODUCT LOGIC ---
  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(productToDelete.id);
      
      if (productToDelete.imageUrl) {
        console.log(`Requires backend API to securely delete image from Cloudinary: ${productToDelete.imageUrl}`);
      }

      toast.success('Product deleted successfully');
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
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
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight mb-2">Products & Pricing</h1>
            <p className="text-[16px] text-[#64748B]">Manage your studio catalog, pricing, and product photography.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#2563EB] text-white px-6 py-3.5 rounded-full text-[14px] font-bold transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 shrink-0"
          >
            <Plus size={18} />
            Launch New Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => {
            const isEditing = editingId === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`bg-white border transition-colors duration-300 rounded-[32px] overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] flex flex-col ${isEditing ? 'border-[#0F172A]' : 'border-[#F1F5F9]'}`}
              >
                {/* Product Image / Icon Banner */}
                <div className="w-full h-48 bg-[#F8FAFC] border-b border-[#F1F5F9] relative flex flex-col items-center justify-center group overflow-hidden">
                  {isEditing ? (
                    <div className="absolute inset-0 p-4 bg-white/90 backdrop-blur-sm z-10 overflow-y-auto custom-scrollbar">
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Replace Product Photo</p>
                      <ImageUpload 
                        onUploadSuccess={(url) => setEditData({...editData, imageUrl: url})} 
                        folder="products" 
                      />
                    </div>
                  ) : (
                    <>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          {product.type === 'custom' ? <Palette size={32} className="text-[#E11D48]" /> : <Sparkles size={32} className="text-[#2563EB]" />}
                          <span className="text-[12px] font-medium text-[#94A3B8]">No Photo Uploaded</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Delete Button (Only visible when not editing) */}
                  {!isEditing && (
                    <button 
                      onClick={() => setProductToDelete(product)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:text-rose-600 shadow-sm"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-8 space-y-4 flex-grow flex flex-col">
                  {isEditing ? (
                    <div className="space-y-4 flex-grow">
                      <div>
                        <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Name</label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-2.5 px-4 text-[#0F172A] font-semibold transition-all outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Description</label>
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-2.5 px-4 text-[#0F172A] text-[14px] transition-all outline-none resize-none"
                          rows="2"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider ml-1 mb-1 block truncate">Size</label>
                          <input
                            type="text"
                            value={editData.size}
                            onChange={(e) => setEditData({ ...editData, size: e.target.value })}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-2.5 px-3 text-[#0F172A] text-[14px] transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider ml-1 mb-1 block truncate">Original (₹)</label>
                          <input
                            type="number"
                            value={editData.originalPrice}
                            onChange={(e) => setEditData({ ...editData, originalPrice: e.target.value })}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-2.5 px-3 text-[#0F172A] text-[14px] transition-all outline-none"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider ml-1 mb-1 block truncate">Sale (₹)</label>
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-2.5 px-3 text-[#0F172A] font-bold transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-[22px] font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] tracking-tight">{product.name}</h3>
                        <span className="bg-[#F8FAFC] border border-[#F1F5F9] text-[#64748B] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase shrink-0">
                          {product.type}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#64748B] leading-relaxed mb-4">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#F1F5F9] text-[#0F172A] px-3 py-1 rounded-full text-[13px] font-semibold">
                          {product.size}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[18px] font-medium text-[#94A3B8] line-through decoration-[#CBD5E1]">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                        <p className="text-[28px] font-bold text-[#0F172A] tracking-tighter">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Read-only Data (Resolution) */}
                  <div className="pt-4 border-t border-[#F1F5F9] mt-auto">
                    <p className="text-[12px] text-[#94A3B8] flex items-center justify-between">
                      <span className="uppercase tracking-wider font-semibold">Min Print Resolution</span>
                      <span className="font-mono font-medium text-[#0F172A] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">{product.minResolution?.width || 0}x{product.minResolution?.height || 0}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(product.id)} className="flex-1 bg-[#0F172A] hover:bg-[#2563EB] text-white rounded-full py-3 text-[14px] font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                          <Save size={16} /> Save
                        </button>
                        <button onClick={handleCancelEdit} className="flex-1 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full py-3 text-[14px] font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                          <X size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(product)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] hover:bg-white text-[#0F172A] rounded-full py-3 text-[14px] font-bold transition-all flex items-center justify-center gap-2">
                        <Edit size={16} /> Edit Catalog Item
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ADD NEW PRODUCT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-2xl w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] my-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)]">Launch New Product</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Photo Upload Side */}
                <div>
                  <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-2 block">Product Photo</label>
                  <div className="h-[280px]">
                    <ImageUpload 
                      onUploadSuccess={(url) => setNewData({...newData, imageUrl: url})} 
                      folder="products" 
                    />
                  </div>
                  {newData.imageUrl && (
                    <p className="text-[12px] text-emerald-600 font-semibold mt-3 text-center flex items-center justify-center gap-1">
                      <Sparkles size={12} /> Photo uploaded successfully
                    </p>
                  )}
                </div>

                {/* Details Side */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Product Name *</label>
                    <input type="text" value={newData.name} onChange={(e) => setNewData({ ...newData, name: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-4 text-[#0F172A] font-semibold transition-all outline-none" placeholder="e.g. Premium Polaroid" />
                  </div>
                  
                  <div>
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Description</label>
                    <textarea value={newData.description} onChange={(e) => setNewData({ ...newData, description: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-4 text-[#0F172A] text-[14px] transition-all outline-none resize-none" rows="2" placeholder="Brief product description..." />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] sm:text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1 mb-1 block">Type</label>
                      <select value={newData.type} onChange={(e) => setNewData({ ...newData, type: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-3 text-[#0F172A] font-medium transition-all outline-none text-[13px] sm:text-[14px]">
                        <option value="standard">Standard</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1 mb-1 block truncate">Original (₹)</label>
                      <input type="number" value={newData.originalPrice} onChange={(e) => setNewData({ ...newData, originalPrice: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-3 text-[#0F172A] font-medium transition-all outline-none placeholder:text-[#94A3B8]" placeholder="499" />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1 mb-1 block truncate">Sale (₹) *</label>
                      <input type="number" value={newData.price} onChange={(e) => setNewData({ ...newData, price: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-3 text-[#0F172A] font-bold transition-all outline-none" placeholder="299" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Size *</label>
                      <input type="text" value={newData.size} onChange={(e) => setNewData({ ...newData, size: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-4 text-[#0F172A] font-medium transition-all outline-none text-[13px]" placeholder="e.g. 4x6" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Min W (px)</label>
                      <input type="number" value={newData.minResWidth} onChange={(e) => setNewData({ ...newData, minResWidth: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-4 text-[#0F172A] font-medium transition-all outline-none font-mono text-[13px]" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-2 mb-1 block">Min H (px)</label>
                      <input type="number" value={newData.minResHeight} onChange={(e) => setNewData({ ...newData, minResHeight: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/5 rounded-xl py-3 px-4 text-[#0F172A] font-medium transition-all outline-none font-mono text-[13px]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F1F5F9] flex justify-end">
                <button onClick={handleAddProduct} className="bg-[#0F172A] hover:bg-[#2563EB] text-white px-10 py-4 rounded-full text-[15px] font-bold transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 flex items-center gap-2">
                  <Plus size={18} /> Publish to Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] font-[family-name:var(--font-outfit)] mb-2">Delete Product?</h2>
              <p className="text-[15px] text-[#64748B] mb-8 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-[#0F172A]">{productToDelete.name}</strong> from your catalog? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] rounded-full py-3.5 text-[14px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full py-3.5 text-[14px] font-bold transition-all shadow-sm shadow-rose-200"
                >
                  Delete
                </button>
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