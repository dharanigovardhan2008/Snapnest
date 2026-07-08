'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUpload({ onUploadSuccess, minResolution, folder = 'designs' }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { uploadImage, uploading, progress } = useImageUpload();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    const result = await uploadImage(file, minResolution, folder);

    if (result.success) {
      onUploadSuccess(result.url, result.publicId);
    } else {
      setError(result.error);
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group flex-grow min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-[24px] p-8 text-center cursor-pointer hover:border-[#0F172A] hover:bg-white transition-all duration-300"
        >
          <div className="w-16 h-16 bg-[#F1F5F9] text-[#94A3B8] rounded-full flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-500 ease-[0.16,1,0.3,1]">
            <Upload size={28} strokeWidth={2.5} />
          </div>
          <p className="text-[16px] font-semibold text-[#0F172A] mb-2 font-[family-name:var(--font-outfit)] tracking-wide">
            Click to browse or drag & drop
          </p>
          <p className="text-[14px] text-[#64748B] font-light mb-1">
            JPG, PNG or WebP (max 10MB)
          </p>
          {minResolution && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-[12px] font-medium text-[#64748B]">
              <ImageIcon size={14} />
              Min resolution: {minResolution.width}x{minResolution.height}px
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-square md:aspect-[4/3] rounded-[24px] overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] shadow-sm flex-grow"
        >
          {/* Using object-contain ensures the full print area is visible without cropping the user's design preview */}
          <img 
            src={preview} 
            alt="Upload preview" 
            className="w-full h-full object-contain p-2"
          />
          
          <button
            onClick={handleRemove}
            className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md text-[#0F172A] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-110 transition-all duration-300"
            disabled={uploading}
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {/* Premium Uploading Glass State */}
          <AnimatePresence>
            {uploading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-6"
              >
                <div className="bg-white px-8 py-6 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-[#F1F5F9] flex flex-col items-center w-full max-w-[240px]">
                  <div className="w-8 h-8 border-4 border-[#F1F5F9] border-t-[#0F172A] rounded-full animate-spin mb-4" />
                  <p className="text-[14px] font-semibold text-[#0F172A] mb-2 font-[family-name:var(--font-outfit)]">Uploading to Studio...</p>
                  
                  {/* Sleek Progress Bar */}
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#0F172A] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <p className="text-[12px] font-bold text-[#64748B] mt-2 tracking-wider">{progress}%</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Refined Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-[16px]"
          >
            <AlertCircle className="text-[#E11D48] flex-shrink-0 mt-0.5" size={18} />
            <p className="text-[14px] font-medium text-rose-900 leading-snug">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}