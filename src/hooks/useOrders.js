'use client';

import { useState, useEffect } from 'react';
import { orderService } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    loadOrders();
  }, [user, isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let fetchedOrders;
      if (isAdmin) {
        fetchedOrders = await orderService.getAllOrders();
      } else {
        fetchedOrders = await orderService.getUserOrders(user.uid);
      }
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  return {
    orders,
    loading,
    refreshOrders,
  };
}