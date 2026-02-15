"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import DataSyncHelper from '@/lib/syncHelper';
import { applyDiscountCodeApi } from '@/lib/api';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'momo' | 'banking' | 'card' | 'crypto';
  logo?: string;
  fee: number;
  processingTime: string;
  isActive: boolean;
}

interface DiscountCode {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  // Giá trị giảm cụ thể do backend tính (ưu tiên dùng nếu có)
  discountAmount?: number;
}

interface Order {
  id: string;
  date: Date;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  items: any[];
  total: number;
  originalTotal: number;
  notes?: string;
  discount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  customerInfo: any;
  deliveryInfo?: {
    email: string;
    deliveredAt?: Date;
    accountCredentials?: any[];
  };
  discountCode?: string;
  transactionId?: string;
}

interface PaymentContextType {
  // Payment Methods
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (id: string) => void;

  // Discount Codes
  appliedDiscount: DiscountCode | null;
  applyDiscountCode: (code: string, orderTotal: number) => Promise<boolean>;
  removeDiscountCode: () => void;

  // Orders
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  processPayment: (orderId: string, paymentData: any) => Promise<boolean>;
  deliverDigitalProducts: (orderId: string) => Promise<boolean>;

  // Payment Processing
  isProcessingPayment: boolean;
  paymentError: string | null;

  // Analytics
  getOrderStats: () => {
    totalOrders: number;
    totalSpent: number;
    totalSaved: number;
    pendingOrders: number;
  };
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();

  const [paymentMethods] = useState<PaymentMethod[]>([
    // {
    //   id: 'momo',
    //   name: 'Ví MoMo',
    //   type: 'momo',
    //   fee: 0,
    //   processingTime: 'Tức thì',
    //   isActive: true
    // },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      type: 'banking',
      fee: 0,
      processingTime: '5-15 phút',
      isActive: true
    },
    // {
    //   id: 'card',
    //   name: 'Thẻ tín dụng/ghi nợ',
    //   type: 'card',
    //   fee: 2500,
    //   processingTime: 'Tức thì',
    //   isActive: true
    // },
    // {
    //   id: 'crypto',
    //   name: 'Cryptocurrency',
    //   type: 'crypto',
    //   fee: 0,
    //   processingTime: '10-30 phút',
    //   isActive: true
    // }
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('momo');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  console.log("PaymentProvider initialized", {
    user: user?.email,
    ordersCount: orders.length,
    appliedDiscount: appliedDiscount?.code
  });

  useEffect(() => {
    const loadUserOrders = async () => {
      if (user && user.id) {
        console.log("📦 Loading orders for user", { userId: user.id });

        try {
          // Load orders from JSON API with fallback to localStorage
          const ordersData = await DataSyncHelper.loadUserData(user.id, 'orders');

          if (ordersData.length > 0) {
            // Transform API orders data to local format
            const transformedOrders = ordersData.map((order: any) => ({
              id: order.id,
              date: new Date(order.date || order.createdAt),
              status: order.status,
              items: order.products || order.items,
              total: order.total,
              originalTotal: order.originalTotal || order.total,
              discount: order.discount || 0,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus || (order.status === 'completed' ? 'completed' : 'pending'),
              customerInfo: {
                name: order.customerName,
                email: order.userEmail,
                phone: order.customerPhone || ''
              },
              notes: order.notes || '',                 // ✅ THÊM
              deliveryInfo: order.deliveryInfo,
              discountCode: order.discountCode,
              transactionId: order.transactionId || order.id
            }));

            setOrders(transformedOrders);
            console.log("✅ Orders loaded from API", { count: transformedOrders.length });
          } else {
            // Fallback to localStorage
            const storedOrders = localStorage.getItem(`qai_orders_${user.id}`);
            if (storedOrders) {
              try {
                const parsedOrders = JSON.parse(storedOrders).map((order: any) => ({
                  ...order,
                  date: new Date(order.date)
                }));
                setOrders(parsedOrders);
                console.log("💾 Orders loaded from localStorage", { count: parsedOrders.length });
              } catch (error) {
                console.error("❌ Error loading orders from localStorage:", error);
                setOrders([]);
              }
            } else {
              console.log("📝 No stored orders found for user");
              setOrders([]);
            }
          }
        } catch (error) {
          console.error("❌ Error loading user orders:", error);
          setOrders([]);
        }
      } else if (user === null) {
        // Only clear when user is explicitly null (not undefined/loading)
        console.log("🔄 User logged out, clearing orders");
        setOrders([]);
        setCurrentOrder(null);
        setAppliedDiscount(null);
      }
      // Don't clear when user is undefined (still loading)
    };

    loadUserOrders();
  }, [user]);

  const saveOrders = async (newOrders: Order[]) => {
    // if (user && user.id) {
    //   console.log("💾 Saving orders to JSON API and localStorage", {
    //     userId: user.id,
    //     orderCount: newOrders.length
    //   });

    //   // Save to localStorage immediately for offline access
    //   localStorage.setItem(`qai_orders_${user.id}`, JSON.stringify(newOrders));

    //   try {
    //     // Transform orders to standardized API format for admin synchronization
    //     const apiOrdersData = newOrders.map((order: Order) => ({
    //       id: order.id,
    //       userId: user.id,
    //       userEmail: order.customerInfo.email,
    //       customerName: order.customerInfo.name || user.name || user.email.split('@')[0],
    //       customerPhone: order.customerInfo.phone || '',
    //       products: order.items.map((item: any) => ({
    //         id: item.id,
    //         name: item.name,
    //         quantity: item.quantity,
    //         price: item.price,
    //         duration: item.duration
    //       })),
    //       total: order.total,
    //       originalTotal: order.originalTotal,
    //       discount: order.discount,
    //       status: order.status,
    //       paymentMethod: order.paymentMethod,
    //       paymentStatus: order.paymentStatus,
    //       createdAt: order.date.toISOString(),
    //       date: order.date.toISOString(),
    //       completedAt: order.status === 'completed' ? new Date().toISOString() : null,
    //       shippingAddress: order.customerInfo.socialContact || '',
    //       notes: order.status === 'completed' ? 'Order completed with digital delivery' : '',
    //       discountCode: order.discountCode,
    //       transactionId: order.transactionId,
    //       deliveryInfo: order.deliveryInfo
    //     }));

    //     // CRITICAL: Primary save directly to JSON data file with immediate persistence
    //     console.log("🔥 CRITICAL: Primary order save - adding order to JSON data file...");

    //     const primarySaveResponse = await fetch('/api/data', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         type: 'orders',
    //         action: 'bulk_update',
    //         items: apiOrdersData
    //       })
    //     });

    //     const primarySaveResult = await primarySaveResponse.json();
    //     console.log("🔥 CRITICAL: Primary save result:", {
    //       success: primarySaveResult.success,
    //       orderCount: apiOrdersData.length,
    //       orderIds: apiOrdersData.map(o => o.id)
    //     });

    //     // Backup save using DataSyncHelper
    //     const success = await DataSyncHelper.saveToAPI('orders', apiOrdersData, 'bulk_update');
    //     console.log("📊 Backup save result:", { success });

    //     // Trigger real-time admin updates for order data
    //     if (typeof window !== 'undefined') {
    //       window.dispatchEvent(new CustomEvent('orders-json-saved', {
    //         detail: {
    //           orders: apiOrdersData,
    //           userId: user.id,
    //           timestamp: Date.now(),
    //           apiSynced: success
    //         }
    //       }));
    //     }

    //     console.log("✅ Orders synchronized to JSON API", {
    //       userId: user.id,
    //       count: newOrders.length,
    //       apiSynced: success,
    //       completedOrders: newOrders.filter(o => o.status === 'completed').length
    //     });

    //     // Trigger real-time admin updates for completed orders
    //     const completedOrders = newOrders.filter(o => o.status === 'completed');
    //     if (completedOrders.length > 0 && typeof window !== 'undefined') {
    //       window.dispatchEvent(new CustomEvent('orders-updated', {
    //         detail: {
    //           orders: apiOrdersData,
    //           completedOrders: completedOrders.length,
    //           userId: user.id
    //         }
    //       }));
    //     }

    //   } catch (error) {
    //     console.error("❌ CRITICAL: Failed to save orders to JSON API:", error);
    //     // Even on error, ensure localStorage save as absolute fallback
    //     try {
    //       localStorage.setItem(`qai_orders_${user.id}`, JSON.stringify(newOrders));
    //       console.log("💾 Emergency: Orders saved to localStorage only");
    //     } catch (localError) {
    //       console.error("❌ EMERGENCY: All save methods failed:", localError);
    //     }
    //   }
    // } else {
    //   console.warn("⚠️ Cannot save orders - no user logged in");
    // }
  };

  const applyDiscountCode = async (code: string, orderTotal: number): Promise<boolean> => {
    console.log("Applying discount code (backend)", { code, orderTotal });

    try {
      const data = await applyDiscountCodeApi(code, orderTotal, sessionId ?? undefined);

      const discount: DiscountCode = {
        code: data.code,
        description: data.message,
        type: data.type,
        value: data.value,
        expiryDate: new Date().toISOString(), // không dùng phía client, chỉ để đủ type
        usedCount: 0,
        isActive: true,
        discountAmount: data.discountAmount,
      };

      setAppliedDiscount(discount);
      toast({
        title: "Mã giảm giá áp dụng thành công!",
        description: data.message,
      });
      console.log("Discount applied from backend", data);
      return true;
    } catch (error: any) {
      console.error("Failed to apply discount code via API", error);
      toast({
        title: "Mã giảm giá không hợp lệ",
        description: error?.message || "Vui lòng kiểm tra lại mã giảm giá hoặc điều kiện áp dụng.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeDiscountCode = () => {
    console.log("Removing discount code");
    setAppliedDiscount(null);
    toast({
      title: "Đã xóa mã giảm giá",
      description: "Mã giảm giá đã được gỡ bỏ khỏi đơn hàng.",
    });
  };

  const calculateDiscount = (orderTotal: number, discount: DiscountCode): number => {
    if (typeof discount.discountAmount === 'number') {
      return discount.discountAmount;
    }
    // Chỉ giảm tiền (fixed)
    return Math.min(discount.value ?? 0, orderTotal);
  };

  const createOrder = async (orderData: any): Promise<string> => {

    if (!user) {
      throw new Error("User must be logged in to create order");
    }

    const orderId = `ORD_${Date.now()}`;
    const discount = appliedDiscount ? calculateDiscount(orderData.total, appliedDiscount) : 0;

    const newOrder: Order = {
      id: orderId,
      date: new Date(),
      status: 'pending',
      items: orderData.items,
      originalTotal: orderData.total,
      total: orderData.total - discount,
      discount,
      paymentMethod: selectedPaymentMethod || 'wallet',
      paymentStatus: 'pending',
      notes: orderData.notes?.trim() || '',             // ✅ THÊM DÒNG NÀY
      customerInfo: orderData.customerInfo,
      discountCode: appliedDiscount?.code,
      transactionId: `TXN_${Date.now()}`
    };

    // Step 1: Update local state immediately for instant UI feedback
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setCurrentOrder(newOrder);

    // Step 2: Save order to JSON API via OrderHistoryManager with enhanced retry logic
    try {
      const { OrderHistoryManager } = await import('@/lib/orderHistory');
      const historyItem = OrderHistoryManager.createOrderFromPayment(newOrder, user, orderData.customerInfo);

      console.log("💾 PaymentContext: Saving order to JSON file with retry mechanism", { orderId });

      // Enhanced save with retry mechanism
      let saveSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!saveSuccess && retryCount < maxRetries) {
        try {
          saveSuccess = await OrderHistoryManager.saveOrderToHistory(historyItem);

          if (saveSuccess) {
            console.log(`✅ PaymentContext: Order saved to JSON file successfully on attempt ${retryCount + 1}`, { orderId });
            break;
          } else {
            retryCount++;
            if (retryCount < maxRetries) {
              console.warn(`⚠️ PaymentContext: Order save attempt ${retryCount} failed, retrying in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000)); // Progressive delay
            }
          }
        } catch (saveError) {
          console.error(`❌ PaymentContext: Save attempt ${retryCount + 1} failed:`, saveError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          }
        }
      }

      if (!saveSuccess) {
        console.error("❌ PaymentContext: Failed to save order to JSON file after all retries");

        // Critical fallback: Use direct API call to /api/data
        try {
          console.log("🔥 PaymentContext: Using critical fallback - direct API save");

          const fallbackResponse = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'orders',
              action: 'add',
              item: {
                id: historyItem.id,
                userId: historyItem.userId,
                userEmail: historyItem.userEmail,
                customerName: historyItem.customerName,
                customerPhone: historyItem.customerPhone || '',
                products: historyItem.products,
                total: historyItem.total,
                originalTotal: historyItem.originalTotal,
                discount: historyItem.discount,
                status: historyItem.status,
                paymentMethod: historyItem.paymentMethod,
                paymentStatus: historyItem.paymentStatus,
                createdAt: historyItem.createdAt,
                date: historyItem.createdAt,
                shippingAddress: historyItem.shippingAddress || '',
                notes: 'Order saved via critical fallback API',
                discountCode: historyItem.discountCode,
                transactionId: historyItem.transactionId
              }
            })
          });

          const fallbackResult = await fallbackResponse.json();

          if (fallbackResult.success) {
            console.log("✅ PaymentContext: Critical fallback save successful", { orderId });
            saveSuccess = true;
          } else {
            console.error("❌ PaymentContext: Critical fallback also failed", fallbackResult.error);
          }
        } catch (fallbackError) {
          console.error("❌ PaymentContext: Critical fallback API call failed:", fallbackError);
        }
      }

      // Step 3: Always save to localStorage as additional backup
      await saveOrders(updatedOrders);

    } catch (error) {
      console.error("❌ PaymentContext: Error in order creation flow:", error);
      // Emergency fallback to old save method
      await saveOrders(updatedOrders);
    }

    // Step 4: Trigger real-time events for UI synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('order-created', {
        detail: {
          orderId,
          orderData: newOrder,
          timestamp: Date.now()
        }
      }));

      window.dispatchEvent(new CustomEvent('admin-order-created', {
        detail: {
          orderId,
          userId: user.id,
          userEmail: user.email,
          total: newOrder.total,
          timestamp: Date.now()
        }
      }));
    }

    console.log("✅ PaymentContext: Order created successfully with enhanced flow", { orderId, total: newOrder.total });
    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    console.log("📝 PaymentContext: Updating order status via OrderHistoryManager", { orderId, status });

    // Ensure order exists in local state before updating
    let targetOrder = orders.find(order => order.id === orderId);

    if (!targetOrder) {
      console.log("⚠️ PaymentContext: Order not found in local state for status update, fetching...");

      try {
        const { OrderHistoryManager } = await import('@/lib/orderHistory');
        const apiOrder = await OrderHistoryManager.getOrderById(orderId);

        if (apiOrder && apiOrder.userId === user?.id) {
          // Convert and add to local state
          targetOrder = {
            id: apiOrder.id,
            date: new Date(apiOrder.createdAt),
            status: apiOrder.status as any,
            items: apiOrder.products.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              quantity: p.quantity,
              duration: p.duration,
              category: p.category,
              description: p.description
            })),
            originalTotal: apiOrder.originalTotal,
            total: apiOrder.total,
            discount: apiOrder.discount,
            paymentMethod: apiOrder.paymentMethod,
            paymentStatus: apiOrder.paymentStatus as any,
            customerInfo: {
              name: apiOrder.customerName,
              email: apiOrder.userEmail,
              phone: apiOrder.customerPhone || '',
              socialContact: apiOrder.shippingAddress || ''
            },
            discountCode: apiOrder.discountCode,
            transactionId: apiOrder.transactionId
          };

          // Add to local state first
          setOrders(prev => [targetOrder!, ...prev.filter(o => o.id !== orderId)]);
        }
      } catch (error) {
        console.error("❌ PaymentContext: Error fetching order for status update:", error);
      }
    }

    // Update local state
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );

    setOrders(updatedOrders);

    if (currentOrder?.id === orderId) {
      setCurrentOrder({ ...currentOrder, status });
    }

    // Update order status in JSON API via OrderHistoryManager
    try {
      const { OrderHistoryManager } = await import('@/lib/orderHistory');

      const updateSuccess = await OrderHistoryManager.updateOrderStatus(orderId, status);

      if (updateSuccess) {
        console.log("✅ PaymentContext: Order status updated in JSON file successfully", { orderId, status });
      } else {
        console.warn("⚠️ PaymentContext: Failed to update order status in JSON file");
      }

      // Backup save to localStorage
      await saveOrders(updatedOrders);

    } catch (error) {
      console.error("❌ PaymentContext: Error updating order status:", error);
      // Fallback to old save method
      await saveOrders(updatedOrders);
    }
  };

  const generateAccountCredentials = (item: any) => {
    // Generate realistic account credentials based on service type
    const serviceCredentials: { [key: string]: any } = {
      1: { // Netflix
        email: `netflix.premium.${Date.now()}@qaistore.com`,
        password: `NF${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
        profilePins: ['1234', '5678', '9012', '3456'],
        note: 'Tài khoản Netflix Premium 4K - Sử dụng được trên 4 thiết bị cùng lúc'
      },
      2: { // Spotify
        email: `spotify.premium.${Date.now()}@qaistore.com`,
        password: `SP${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
        note: 'Tài khoản Spotify Premium - Nghe nhạc chất lượng cao không giới hạn'
      },
      3: { // ChatGPT Plus
        email: `chatgpt.plus.${Date.now()}@qaistore.com`,
        password: `GPT${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
        note: 'Tài khoản ChatGPT Plus - Truy cập GPT-4 và các tính năng cao cấp'
      },
      4: { // YouTube Premium
        email: `youtube.premium.${Date.now()}@qaistore.com`,
        password: `YT${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
        note: 'Tài khoản YouTube Premium - Xem video không quảng cáo + YouTube Music'
      },
      5: { // Canva Pro
        email: `canva.pro.${Date.now()}@qaistore.com`,
        password: `CV${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
        note: 'Tài khoản Canva Pro - Thiết kế chuyên nghiệp với template premium'
      },
      6: { // Adobe Creative
        email: `adobe.creative.${Date.now()}@qaistore.com`,
        password: `AD${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
        note: 'Tài khoản Adobe Creative Cloud - Truy cập tất cả ứng dụng Adobe'
      }
    };

    return serviceCredentials[item.id] || {
      email: `account.${Date.now()}@qaistore.com`,
      password: `ACC${Math.random().toString(36).substring(2, 10).toUpperCase()}!`,
      note: 'Tài khoản premium chất lượng cao'
    };
  };

  const deliverDigitalProducts = async (orderId: string): Promise<boolean> => {
    console.log("📦 PaymentContext: Delivering digital products with enhanced lookup", { orderId });

    if (!user) {
      console.error("❌ PaymentContext: User not logged in for delivery");
      return false;
    }

    // Multi-step order lookup with improved error handling
    let order = orders.find(o => o.id === orderId);

    // If not found locally, try to load from OrderHistoryManager with retry
    if (!order) {
      console.log("⚠️ PaymentContext: Order not found in local state, attempting API lookup with retries", { orderId });

      let apiOrder: any = null;
      let retryCount = 0;
      const maxRetries = 5;

      while (!apiOrder && retryCount < maxRetries) {
        try {
          const { OrderHistoryManager } = await import('@/lib/orderHistory');
          const foundOrder = await OrderHistoryManager.getOrderById(orderId);

          if (foundOrder && foundOrder.userId === user.id) {
            console.log(`✅ PaymentContext: Order found in API on attempt ${retryCount + 1}`, { orderId });
            apiOrder = foundOrder;
            break;
          } else if (foundOrder) {
            console.error("❌ PaymentContext: Order found but doesn't belong to user", {
              orderId,
              orderUserId: foundOrder.userId,
              currentUserId: user.id
            });
            return false;
          } else {
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`⏳ PaymentContext: Order not found, retry ${retryCount}/${maxRetries} in ${retryCount * 500}ms`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 500)); // Progressive delay
            }
          }
        } catch (error) {
          console.error(`❌ PaymentContext: Error on API lookup attempt ${retryCount + 1}:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryCount * 500));
          }
        }
      }

      if (apiOrder) {
        console.log("✅ PaymentContext: Order found in API, converting to local format");

        // Convert API order format to local Order format
        order = {
          id: apiOrder.id,
          date: new Date(apiOrder.createdAt),
          status: apiOrder.status as any,
          items: apiOrder.products.map((p: { id: any; name: any; price: any; quantity: any; duration: any; category: any; description: any; }) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            duration: p.duration,
            category: p.category,
            description: p.description
          })),
          originalTotal: apiOrder.originalTotal,
          total: apiOrder.total,
          discount: apiOrder.discount,
          paymentMethod: apiOrder.paymentMethod,
          paymentStatus: apiOrder.paymentStatus as any,
          customerInfo: {
            name: apiOrder.customerName,
            email: apiOrder.userEmail,
            phone: apiOrder.customerPhone || '',
            socialContact: apiOrder.shippingAddress || ''
          },
          discountCode: apiOrder.discountCode,
          transactionId: apiOrder.transactionId
        };

        // Add order to local state for future reference
        const updatedOrders = [order, ...orders.filter(o => o.id !== orderId)];
        setOrders(updatedOrders);

      } else {
        console.error("❌ PaymentContext: Order not found in API after retries or doesn't belong to user", {
          orderId,
          userId: user.id,
          retriesAttempted: retryCount
        });
        return false;
      }
    }

    if (!order) {
      console.error("❌ PaymentContext: Order not found anywhere after all attempts", { orderId, hasUser: !!user });
      return false;
    }

    try {
      // Generate account credentials for each item
      const accountCredentials = order.items.map(item => ({
        itemId: item.id,
        itemName: item.name,
        credentials: generateAccountCredentials(item),
        deliveredAt: new Date()
      }));

      // Update local order state
      const completedOrder = {
        ...order,
        status: 'completed' as const,
        paymentStatus: 'completed' as const,
        deliveryInfo: {
          email: order.customerInfo.email,
          deliveredAt: new Date(),
          accountCredentials
        }
      };

      const updatedOrders = orders.map(o => o.id === orderId ? completedOrder : o);
      setOrders(updatedOrders);

      // Save order completion to JSON API via OrderHistoryManager
      const { OrderHistoryManager } = await import('@/lib/orderHistory');

      const completionSuccess = await OrderHistoryManager.completeOrderWithDelivery(
        orderId,
        accountCredentials,
        order.customerInfo.email
      );

      if (completionSuccess) {
        console.log("✅ PaymentContext: Order completion saved to JSON file successfully");

        // Update customer ranking with error handling
        try {
          await DataSyncHelper.updateCustomerRanking(user.email, order.total, order.items.length);
        } catch (error) {
          console.warn("⚠️ Failed to update customer ranking:", error);
        }

        // Trigger real-time updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('order-completed', {
            detail: {
              orderId: order.id,
              userId: user.id,
              userEmail: user.email,
              total: order.total,
              timestamp: Date.now()
            }
          }));
        }

        // Show success notification
        toast({
          title: "🎉 Giao hàng thành công!",
          description: `Tài khoản đã được gửi về email ${order.customerInfo.email} và lưu vào hệ thống`,
        });

        // Check for rank up notification with error handling
        setTimeout(async () => {
          try {
            await checkRankUpNotification(user.email, order.total, order.items.length);
          } catch (error) {
            console.warn("⚠️ Failed to check rank up notification:", error);
          }
        }, 1000);

        return true;
      } else {
        console.error("❌ PaymentContext: Failed to save order completion to JSON file");
        return false;
      }

    } catch (error) {
      console.error("❌ PaymentContext: Error delivering digital products:", error);
      return false;
    }
  };

  const processPayment = async (orderId: string, paymentData: any): Promise<boolean> => {
    console.log("Processing payment", { orderId, paymentData });
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // Update order status to processing  
      await updateOrderStatus(orderId, 'processing');

      let paymentSuccess = false;
      let result: any = null;

      // Handle different payment methods
      if (paymentData.method === 'wallet') {
        // Handle coin/wallet payments via payment API
        console.log("💰 Processing wallet payment via API", { orderId, amount: paymentData.amount });

        try {
          const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              method: 'wallet',
              paymentData: paymentData,
              orderId: orderId
            })
          });

          const apiResult = await response.json();
          console.log("💰 Wallet payment API response", apiResult);

          if (apiResult.success) {
            paymentSuccess = true;
            result = apiResult.data;
          } else {
            throw new Error(apiResult.error || "Wallet payment API returned failure");
          }
        } catch (apiError: any) {
          console.error("💰 Wallet payment API error:", apiError);
          throw new Error(apiError.message || "Failed to process wallet payment via API");
        }
      } else {
        // Handle external payments via payment API
        console.log("Processing external payment via API", { orderId, method: paymentData.method });

        try {
          const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              method: paymentData.method,
              paymentData: paymentData,
              orderId: orderId
            })
          });

          const apiResult = await response.json();
          console.log("Payment API response", apiResult);

          if (apiResult.success) {
            paymentSuccess = true;
            result = apiResult.data;
          } else {
            throw new Error(apiResult.error || "Payment API returned failure");
          }
        } catch (apiError: any) {
          console.error("Payment API error:", apiError);
          throw new Error(apiError.message || "Failed to process payment via API");
        }
      }

      if (paymentSuccess && result) {
        // Find and update payment status
        let targetOrder = orders.find(order => order.id === orderId);

        if (!targetOrder) {
          console.warn("⚠️ PaymentContext: Order not found in local state during payment completion, fetching...");

          try {
            const { OrderHistoryManager } = await import('@/lib/orderHistory');
            const apiOrder = await OrderHistoryManager.getOrderById(orderId);

            if (apiOrder && apiOrder.userId === user?.id) {
              // Convert and add to local state
              targetOrder = {
                id: apiOrder.id,
                date: new Date(apiOrder.createdAt),
                status: apiOrder.status as any,
                items: apiOrder.products.map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  quantity: p.quantity,
                  duration: p.duration,
                  category: p.category,
                  description: p.description
                })),
                originalTotal: apiOrder.originalTotal,
                total: apiOrder.total,
                discount: apiOrder.discount,
                paymentMethod: apiOrder.paymentMethod,
                paymentStatus: apiOrder.paymentStatus as any,
                customerInfo: {
                  name: apiOrder.customerName,
                  email: apiOrder.userEmail,
                  phone: apiOrder.customerPhone || '',
                  socialContact: apiOrder.shippingAddress || ''
                },
                discountCode: apiOrder.discountCode,
                transactionId: apiOrder.transactionId
              };

              // Add to local state
              setOrders(prev => [targetOrder!, ...prev.filter(o => o.id !== orderId)]);
            }
          } catch (error) {
            console.error("❌ PaymentContext: Error fetching order during payment:", error);
          }
        }

        // Update payment status and transaction info
        const updatedOrders = orders.map(order =>
          order.id === orderId
            ? {
              ...order,
              paymentStatus: 'completed' as const,
              paymentMethod: result.method,
              transactionId: result.transactionId
            }
            : order
        );
        setOrders(updatedOrders);
        await saveOrders(updatedOrders);

        // For wallet payments, coins should already be deducted by the checkout component
        // before calling processPayment, so we just log the successful payment completion
        if (result.method === 'wallet' && user) {
          console.log("✅ Wallet payment completed - coins were deducted by checkout component", {
            orderId,
            amount: paymentData.amount,
            transactionId: result.transactionId
          });
        }

        // Deliver digital products for completed payments
        if (result.status === 'completed') {
          await deliverDigitalProducts(orderId);
        }

        // Clear applied discount after successful payment
        if (appliedDiscount) {
          setAppliedDiscount(null);
        }

        // Show appropriate success message based on payment method
        if (result.status === 'completed') {
          toast({
            title: "Thanh toán thành công! 🎉",
            description: result.method === 'wallet'
              ? "Tài khoản đã được gửi về email của bạn."
              : `Giao dịch ${result.transactionId} đã được xử lý thành công.`,
          });
        } else if (result.status === 'pending') {
          toast({
            title: "Đã tạo thanh toán! ⏳",
            description: result.method === 'banking'
              ? "Vui lòng thực hiện chuyển khoản theo hướng dẫn."
              : "Đang chờ xác nhận từ blockchain.",
          });
        }

        console.log("✅ Payment completed successfully", {
          orderId,
          method: result.method,
          status: result.status,
          transactionId: result.transactionId
        });

        return true;
      } else {
        // Payment failed
        await updateOrderStatus(orderId, 'cancelled');
        const updatedOrders = orders.map(order =>
          order.id === orderId
            ? { ...order, paymentStatus: 'failed' as const }
            : order
        );
        setOrders(updatedOrders);
        await saveOrders(updatedOrders);

        setPaymentError("Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức khác.");

        toast({
          title: "Thanh toán thất bại",
          description: "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
          variant: "destructive",
        });

        return false;
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentError("Có lỗi xảy ra trong quá trình thanh toán.");
      await updateOrderStatus(orderId, 'cancelled');
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    const totalSaved = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.discount, 0);
    const pendingOrders = orders.filter(order =>
      order.status === 'pending' || order.status === 'processing'
    ).length;

    return { totalOrders, totalSpent, totalSaved, pendingOrders };
  };

  const checkRankUpNotification = async (userEmail: string, orderTotal: number, itemCount: number) => {
    // try {
    //   console.log("🔔 Checking for rank up notification", { userEmail, orderTotal, itemCount });

    //   // Get current order stats
    //   const stats = getOrderStats();
    //   const { calculateCustomerRank } = await import('@/components/CustomerRankingSystem');

    //   // Calculate rank before and after this purchase
    //   const previousRank = calculateCustomerRank(stats.totalSpent - orderTotal, stats.totalOrders - 1);
    //   const currentRank = calculateCustomerRank(stats.totalSpent, stats.totalOrders);

    //   // Check if rank has increased
    //   if (currentRank.id !== previousRank.id) {
    //     console.log("🎉 RANK UP! From", previousRank.name, "to", currentRank.name);

    //     // Show celebration toast
    //     toast({
    //       title: "🎉 Chúc mừng! Bạn đã lên hạng!",
    //       description: `Bạn đã lên hạng ${currentRank.name}! Khám phá những ưu đãi mới.`,
    //       duration: 8000,
    //     });

    //     // After a delay, show special rank up notification
    //     setTimeout(() => {
    //       toast({
    //         title: "🎁 Phần thưởng mới đã mở khóa!",
    //         description: `Xem ngay các ưu đãi dành riêng cho hạng ${currentRank.name}`,
    //         action: (
    //           <button
    //             onClick={() => {
    //               // Use event to trigger navigation
    //               if (typeof window !== 'undefined') {
    //                 window.dispatchEvent(new CustomEvent('navigate-to-ranking', {
    //                   detail: { path: '/my-ranking' }
    //                 }));
    //               }
    //             }}
    //             className="bg-brand-blue text-white px-4 py-2 rounded-md text-sm hover:bg-brand-blue/90"
    //           >
    //             Xem ngay
    //           </button>
    //         ),
    //         duration: 10000,
    //       });
    //     }, 3000);
    //   }
    // } catch (error) {
    //   console.error("Error checking rank up:", error);
    // }
  };

  return (
    <PaymentContext.Provider value={{
      paymentMethods,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      appliedDiscount,
      applyDiscountCode,
      removeDiscountCode,
      orders,
      currentOrder,
      createOrder,
      updateOrderStatus,
      processPayment,
      deliverDigitalProducts,
      isProcessingPayment,
      paymentError,
      getOrderStats
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}