/**
 * Order History Manager
 * Streamlined order data management with JSON API persistence
 */

export interface OrderHistoryItem {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone?: string;
  products: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    duration: string;
    category?: string;
    description?: string;
  }[];
  total: number;
  originalTotal: number;
  discount: number;
  discountCode?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  paymentMethod: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  date?: string; // Legacy compatibility
  completedAt?: string;
  shippingAddress?: string;
  notes?: string;
  transactionId?: string;
  deliveryInfo?: {
    email: string;
    deliveredAt: string;
    accountCredentials: any[];
  };
  metadata?: any; // For additional data
}

export class OrderHistoryManager {
  private static readonly API_ENDPOINT = '/api/data';

  /**
   * Save order to data.json file via API
   */
  static async saveOrderToHistory(orderData: OrderHistoryItem): Promise<boolean> {
    console.log('💾 OrderHistory: Saving order to JSON file', { orderId: orderData.id });

    try {
      // Validate order data
      if (!orderData.id || !orderData.userId || !orderData.userEmail) {
        console.error('❌ OrderHistory: Invalid order data - missing required fields');
        return false;
      }

      // Prepare order for JSON API
      const formattedOrder: OrderHistoryItem = {
        ...orderData,
        createdAt: orderData.createdAt || new Date().toISOString(),
        date: orderData.createdAt || new Date().toISOString(), // Legacy compatibility
        
        // Enhanced metadata for admin dashboard
        metadata: {
          savedAt: new Date().toISOString(),
          version: '2.0',
          source: 'payment_completion'
        }
      };

      // Save order to JSON API
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'orders',
          action: 'add',
          item: formattedOrder
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ OrderHistory: Order saved to JSON file successfully', { orderId: orderData.id });
        
        // Trigger real-time updates
        this.broadcastOrderUpdate(formattedOrder, 'created');
        
        return true;
      } else {
        console.error('❌ OrderHistory: API returned error:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ OrderHistory: Failed to save order to JSON file:', error);
      return false;
    }
  }

  /**
   * Update order status in data.json file
   */
  static async updateOrderStatus(orderId: string, status: OrderHistoryItem['status'], additionalData: Partial<OrderHistoryItem> = {}): Promise<boolean> {
    console.log('🔄 OrderHistory: Updating order status', { orderId, status });

    try {
      const updateData = {
        status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };

      // If order is being completed, add completion timestamp
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
        updateData.paymentStatus = 'completed';
      }

      const response = await fetch(this.API_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'orders',
          id: orderId,
          item: updateData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ OrderHistory: Order status updated successfully', { orderId, status });
        
        // Trigger real-time updates
        this.broadcastOrderUpdate({ id: orderId, ...updateData } as OrderHistoryItem, 'updated');
        
        return true;
      } else {
        console.error('❌ OrderHistory: Failed to update order status:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ OrderHistory: Error updating order status:', error);
      return false;
    }
  }

  /**
   * Get all orders from data.json file
   */
  static async getOrderHistory(userId?: string): Promise<OrderHistoryItem[]> {
    console.log('📥 OrderHistory: Loading order history', { userId });

    try {
      const response = await fetch(`${this.API_ENDPOINT}?type=orders&timestamp=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        let orders = result.data;

        // Filter by userId if provided
        if (userId) {
          orders = orders.filter((order: OrderHistoryItem) => order.userId === userId);
        }

        // Sort by creation date (newest first)
        orders.sort((a: OrderHistoryItem, b: OrderHistoryItem) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log('✅ OrderHistory: Loaded order history', { 
          totalOrders: result.data.length, 
          userOrders: orders.length 
        });

        return orders;
      } else {
        console.warn('⚠️ OrderHistory: No orders found or API error');
        return [];
      }

    } catch (error) {
      console.error('❌ OrderHistory: Failed to load order history:', error);
      return [];
    }
  }

  /**
   * Get specific order by ID
   */
  static async getOrderById(orderId: string): Promise<OrderHistoryItem | null> {
    console.log('🔍 OrderHistory: Looking up order by ID', { orderId });

    try {
      const orders = await this.getOrderHistory();
      const order = orders.find(o => o.id === orderId);

      if (order) {
        console.log('✅ OrderHistory: Order found', { orderId });
        return order;
      } else {
        console.warn('⚠️ OrderHistory: Order not found', { orderId });
        return null;
      }

    } catch (error) {
      console.error('❌ OrderHistory: Error looking up order:', error);
      return null;
    }
  }

  /**
   * Create order from payment context data
   */
  static createOrderFromPayment(paymentOrderData: any, user: any, customerInfo: any): OrderHistoryItem {
    console.log('🏗️ OrderHistory: Creating order from payment data');

    return {
      id: paymentOrderData.id,
      userId: user.id,
      userEmail: user.email,
      customerName: customerInfo.fullName || user.name || user.email.split('@')[0],
      customerPhone: customerInfo.phone || '',
      products: paymentOrderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        duration: item.duration,
        category: item.category,
        description: item.description,
        originalPrice: item.originalPrice,
        features: item.features || [],
        warranty: item.warranty || '30 ngày'
      })),
      total: paymentOrderData.total,
      originalTotal: paymentOrderData.originalTotal || paymentOrderData.total,
      discount: paymentOrderData.discount || 0,
      discountCode: paymentOrderData.discountCode,
      status: paymentOrderData.status || 'pending',
      paymentMethod: paymentOrderData.paymentMethod || 'wallet',
      paymentStatus: paymentOrderData.paymentStatus || 'pending',
      createdAt: paymentOrderData.date?.toISOString() || new Date().toISOString(),
      shippingAddress: customerInfo.address || '',
      notes: 'Order saved via enhanced JSON API system',
      transactionId: paymentOrderData.transactionId
    };
  }

  /**
   * Complete order with delivery information
   */
  static async completeOrderWithDelivery(orderId: string, accountCredentials: any[], customerEmail: string): Promise<boolean> {
    console.log('🎉 OrderHistory: Completing order with delivery info', { orderId });

    const deliveryInfo = {
      email: customerEmail,
      deliveredAt: new Date().toISOString(),
      accountCredentials
    };

    return await this.updateOrderStatus(orderId, 'completed', {
      deliveryInfo,
      paymentStatus: 'completed',
      completedAt: new Date().toISOString()
    });
  }

  /**
   * Get order statistics for user
   */
  static async getOrderStats(userId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    totalSaved: number;
    pendingOrders: number;
  }> {
    console.log('📊 OrderHistory: Calculating order statistics', { userId });

    try {
      const orders = await this.getOrderHistory(userId);

      const stats = {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        totalSpent: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + o.total, 0),
        totalSaved: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.discount || 0), 0),
        pendingOrders: orders.filter(o => 
          o.status === 'pending' || o.status === 'processing'
        ).length
      };

      console.log('✅ OrderHistory: Statistics calculated', stats);
      return stats;

    } catch (error) {
      console.error('❌ OrderHistory: Error calculating statistics:', error);
      return {
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        totalSaved: 0,
        pendingOrders: 0
      };
    }
  }

  /**
   * Broadcast order updates for real-time UI sync
   */
  private static broadcastOrderUpdate(order: OrderHistoryItem, action: 'created' | 'updated' | 'completed'): void {
    if (typeof window === 'undefined') return;

    // Primary order update event
    window.dispatchEvent(new CustomEvent('order-history-update', {
      detail: { order, action, timestamp: Date.now() }
    }));

    // Admin-specific event for dashboard updates
    window.dispatchEvent(new CustomEvent('admin-order-update', {
      detail: { 
        orderId: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        status: order.status,
        total: order.total,
        action,
        timestamp: Date.now()
      }
    }));

    // User-specific event for order list updates
    window.dispatchEvent(new CustomEvent('user-order-update', {
      detail: { 
        userId: order.userId,
        orderId: order.id,
        action,
        timestamp: Date.now()
      }
    }));

    console.log(`📡 OrderHistory: Broadcasted ${action} event for order ${order.id}`);
  }

  /**
   * Subscribe to order history updates
   */
  static subscribeToOrderUpdates(callback: (detail: any) => void): () => void {
    const handleUpdate = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('order-history-update', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('order-history-update', handleUpdate as EventListener);
    };
  }

  /**
   * Subscribe to user-specific order updates
   */
  static subscribeToUserOrderUpdates(userId: string, callback: (detail: any) => void): () => void {
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.userId === userId) {
        callback(event.detail);
      }
    };

    window.addEventListener('user-order-update', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('user-order-update', handleUpdate as EventListener);
    };
  }

  /**
   * Emergency cleanup of corrupted order data
   */
  static async cleanupCorruptedData(): Promise<boolean> {
    console.log('🧹 OrderHistory: Running cleanup of corrupted data');

    try {
      const orders = await this.getOrderHistory();
      
      // Filter out orders with missing required fields
      const validOrders = orders.filter(order => 
        order.id && 
        order.userId && 
        order.userEmail && 
        order.products && 
        Array.isArray(order.products)
      );

      if (validOrders.length !== orders.length) {
        console.log(`🧹 OrderHistory: Cleaning up ${orders.length - validOrders.length} corrupted orders`);
        
        // Save only valid orders back to API
        const response = await fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'orders',
            action: 'bulk_update',
            items: validOrders
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ OrderHistory: Cleanup completed successfully');
          return true;
        }
      } else {
        console.log('✅ OrderHistory: No corrupted data found');
        return true;
      }

    } catch (error) {
      console.error('❌ OrderHistory: Cleanup failed:', error);
    }

    return false;
  }
}

export default OrderHistoryManager;