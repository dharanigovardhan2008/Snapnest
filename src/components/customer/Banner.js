'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { bannerService } from '../../lib/firestore';

export default function Banner() {
  const [banner, setBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      const data = await bannerService.getBanner();
      if (data && data.active) {
        setBanner(data);
      }
    } catch (e) {
      console.error('Banner failed to load', e);
    }
  };

  if (!banner || !isVisible) return null;

  const colorClasses = {
    mint: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    coral: 'bg-rose-50 text-rose-800 border-rose-200',
    lavender: 'bg-purple-50 text-purple-800 border-purple-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-16 md:top-20 left-0 right-0 z-40 border-b py-3 ${
          colorClasses[banner.color] || colorClasses.mint
        }`}
      >
        <div className="container-custom flex items-center justify-between px-4">
          <p className="text-sm md:text-base font-medium text-center flex-1">
            {banner.text}
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1 hover:bg-black/5 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}