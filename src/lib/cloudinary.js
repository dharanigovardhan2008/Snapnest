// Cloudinary upload service
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryService = {
  /**
   * Upload image to Cloudinary
   * @param {File} file - Image file to upload
   * @param {string} folder - Optional subfolder (e.g., 'designs', 'proofs')
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async uploadImage(file, folder = 'designs') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `snapnest/${folder}`);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  },

  /**
   * Get optimized image URL
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(publicId, options = {}) {
    const { width = 800, quality = 'auto', format = 'auto' } = options;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_${quality},f_${format}/${publicId}`;
  },

  /**
   * Get thumbnail URL
   * @param {string} publicId - Cloudinary public ID
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(publicId) {
    return this.getOptimizedUrl(publicId, { width: 300, quality: '80' });
  },

  /**
   * Delete image from Cloudinary (requires signed request - admin only)
   * Note: For unsigned uploads, deletion must be done via Cloudinary dashboard
   * or a backend API with signed requests
   */
  async deleteImage(publicId) {
    console.warn('Deletion of unsigned uploads requires backend API or Cloudinary dashboard');
    // This is a placeholder - implement backend API if needed
    return { success: false, message: 'Manual deletion required' };
  },
};

export default cloudinaryService;