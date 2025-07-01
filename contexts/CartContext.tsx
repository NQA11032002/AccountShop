"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchCart, addToCart, deleteCartItem } from '@/lib/api';
import { CartItem } from '@/types/cart.interface';

export interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  totalAmount: number;
  totalSavings: number;
  addItem: (item: CartItem, quantity?: number) => void;
  removeItem: (productId: number, durationId: string) => void;
  updateQuantity: (productId: number, durationId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number, durationId: string) => boolean;
  getItemQuantity: (productId: number, durationId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { sessionId } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      if (sessionId) {
        try {
          const cartItems = await fetchCart(sessionId);
          setItems(cartItems);
        } catch (error) {
          console.error('Failed to fetch cart', error);
        }
      }
    };
    loadCart();
  }, [sessionId]);

  const addItem = async (item: CartItem) => {
    if (!sessionId) return;
    try {
      await addToCart(item, sessionId);
      setItems((prev) => [...prev, item]);
    } catch (error) {
      console.error('Failed to add item to cart', error);
    }
  };

  const removeItem = async (productId: number, durationId: string) => {
    if (!sessionId) return;
    const found = items.find(
      (item) =>
        item.product_id === productId &&
        item.selected_duration.toString() === durationId
    );
    if (!found) return;

    try {
      await deleteCartItem(found.id, sessionId);
      setItems((prev) => prev.filter((item) => item.id !== found.id));
    } catch (error) {
      console.error('Failed to remove item from cart', error);
    }
  };

  const updateQuantity = (productId: number, durationId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId && item.selected_duration.toString() === durationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: number, durationId: string): boolean => {
    return items.some(
      (item) =>
        item.product_id === productId &&
        item.selected_duration.toString() === durationId
    );
  };

  const getItemQuantity = (productId: number, durationId: string): number => {
    const found = items.find(
      (item) =>
        item.product_id === productId &&
        item.selected_duration.toString() === durationId
    );
    return found?.quantity || 0;
  };

  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalSavings = items.reduce((total, item) => total + (item.original_price - item.price) * item.quantity, 0);

  const value: CartContextType = {
    items,
    itemsCount,
    totalAmount,
    totalSavings,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
