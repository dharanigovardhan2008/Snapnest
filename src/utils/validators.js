/**
 * Validate image resolution for printing
 */
export function validateImageResolution(file, minResolution) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // FIX: If no minResolution is provided (e.g. Admin uploading a product photo), skip the check
      if (!minResolution) {
        resolve({
          valid: true,
          actual: { width: img.width, height: img.height },
          message: 'No minimum resolution required.'
        });
        return;
      }

      const isValid = img.width >= minResolution.width && img.height >= minResolution.height;
      resolve({
        valid: isValid,
        actual: { width: img.width, height: img.height },
        required: minResolution,
        message: isValid 
          ? 'Image resolution is suitable for printing'
          : `Image resolution too low. Required: ${minResolution.width}x${minResolution.height}px, Got: ${img.width}x${img.height}px`
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        message: 'Could not load image'
      });
    };
    
    img.src = url;
  });
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate Indian mobile number
 */
export function validateMobile(mobile) {
  const cleaned = mobile.replace(/\D/g, '');
  const re = /^[6-9]\d{9}$/;
  return re.test(cleaned);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true, message: 'Password is valid' };
}

/**
 * Validate file type
 */
export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file, maxSizeMB = 10) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Comprehensive image validation
 */
export async function validateImage(file, minResolution) {
  // Check file type
  if (!validateFileType(file)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, or WebP images only.'
    };
  }

  // Check file size
  if (!validateFileSize(file, 10)) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.'
    };
  }

  // Check resolution ONLY if a minResolution requirement was actually passed
  if (minResolution) {
    const resolutionCheck = await validateImageResolution(file, minResolution);
    if (!resolutionCheck.valid) {
      return {
        valid: false,
        error: resolutionCheck.message
      };
    }
  }

  return {
    valid: true,
    message: 'Image is valid for printing'
  };
}

export default {
  validateImageResolution,
  validateEmail,
  validateMobile,
  validatePassword,
  validateFileType,
  validateFileSize,
  validateImage,
};