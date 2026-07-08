'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../lib/firestore';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

function WishlistContent() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist(user.uid);
      setWishlist(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await wishlistService.removeFromWishlist(itemId);
      setWishlist(wishlist.filter((item) => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-studio-white">
        <Navigation />
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-32 pb-24 bg-studio-white">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold text-ink-black tracking-tight mb-3">
              My Wishlist
            </h1>
            <p className="font-body text-ink-muted text-lg">
              Saved designs ready for the studio.
            </p>
          </div>

          {wishlist.length === 0 ? (
            /* Premium Empty State */
            <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-studio-grey/50 rounded-card border border-studio-grey">
              <div className="w-20 h-20 bg-studio-white rounded-full flex items-center justify-center shadow-glass mb-6">
                <Heart size={32} className="text-ink-muted" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-ink-black mb-3">
                Your gallery is empty
              </h3>
              <p className="font-body text-ink-muted mb-8 max-w-sm">
                Save your favorite prints and custom designs here for easy access later.
              </p>
              <Link href="/products" className="btn-primary">
                Browse Collection
              </Link>
            </div>
          ) : (
            /* Wishlist Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-studio-white rounded-[32px] p-4 border border-studio-grey shadow-polaroid hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-studio-grey rounded-[24px] mb-5 overflow-hidden">
                    <img
                      src={item.designUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="px-2 flex flex-col flex-grow">
                    <h3 className="font-heading font-semibold text-ink-black text-lg mb-1">
                      {item.productName}
                    </h3>
                    <p className="font-body text-sm text-ink-muted mb-6">
                      Added {formatDate(item.createdAt)}
                    </p>

                    {/* Actions */}
                    <div className="mt-auto flex gap-3">
                      <Link
                        href={`/order?product=${item.productId}`}
                        className="flex-1 bg-ink-black text-studio-white rounded-full py-3.5 flex items-center justify-center gap-2 font-heading font-medium text-sm hover:bg-ink-black/90 transition-colors"
                      >
                        <ShoppingBag size={18} />
                        <span>Order Now</span>
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-[52px] h-[52px] shrink-0 bg-studio-grey text-ink-muted rounded-full flex items-center justify-center hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}