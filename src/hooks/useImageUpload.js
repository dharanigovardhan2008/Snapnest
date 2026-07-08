'use client';

import { useState } from 'react';
import { cloudinaryService } from '../lib/cloudinary';
import { validateImage } from '../utils/validators';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file, minResolution, folder = 'designs') => {
    setUploading(true);
    setProgress(0);

    try {
      // Validate image
      const validation = await validateImage(file, minResolution);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setProgress(30);

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(file, folder);
      
      setProgress(100);
      setUploading(false);

      return {
        success: true,
        url: result.url,
        publicId: result.publicId,
      };
    } catch (error) {
      setUploading(false);
      setProgress(0);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  };

  return {
    uploadImage,
    uploading,
    progress,
  };
}