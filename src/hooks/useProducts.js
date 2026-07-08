'use client';

import { useState, useEffect } from 'react';
import { productService } from '../lib/firestore';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (productId) => {
    return products.find(p => p.id === productId);
  };

  return {
    products,
    loading,
    getProduct,
    refreshProducts: loadProducts,
  };
}