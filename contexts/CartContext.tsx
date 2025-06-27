"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import DataSyncHelper from '@/lib/syncHelper';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  durationId: string;
  quantity: number;
  image: string;
  color: string;
  description: string;
  warranty: string;
  addedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  totalAmount: number;
  totalSavings: number;
  addItem: (item: Omit<CartItem, 'quantity' | 'addedAt'>, quantity?: number) => void;
  removeItem: (id: number, durationId: string) => void;
  updateQuantity: (id: number, durationId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: number, durationId: string) => boolean;
  getItemQuantity: (id: number, durationId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  console.log("CartProvider rendered", { itemsCount: items.length, user: user?.email });

  // Load user-specific cart from JSON API and localStorage when user changes
  useEffect(() => {
    const loadUserCart = async () => {
      if (user) {
        console.log("🛒 Loading cart for user", { userId: user.id });
        
        try {
          // Load cart data from JSON API with fallback to localStorage
          const cartData = await DataSyncHelper.loadUserData(user.id, 'userCarts');
          
          if (cartData.length > 0) {
            // Transform API cart data to local cart format
            const cartItems: CartItem[] = cartData.map((cartItem: any) => ({
              id: cartItem.productId,
              name: cartItem.productName || `Product ${cartItem.productId}`,
              price: cartItem.price || 0,
              originalPrice: cartItem.originalPrice || cartItem.price || 0,
              duration: cartItem.duration || '1 tháng',
              durationId: cartItem.selectedDuration || '1m',
              quantity: cartItem.quantity || 1,
              image: cartItem.image || '📦',
              color: cartItem.color || 'bg-blue-500',
              description: cartItem.description || '',
              warranty: cartItem.warranty || '30 ngày',
              addedAt: new Date(cartItem.addedAt || Date.now())
            }));
            
            setItems(cartItems);
            console.log("✅ Cart loaded from API", { count: cartItems.length });
          } else {
            // Fallback to localStorage
            const savedCart = localStorage.getItem(`qai-store-cart-${user.id}`);
            if (savedCart) {
              try {
                const parsedCart = JSON.parse(savedCart);
                const normalizedCart = DataSyncHelper.normalizeCartData ? 
                  DataSyncHelper.normalizeCartData(parsedCart) : parsedCart;
                setItems(normalizedCart);
                console.log("💾 Cart loaded from localStorage", { count: normalizedCart.length });
              } catch (error) {
                console.error("❌ Error loading cart from localStorage:", error);
                localStorage.removeItem(`qai-store-cart-${user.id}`);
                setItems([]);
              }
            } else {
              setItems([]);
              console.log("📝 No saved cart found for user");
            }
          }
        } catch (error) {
          console.error("❌ Error loading user cart:", error);
          setItems([]);
        }
      } else {
        // Clear cart when no user is logged in
        setItems([]);
        console.log("🚪 Cart cleared - no user logged in");
      }
    };

    loadUserCart();
  }, [user]);

  // Enhanced cart sync with retry logic and improved error handling
  useEffect(() => {
    const syncCartToAPI = async (retryCount = 0) => {
      if (user && items.length >= 0) {
        // Save to localStorage immediately for offline functionality
        localStorage.setItem(`qai-store-cart-${user.id}`, JSON.stringify(items));
        
        try {
          // Fetch latest product data to ensure cart items have current prices
          const productsResponse = await fetch('/api/data?type=products');
          const productsData = await productsResponse.json();
          const currentProducts = productsData.success ? productsData.data : [];
          
          // Transform local cart items to API format with updated product data
          const apiCartData = items.map((item: CartItem) => {
            // Find current product data to get latest information
            const currentProduct = currentProducts.find((p: any) => p.id === item.id);
            const currentDuration = currentProduct?.durations?.find((d: any) => 
              normalizeDurationId(d.id) === normalizeDurationId(item.durationId)
            );
            
            return {
              userId: user.id,
              productId: item.id,
              productName: currentProduct?.name || item.name,
              price: currentDuration?.price || item.price,
              originalPrice: currentDuration?.originalPrice || item.originalPrice,
              quantity: item.quantity,
              selectedDuration: item.durationId,
              duration: item.duration,
              image: currentProduct?.image || item.image,
              color: currentProduct?.color || item.color,
              description: currentProduct?.description || item.description,
              warranty: currentProduct?.warranty || item.warranty,
              addedAt: item.addedAt.toISOString()
            };
          });
          
          // Use direct API call with retry logic
          const response = await fetch('/api/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'userCarts',
              items: apiCartData,
              action: 'bulk_update',
              userId: user.id
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log("💾 Cart synced to data.json successfully", { 
              userId: user.id, 
              count: items.length,
              totalValue: apiCartData.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            });
            
            // Trigger cross-tab sync event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cart-synced', {
                detail: { userId: user.id, cartData: apiCartData, timestamp: Date.now() }
              }));
            }
          } else {
            throw new Error(result.error || 'API sync failed');
          }
        } catch (error) {
          console.warn(`⚠️ Cart sync attempt ${retryCount + 1} failed:`, error);
          
          // Retry logic with exponential backoff
          if (retryCount < 3) {
            const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            setTimeout(() => syncCartToAPI(retryCount + 1), retryDelay);
          } else {
            console.error("❌ Failed to sync cart after 3 attempts, saved locally only");
            
            // Emergency fallback to DataSyncHelper
            try {
              const apiCartData = items.map((item: CartItem) => ({
                userId: user.id,
                productId: item.id,
                productName: item.name,
                price: item.price,
                originalPrice: item.originalPrice,
                quantity: item.quantity,
                selectedDuration: item.durationId,
                duration: item.duration,
                image: item.image,
                color: item.color,
                description: item.description,
                warranty: item.warranty,
                addedAt: item.addedAt.toISOString()
              }));
              
              await DataSyncHelper.saveToAPI('userCarts', apiCartData, 'bulk_update');
              console.log("💾 Cart synced via fallback method");
            } catch (fallbackError) {
              console.error("❌ Even fallback sync failed:", fallbackError);
            }
          }
        }
      }
    };

    // Reduced debounce for immediate responsiveness
    const timeoutId = setTimeout(() => syncCartToAPI(0), 50);
    return () => clearTimeout(timeoutId);
  }, [items, user]);

  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalSavings = items.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);

  // Enhanced normalization function for cart consistency with comprehensive edge case handling
  const normalizeDurationId = (durationId: string): string => {
    if (!durationId || typeof durationId !== 'string') {
      console.warn("⚠️ Invalid durationId provided, using default", { durationId });
      return '1m';
    }
    
    const original = durationId;
    let normalized = durationId.toLowerCase().trim();
    
    // Handle common duration formats
    normalized = normalized
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/month|months|tháng|thang/g, 'm')
      .replace(/year|years|năm|nam/g, 'y') 
      .replace(/day|days|ngày|ngay/g, 'd')
      .replace(/week|weeks|tuần|tuan/g, 'w')
      .replace(/hour|hours|giờ|gio/g, 'h')
      .replace(/minute|minutes|phút|phut/g, 'min')
      .replace(/[^0-9mywdhmin]/g, ''); // Remove any other characters
    
    // Handle edge cases and ensure proper format
    if (normalized.match(/^\d+$/)) {
      // If only numbers, default to months
      normalized = normalized + 'm';
    } else if (normalized.match(/^[mywdh]$/)) {
      // If only unit, default to 1
      normalized = '1' + normalized;
    } else if (!normalized.match(/^\d+[mywdhmin]+$/)) {
      // If format is invalid, use default
      console.warn("⚠️ Invalid duration format, using default", { original, normalized });
      normalized = '1m';
    }
    
    // Convert common variations to standard format
    const standardized = normalized
      .replace(/(\d+)min/g, '$1min') // Keep minutes as is
      .replace(/(\d+)h/g, '$1h')     // Keep hours as is
      .replace(/(\d+)d/g, '$1d')     // Keep days as is
      .replace(/(\d+)w/g, '$1w')     // Keep weeks as is
      .replace(/(\d+)m/g, '$1m')     // Keep months as is
      .replace(/(\d+)y/g, '$1y');    // Keep years as is
    
    console.log("🔄 Duration normalized", { original, normalized: standardized });
    return standardized || '1m';
  };

  const addItem = async (newItem: Omit<CartItem, 'quantity' | 'addedAt'>, quantity = 1) => {
    console.log("🛒 Adding item to cart with product data validation", { 
      productId: newItem.id, 
      originalDurationId: newItem.durationId, 
      quantity, 
      user: user?.email 
    });
    
    if (!user) {
      console.log("❌ Cannot add to cart - user not logged in");
      return;
    }

    try {
      // Fetch current product data to ensure accurate pricing and availability
      const productsResponse = await fetch('/api/data?type=products');
      const productsData = await productsResponse.json();
      
      if (productsData.success) {
        const currentProduct = productsData.data.find((p: any) => p.id === newItem.id);
        
        if (!currentProduct) {
          console.error("❌ Product not found in current catalog", { productId: newItem.id });
          return;
        }
        
        if (!currentProduct.inStock) {
          console.error("❌ Product is out of stock", { productId: newItem.id, productName: currentProduct.name });
          return;
        }
        
        // Find the specific duration pricing
        const selectedDuration = currentProduct.durations?.find((d: any) => 
          normalizeDurationId(d.id) === normalizeDurationId(newItem.durationId)
        );
        
        if (!selectedDuration) {
          console.error("❌ Selected duration not available", { 
            productId: newItem.id, 
            requestedDuration: newItem.durationId,
            availableDurations: currentProduct.durations?.map((d: any) => d.id)
          });
          return;
        }
        
        // Create enhanced item with current product data
        const enhancedItem: Omit<CartItem, 'quantity' | 'addedAt'> = {
          ...newItem,
          name: currentProduct.name,
          price: selectedDuration.price,
          originalPrice: selectedDuration.originalPrice,
          image: currentProduct.image,
          color: currentProduct.color,
          description: currentProduct.description,
          warranty: currentProduct.warranty || '30 ngày',
          duration: selectedDuration.name
        };
        
        console.log("✅ Product data validated and enhanced", {
          productId: enhancedItem.id,
          productName: enhancedItem.name,
          currentPrice: enhancedItem.price,
          originalPrice: enhancedItem.originalPrice,
          duration: enhancedItem.duration
        });
        
        setItems(prevItems => {
          // Normalize both new item's durationId and existing items for comparison
          const normalizedNewDurationId = normalizeDurationId(enhancedItem.durationId);
          
          const existingItemIndex = prevItems.findIndex(
            item => item.id === enhancedItem.id && 
                   normalizeDurationId(item.durationId) === normalizedNewDurationId
          );

          let updatedItems: CartItem[];
          
          if (existingItemIndex > -1) {
            // Update existing item quantity and refresh product data
            updatedItems = [...prevItems];
            const oldQuantity = updatedItems[existingItemIndex].quantity;
            updatedItems[existingItemIndex] = {
              ...enhancedItem,
              quantity: oldQuantity + quantity,
              addedAt: updatedItems[existingItemIndex].addedAt, // Keep original add date
              durationId: normalizedNewDurationId
            };
            
            console.log("✅ Updated existing item with fresh data", { 
              productId: enhancedItem.id,
              oldQuantity,
              newQuantity: updatedItems[existingItemIndex].quantity,
              addedQuantity: quantity,
              priceUpdated: updatedItems[existingItemIndex].price !== prevItems[existingItemIndex].price
            });
          } else {
            // Add new item with current product data
            const itemToAdd: CartItem = {
              ...enhancedItem,
              durationId: normalizedNewDurationId,
              quantity,
              addedAt: new Date()
            };
            
            console.log("➕ Added new item with current product data", { 
              productId: itemToAdd.id,
              productName: itemToAdd.name,
              price: itemToAdd.price,
              quantity: itemToAdd.quantity
            });
            
            updatedItems = [...prevItems, itemToAdd];
          }
          
          // Immediate sync to API for this specific operation
          syncCartOperationToAPI(updatedItems, 'add', enhancedItem.id);
          
          return updatedItems;
        });
      } else {
        console.error("❌ Failed to fetch current product data", productsData.error);
        // Fallback to original behavior if API fails
        setItems(prevItems => {
          const normalizedNewDurationId = normalizeDurationId(newItem.durationId);
          const existingItemIndex = prevItems.findIndex(
            item => item.id === newItem.id && 
                   normalizeDurationId(item.durationId) === normalizedNewDurationId
          );

          let updatedItems: CartItem[];
          
          if (existingItemIndex > -1) {
            updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += quantity;
          } else {
            const itemToAdd: CartItem = {
              ...newItem,
              durationId: normalizedNewDurationId,
              quantity,
              addedAt: new Date()
            };
            updatedItems = [...prevItems, itemToAdd];
          }
          
          syncCartOperationToAPI(updatedItems, 'add', newItem.id);
          return updatedItems;
        });
      }
    } catch (error) {
      console.error("❌ Error adding item to cart:", error);
      // Fallback to basic add functionality
      setItems(prevItems => {
        const normalizedNewDurationId = normalizeDurationId(newItem.durationId);
        const itemToAdd: CartItem = {
          ...newItem,
          durationId: normalizedNewDurationId,
          quantity,
          addedAt: new Date()
        };
        const updatedItems = [...prevItems, itemToAdd];
        syncCartOperationToAPI(updatedItems, 'add', newItem.id);
        return updatedItems;
      });
    }
  };

  const removeItem = async (id: number, durationId: string) => {
    console.log("🗑️ ENHANCED: Removing item from cart with comprehensive sync", { id, durationId, user: user?.email });
    
    if (!user) {
      console.error("❌ Cannot remove item - user not logged in");
      return;
    }

    const normalizedDurationId = normalizeDurationId(durationId);
    
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => 
        item.id === id && normalizeDurationId(item.durationId) === normalizedDurationId
      );
      
      if (itemToRemove) {
        console.log("✅ Item found and will be removed", { 
          itemId: itemToRemove.id, 
          itemName: itemToRemove.name,
          itemDurationId: itemToRemove.durationId,
          normalizedDurationId: normalizedDurationId,
          quantity: itemToRemove.quantity,
          cartSizeBefore: prevItems.length
        });
        
        const updatedItems = prevItems.filter(item => 
          !(item.id === id && normalizeDurationId(item.durationId) === normalizedDurationId)
        );
        
        console.log("🔄 Cart updated after removal", {
          itemsBeforeRemoval: prevItems.length,
          itemsAfterRemoval: updatedItems.length,
          removedItemName: itemToRemove.name,
          totalQuantityBefore: prevItems.reduce((sum, item) => sum + item.quantity, 0),
          totalQuantityAfter: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        });
        
        // ENHANCED: Multi-layer sync for delete operation
        syncCartDeletionToAllSystems(updatedItems, itemToRemove, id);
        
        return updatedItems;
      } else {
        console.error("❌ Item not found in cart for removal", { 
          searchId: id, 
          searchDurationId: durationId,
          normalizedSearchDurationId: normalizedDurationId,
          availableItems: prevItems.map(item => ({
            id: item.id,
            name: item.name,
            durationId: item.durationId,
            normalizedDurationId: normalizeDurationId(item.durationId)
          }))
        });
        return prevItems;
      }
    });
  };

  const updateQuantity = async (id: number, durationId: string, quantity: number) => {
    console.log("🔄 Updating item quantity with immediate sync", { id, durationId, quantity });
    
    if (quantity <= 0) {
      await removeItem(id, durationId);
      return;
    }

    const normalizedDurationId = normalizeDurationId(durationId);
    setItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === id && normalizeDurationId(item.durationId) === normalizedDurationId
          ? { ...item, quantity }
          : item
      );
      
      // Immediate sync to API for update operation
      syncCartOperationToAPI(updatedItems, 'update', id);
      
      return updatedItems;
    });
  };

  const clearCart = async () => {
    console.log("🧹 ENHANCED: Clearing entire cart with comprehensive sync", { 
      user: user?.email, 
      currentItemsCount: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
    
    if (!user) {
      console.error("❌ Cannot clear cart - user not logged in");
      return;
    }

    const previousItems = [...items]; // Store for logging
    setItems([]);
    
    // Enhanced localStorage cleanup
    localStorage.removeItem(`qai-store-cart-${user.id}`);
    localStorage.removeItem(`qai-store-cart-error-${user.id}`);
    console.log("🗑️ Cleared all cart storage for user", { userId: user.id });
    
    // ENHANCED: Multi-layer sync for cart clearing
    syncCartClearanceToAllSystems(previousItems);
  };

  const isInCart = (id: number, durationId: string): boolean => {
    const normalizedDurationId = normalizeDurationId(durationId);
    return items.some(item => 
      item.id === id && 
      normalizeDurationId(item.durationId) === normalizedDurationId
    );
  };

  const getItemQuantity = (id: number, durationId: string): number => {
    const normalizedDurationId = normalizeDurationId(durationId);
    const item = items.find(item => 
      item.id === id && 
      normalizeDurationId(item.durationId) === normalizedDurationId
    );
    return item ? item.quantity : 0;
  };

  // Enhanced immediate sync function with validation and performance optimization
  const syncCartOperationToAPI = async (updatedItems: CartItem[], operation: string, itemId: number | null) => {
    if (!user) {
      console.warn("⚠️ Cannot sync cart - no user logged in");
      return;
    }
    
    const syncStart = Date.now();
    
    try {
      console.log(`🚀 Immediate sync for ${operation} operation`, { 
        itemId, 
        cartSize: updatedItems.length,
        userId: user.id,
        operation
      });
      
      // Validate cart items before syncing
      const validItems = updatedItems.filter(item => {
        const isValid = item.id && item.name && item.price >= 0 && item.quantity > 0;
        if (!isValid) {
          console.warn("⚠️ Invalid cart item filtered out", { item });
        }
        return isValid;
      });
      
      if (validItems.length !== updatedItems.length) {
        console.warn(`⚠️ Filtered out ${updatedItems.length - validItems.length} invalid items`);
      }
      
      // Transform to optimized API format
      const apiCartData = validItems.map((item: CartItem) => ({
        userId: user.id,
        productId: item.id,
        productName: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        selectedDuration: item.durationId,
        duration: item.duration,
        image: item.image,
        color: item.color,
        description: item.description,
        warranty: item.warranty,
        addedAt: item.addedAt.toISOString()
      }));
      
      // Calculate cart totals for logging
      const cartTotal = apiCartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const cartSavings = apiCartData.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
      
      // Direct API call with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'userCarts',
          items: apiCartData,
          action: 'bulk_update',
          userId: user.id,
          metadata: {
            operation,
            itemId,
            timestamp: Date.now(),
            cartTotal,
            cartSavings
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const syncDuration = Date.now() - syncStart;
      
      if (result.success) {
        console.log(`✅ ${operation} operation synced successfully`, { 
          itemId, 
          cartSize: validItems.length,
          cartTotal,
          cartSavings,
          syncDuration: `${syncDuration}ms`,
          timestamp: new Date().toISOString()
        });
        
        // Trigger optimized real-time sync event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-operation-synced', {
            detail: { 
              userId: user.id, 
              operation, 
              itemId, 
              cartData: apiCartData,
              cartTotal,
              cartSavings,
              timestamp: Date.now(),
              syncDuration
            }
          }));
        }
      } else {
        throw new Error(result.error || 'Unknown API error');
      }
    } catch (error) {
      const syncDuration = Date.now() - syncStart;
      console.error(`❌ Error in immediate sync for ${operation}:`, {
        error: error instanceof Error ? error.message : error,
        operation,
        itemId,
        cartSize: updatedItems.length,
        syncDuration: `${syncDuration}ms`,
        userId: user.id
      });
      
      // Emergency fallback: save to localStorage with error flag
      try {
        const errorCart = {
          items: updatedItems,
          lastSyncError: {
            operation,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now()
          }
        };
        localStorage.setItem(`qai-store-cart-error-${user.id}`, JSON.stringify(errorCart));
        console.log("💾 Cart saved to emergency localStorage due to sync failure");
      } catch (storageError) {
        console.error("❌ Even emergency localStorage save failed:", storageError);
      }
    }
  };

  // ENHANCED: Multi-layer sync for cart deletion across all systems
  const syncCartDeletionToAllSystems = async (updatedItems: CartItem[], removedItem: CartItem, itemId: number) => {
    if (!user) return;
    
    const syncStart = Date.now();
    console.log("🚀 ENHANCED: Starting comprehensive cart deletion sync", {
      userId: user.id,
      removedItem: {
        id: removedItem.id,
        name: removedItem.name,
        quantity: removedItem.quantity
      },
      cartSizeAfter: updatedItems.length
    });

    try {
      // 1. Immediate localStorage update with timestamp
      const localCartData = {
        items: updatedItems,
        lastModified: Date.now(),
        lastAction: 'delete',
        deletedItem: {
          id: removedItem.id,
          name: removedItem.name,
          quantity: removedItem.quantity,
          deletedAt: new Date().toISOString()
        }
      };
      localStorage.setItem(`qai-store-cart-${user.id}`, JSON.stringify(localCartData));

      // 2. API sync with enhanced error handling and retries
      const apiCartData = updatedItems.map((item: CartItem) => ({
        userId: user.id,
        productId: item.id,
        productName: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        selectedDuration: item.durationId,
        duration: item.duration,
        image: item.image,
        color: item.color,
        description: item.description,
        warranty: item.warranty,
        addedAt: item.addedAt.toISOString()
      }));

      // Enhanced API call with timeout and detailed logging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'userCarts',
          items: apiCartData,
          action: 'bulk_update',
          userId: user.id,
          metadata: {
            operation: 'delete',
            deletedItemId: itemId,
            deletedItemName: removedItem.name,
            timestamp: Date.now(),
            cartTotal: apiCartData.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const syncDuration = Date.now() - syncStart;
      
      if (result.success) {
        console.log("✅ ENHANCED: Cart deletion synced successfully to API", {
          itemId,
          removedItemName: removedItem.name,
          cartSizeAfter: updatedItems.length,
          syncDuration: `${syncDuration}ms`,
          apiResponse: result
        });

        // 3. Broadcast real-time events for cross-component sync
        if (typeof window !== 'undefined') {
          // Primary deletion event
          window.dispatchEvent(new CustomEvent('cart-item-deleted', {
            detail: {
              userId: user.id,
              deletedItem: removedItem,
              updatedCart: apiCartData,
              timestamp: Date.now(),
              syncDuration
            }
          }));

          // Admin notification event
          window.dispatchEvent(new CustomEvent('admin-cart-updated', {
            detail: {
              action: 'delete',
              userId: user.id,
              userEmail: user.email,
              deletedItem: removedItem,
              cartSize: updatedItems.length,
              timestamp: Date.now()
            }
          }));

          // Cross-tab sync event
          window.dispatchEvent(new StorageEvent('storage', {
            key: `qai-store-cart-${user.id}`,
            newValue: JSON.stringify(localCartData),
            storageArea: localStorage
          }));
        }

        // 4. Update user statistics if needed
        try {
          const userStatsKey = `qai_user_stats_${user.id}`;
          const userStats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');
          userStats.lastCartUpdate = Date.now();
          userStats.totalCartActions = (userStats.totalCartActions || 0) + 1;
          userStats.deletedItems = (userStats.deletedItems || 0) + 1;
          localStorage.setItem(userStatsKey, JSON.stringify(userStats));
        } catch (statsError) {
          console.warn("⚠️ Failed to update user stats:", statsError);
        }

      } else {
        throw new Error(result.error || 'Unknown API error');
      }
    } catch (error) {
      const syncDuration = Date.now() - syncStart;
      console.error("❌ ENHANCED: Cart deletion sync failed", {
        error: error instanceof Error ? error.message : error,
        itemId,
        removedItemName: removedItem.name,
        syncDuration: `${syncDuration}ms`,
        userId: user.id
      });

      // Emergency fallback: Store deletion event for retry
      try {
        const errorEvents = JSON.parse(localStorage.getItem(`qai-cart-errors-${user.id}`) || '[]');
        errorEvents.push({
          action: 'delete',
          itemId,
          removedItem,
          updatedItems,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
          retryCount: 0
        });
        localStorage.setItem(`qai-cart-errors-${user.id}`, JSON.stringify(errorEvents.slice(-10))); // Keep last 10 errors
        console.log("💾 Deletion error stored for retry");
      } catch (storageError) {
        console.error("❌ Even error storage failed:", storageError);
      }
    }
  };

  // ENHANCED: Multi-layer sync for cart clearance across all systems
  const syncCartClearanceToAllSystems = async (previousItems: CartItem[]) => {
    if (!user) return;
    
    const syncStart = Date.now();
    console.log("🚀 ENHANCED: Starting comprehensive cart clearance sync", {
      userId: user.id,
      previousItemsCount: previousItems.length,
      previousValue: previousItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

    try {
      // 1. API sync to clear cart completely
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'userCarts',
          items: [], // Empty array to clear cart
          action: 'bulk_update',
          userId: user.id,
          metadata: {
            operation: 'clear',
            previousItemCount: previousItems.length,
            timestamp: Date.now()
          }
        })
      });
      
      const result = await response.json();
      const syncDuration = Date.now() - syncStart;
      
      if (result.success) {
        console.log("✅ ENHANCED: Cart clearance synced successfully", {
          userId: user.id,
          clearedItemsCount: previousItems.length,
          syncDuration: `${syncDuration}ms`
        });

        // Broadcast clearance events
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-cleared', {
            detail: {
              userId: user.id,
              clearedItems: previousItems,
              timestamp: Date.now(),
              syncDuration
            }
          }));

          window.dispatchEvent(new CustomEvent('admin-cart-cleared', {
            detail: {
              userId: user.id,
              userEmail: user.email,
              clearedItemsCount: previousItems.length,
              timestamp: Date.now()
            }
          }));
        }
      } else {
        throw new Error(result.error || 'Cart clearance API error');
      }
    } catch (error) {
      console.error("❌ ENHANCED: Cart clearance sync failed", {
        error: error instanceof Error ? error.message : error,
        userId: user.id,
        previousItemsCount: previousItems.length
      });
    }
  };

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
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}