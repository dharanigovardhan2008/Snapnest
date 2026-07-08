import { format, addDays } from 'date-fns';

/**
 * Generate unique order ID
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, formatString = 'MMM dd, yyyy') {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, formatString);
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

/**
 * Calculate estimated delivery date
 */
export function calculateDeliveryDate(days) {
  return addDays(new Date(), days);
}

/**
 * Get order status color
 */
export function getStatusColor(status) {
  const colors = {
    pending_verification: 'gold',
    verified: 'blue',
    printing: 'lavender',
    shipped: 'mint',
    out_for_delivery: 'coral',
    delivered: 'mint',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Get order status label
 */
export function getStatusLabel(status) {
  const labels = {
    pending_verification: 'Pending Verification',
    verified: 'Verified',
    printing: 'Printing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

/**
 * Get status icon name
 */
export function getStatusIcon(status) {
  const icons = {
    pending_verification: 'Clock',
    verified: 'CheckCircle',
    printing: 'Printer',
    shipped: 'Package',
    out_for_delivery: 'Truck',
    delivered: 'CheckCircle2',
    cancelled: 'XCircle',
  };
  return icons[status] || 'Circle';
}

/**
 * Download data as CSV
 */
export function downloadCSV(data, filename) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert JSON to CSV
 */
function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle dates
      if (value instanceof Date) {
        return `"${formatDate(value, 'yyyy-MM-dd HH:mm')}"`;
      }
      // Handle objects
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Handle strings with commas or quotes
      const stringValue = String(value || '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Generate WhatsApp link
 */
export function generateWhatsAppLink(mobile, message) {
  const cleanMobile = mobile.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanMobile}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp message for order
 */
export function generateOrderWhatsAppMessage(order) {
  return `Hi! I have a question about my order ${order.orderId}.`;
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export default {
  generateOrderId,
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateDeliveryDate,
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
  downloadCSV,
  generateWhatsAppLink,
  generateOrderWhatsAppMessage,
  truncateText,
  getInitials,
  copyToClipboard,
  formatFileSize,
  debounce,
  generateId,
};