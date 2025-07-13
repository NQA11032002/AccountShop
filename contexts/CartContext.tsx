"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchCart, addToCart, deleteCartItem, clearCart } from '@/lib/api';
import { CartItem } from '@/types/cart.interface';
import { toast } from '@/hooks/use-toast';
import { updateCartItemQuantity } from '@/lib/api';

export interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  totalAmount: number;
  totalSavings: number;
  addItem: (item: CartItem, quantity?: number) => void;
  removeItem: (productId: number, durationId: string) => void;
  updateQuantity: (productId: number, durationId: number, quantity: number) => void;
  clearAllCart: () => void;
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

  const removeItem = async (cartId: number) => {
    if (!sessionId) return;

    try {
      await deleteCartItem(cartId, sessionId);

      // Cập nhật lại danh sách item sau khi xoá
      setItems((prevItems) => prevItems.filter((item) => item.id !== cartId));

      toast({
        title: 'Xoá thành công',
        description: 'Khoá học đã được xoá khỏi giỏ hàng.',
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to remove item from cart', error);
      toast({
        title: "Lỗi xóa sản phẩm",
        description: "Có một vài lỗi trong quá trình xóa, vui lòng thử lại sau!.",
        variant: "destructive",
      });
    }
  };


  const updateQuantity = async (cartId: number, durationId: string | number, quantity: number) => {
    if (!sessionId) {
      toast({
        title: 'Phiên hết hạn',
        description: 'Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      return;
    }

    const success = await updateCartItemQuantity(cartId, quantity, sessionId);

    if (success) {
      // Cập nhật local state ngay để phản ánh lên UI
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartId && String(item.selected_duration) === String(durationId)
            ? { ...item, quantity }
            : item
        )
      );
    } else {
      toast({
        title: 'Cập nhật thất bại',
        description: 'Không thể thay đổi số lượng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };


  const clearAllCart = async () => {
    if (!sessionId) return;

    try {
      await clearCart(sessionId);

      // Cập nhật lại danh sách item sau khi xoá
      // setItems((prevItems) => prevItems.filter((item) => item.id !== cartId));

      toast({
        title: 'Xoá thành công',
        description: 'Đã xóa toàn bộ sản phẩm trong giỏ hàng',
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Lỗi xóa sản phẩm",
        description: "Có một vài lỗi trong quá trình xóa, vui lòng thử lại sau!.",
        variant: "destructive",
      });
    }
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
  const totalSavings = 0;

  const value: CartContextType = {
    items,
    itemsCount,
    totalAmount,
    totalSavings,
    addItem,
    removeItem,
    updateQuantity,
    clearAllCart,
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
