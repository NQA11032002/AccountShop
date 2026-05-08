/**
 * Data Synchronization Helper
 * Ensures consistent data sync across all contexts, localStorage, and JSON API
 */

export class DataSyncHelper {
  private static readonly API_BASE_URL = '/api/data';

  /**
   * Fetch data from JSON API with robust error handling
   */
  static async fetchFromAPI(type?: string, retryCount = 0): Promise<any> {
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second

    try {
      const url = type ? `${this.API_BASE_URL}?type=${type}` : this.API_BASE_URL;
      console.log(`🌐 Fetching data from API: ${url} (attempt ${retryCount + 1})`);

      // Add timeout and specific fetch options
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ API fetch successful for ${type || 'all data'}`, {
          count: Array.isArray(result.data) ? result.data.length : 'N/A'
        });
        return result.data;
      } else {
        console.error('❌ API fetch failed:', result.error);
        throw new Error(result.error || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.warn(`⚠️ API fetch attempt ${retryCount + 1} failed:`, error);

      // Check if it's a network error or browser extension interference
      const isNetworkError = error instanceof TypeError && error.message.includes('Failed to fetch');
      const isAbortError = error instanceof Error && error.name === 'AbortError';

      if ((isNetworkError || isAbortError) && retryCount < maxRetries) {
        console.log(`🔄 Retrying API fetch in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.fetchFromAPI(type, retryCount + 1);
      }

      // Return appropriate fallback data
      console.log(`📝 Using fallback data due to API unavailability`);
      return type ? [] : { products: [], users: [], orders: [], customerAccounts: [] };
    }
  }

  /**
   * Save data to JSON API with error handling
   */
  static async saveToAPI(type: string, data: any[], action: 'bulk_update' | 'add' | 'update' = 'bulk_update'): Promise<boolean> {
    try {
      console.log(`💾 Saving ${type} data to API`, { count: data.length, action });

      // Validate input parameters
      if (!type || typeof type !== 'string') {
        console.error('❌ Invalid type parameter:', type);
        return false;
      }

      if (!Array.isArray(data)) {
        console.error('❌ Data must be an array:', data);
        return false;
      }

      // Prepare request body and validate JSON serialization
      const requestBody = {
        type,
        items: data,
        action
      };

      let jsonBody;
      try {
        jsonBody = JSON.stringify(requestBody);
      } catch (jsonError) {
        console.error('❌ Failed to serialize request body:', jsonError);
        return false;
      }

      if (!jsonBody || jsonBody === '{}' || jsonBody === 'null') {
        console.error('❌ Invalid JSON body produced:', jsonBody);
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ API save successful for ${type}`);
        return true;
      } else {
        console.error('❌ API save failed:', result.error);
        return false;
      }
    } catch (error) {
      console.warn(`⚠️ API save failed for ${type}:`, error);
      // Continue with localStorage sync even if API fails
      return false;
    }
  }

  /**
   * Update single item via API
   */
  static async updateItemAPI(type: string, id: string | number, item: any): Promise<boolean> {
    try {
      console.log(`🔄 Updating ${type} item via API`, { id });

      // Validate input parameters
      if (!type || !id || !item) {
        console.error('❌ Missing required parameters for update:', { type, id, item });
        return false;
      }

      const requestBody = { type, id, item };
      let jsonBody;
      try {
        jsonBody = JSON.stringify(requestBody);
      } catch (jsonError) {
        console.error('❌ Failed to serialize update body:', jsonError);
        return false;
      }

      const response = await fetch(this.API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBody,
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ API update successful for ${type} item`, { id });
        return true;
      } else {
        console.error('❌ API update failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ API update error:', error);
      return false;
    }
  }

  /**
   * Delete item via API
   */
  static async deleteItemAPI(type: string, id: string | number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting ${type} item via API`, { id });

      const response = await fetch(`${this.API_BASE_URL}?type=${type}&id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ API delete successful for ${type} item`, { id });
        return true;
      } else {
        console.error('❌ API delete failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ API delete error:', error);
      return false;
    }
  }
  /**
   * Clear all user-specific data
   */
  static clearUserData(userId: string) {
    console.log("Clearing all user data", { userId });

    const keysToRemove = [
      `qai-store-cart-${userId}`,
      `qai_favorites_${userId}`,
      `qai_orders_${userId}`,
      `qai_payment_${userId}`
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed localStorage key: ${key}`);
    });
  }

  /**
   * Validate and normalize cart data
   */
  static normalizeCartData(cartData: any[]): any[] {
    return cartData.map(item => ({
      id: Number(item.id),
      name: String(item.name || ''),
      price: Number(item.price || 0),
      originalPrice: Number(item.originalPrice || item.price || 0),
      duration: String(item.duration || ''),
      durationId: String(item.durationId || '1m'),
      quantity: Number(item.quantity || 1),
      image: String(item.image || ''),
      color: String(item.color || '#3B82F6'),
      description: String(item.description || ''),
      warranty: String(item.warranty || 'Bảo hành 30 ngày'),
      addedAt: new Date(item.addedAt || new Date())
    }));
  }

  /**
   * Validate localStorage data integrity
   */
  static validateUserData(userId: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;

    try {
      // Check cart data
      const cartData = localStorage.getItem(`qai-store-cart-${userId}`);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        if (!Array.isArray(parsedCart)) {
          errors.push('Cart data is not an array');
          isValid = false;
        }
      }

      // Check favorites data
      const favoritesData = localStorage.getItem(`qai_favorites_${userId}`);
      if (favoritesData) {
        const parsedFavorites = JSON.parse(favoritesData);
        if (!Array.isArray(parsedFavorites)) {
          errors.push('Favorites data is not an array');
          isValid = false;
        }
      }

    } catch (error) {
      errors.push(`Data parsing error: ${error}`);
      isValid = false;
    }

    return { isValid, errors };
  }

  // Removed duplicate - using enhanced version below

  /**
   * Get current data summary
   */
  static getDataSummary(userId: string) {
    const cartData = localStorage.getItem(`qai-store-cart-${userId}`);
    const favoritesData = localStorage.getItem(`qai_favorites_${userId}`);

    let cartCount = 0;
    let favoritesCount = 0;

    try {
      if (cartData) {
        const cart = JSON.parse(cartData);
        cartCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      }

      if (favoritesData) {
        const favorites = JSON.parse(favoritesData);
        favoritesCount = Array.isArray(favorites) ? favorites.length : 0;
      }
    } catch (error) {
      console.error("Error getting data summary:", error);
    }

    return { cartCount, favoritesCount };
  }

  /**
   * Sync wallet data to localStorage
   */
  static syncWalletData(userId: string, walletData: { balance: number; transactions: any[] }) {
    console.log("💰 Syncing wallet data", { userId, balance: walletData.balance, transactionCount: walletData.transactions.length });

    try {
      const walletKey = `qai-wallet-${userId}`;
      localStorage.setItem(walletKey, JSON.stringify(walletData));

      // Trigger sync event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: walletKey,
        newValue: JSON.stringify(walletData),
        storageArea: localStorage
      }));

      console.log("✅ Wallet data synced successfully");
    } catch (error) {
      console.error("❌ Error syncing wallet data:", error);
    }
  }

  /**
   * Sync admin data across different admin sections with JSON API
   */
  static async syncAdminData(dataType: 'users' | 'products' | 'orders' | 'accounts', data: any[]) {
    console.log(`🔄 Syncing admin ${dataType} data`, { count: data.length });

    try {
      // Save to JSON API first
      const apiSuccess = await this.saveToAPI(dataType, data);

      // Continue with localStorage sync for immediate reactivity
      const adminKey = `qai_user_${dataType}`;
      const timestamp = Date.now();

      const syncData = {
        data,
        timestamp,
        lastModified: new Date().toISOString(),
        apiSynced: apiSuccess
      };

      localStorage.setItem(adminKey, JSON.stringify(syncData));

      // Trigger storage event to notify all admin sections
      window.dispatchEvent(new StorageEvent('storage', {
        key: adminKey,
        newValue: JSON.stringify(syncData),
        storageArea: localStorage
      }));

      // Also trigger a general admin sync event
      window.dispatchEvent(new CustomEvent('admin-data-sync', {
        detail: { type: dataType, data, timestamp, apiSynced: apiSuccess }
      }));

      // Special handling for product sync - update user-facing product data
      if (dataType === 'products') {
        this.syncProductsToUserContext(data);
      }

      console.log(`✅ Admin ${dataType} data synced successfully`, {
        localStorage: true,
        api: apiSuccess
      });
    } catch (error) {
      console.error(`❌ Error syncing admin ${dataType} data:`, error);
    }
  }

  /**
   * Sync deposit approval/rejection from admin to user
   */
  static syncDepositApproval(depositData: {
    orderId: string;
    userId: string;
    userEmail: string;
    amount: number;
    finalAmount: number;
    status: 'approved' | 'rejected';
    methodName: string;
    bonusAmount?: number;
  }) {
    console.log(`💳 Syncing deposit ${depositData.status}:`, depositData);

    try {
      // Update the user's wallet data directly
      const userWalletKey = `qai-wallet-${depositData.userId}`;
      const userWallet = JSON.parse(localStorage.getItem(userWalletKey) || '{"balance": 0, "transactions": []}');

      if (depositData.status === 'approved') {
        // Add money to user's balance
        userWallet.balance += depositData.finalAmount;

        // Update or add transaction
        const transactionIndex = userWallet.transactions.findIndex((tx: any) => tx.id === depositData.orderId);
        if (transactionIndex !== -1) {
          userWallet.transactions[transactionIndex] = {
            ...userWallet.transactions[transactionIndex],
            amount: depositData.finalAmount,
            description: `Nạp tiền qua ${depositData.methodName}${depositData.bonusAmount ? ` (Bonus: +${depositData.bonusAmount.toLocaleString('vi-VN')} coins)` : ''}`,
            status: 'completed'
          };
        } else {
          // Add new transaction if not found
          userWallet.transactions.unshift({
            id: depositData.orderId,
            type: 'deposit',
            amount: depositData.finalAmount,
            description: `Nạp tiền qua ${depositData.methodName}${depositData.bonusAmount ? ` (Bonus: +${depositData.bonusAmount.toLocaleString('vi-VN')} coins)` : ''}`,
            date: new Date().toISOString(),
            status: 'completed',
            paymentMethod: depositData.methodName,
            orderId: depositData.orderId
          });
        }
      } else if (depositData.status === 'rejected') {
        // Update transaction to failed status
        const transactionIndex = userWallet.transactions.findIndex((tx: any) => tx.id === depositData.orderId);
        if (transactionIndex !== -1) {
          userWallet.transactions[transactionIndex] = {
            ...userWallet.transactions[transactionIndex],
            status: 'failed',
            description: `Nạp tiền qua ${depositData.methodName} bị từ chối`
          };
        }
      }

      // Save updated wallet data
      localStorage.setItem(userWalletKey, JSON.stringify(userWallet));

      // Trigger storage event for real-time sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: userWalletKey,
        newValue: JSON.stringify(userWallet),
        storageArea: localStorage
      }));

      // Trigger custom wallet sync event
      window.dispatchEvent(new CustomEvent('wallet-sync', {
        detail: { userId: depositData.userId, walletData: userWallet }
      }));

      // Trigger custom deposit sync event
      window.dispatchEvent(new CustomEvent('deposit-sync', {
        detail: depositData
      }));

      console.log(`✅ Deposit ${depositData.status} synced for user: ${depositData.userEmail}`, {
        orderId: depositData.orderId,
        newBalance: userWallet.balance
      });

    } catch (error) {
      console.error(`❌ Error syncing deposit ${depositData.status}:`, error);
    }
  }

  /**
   * Load admin data with JSON API integration and localStorage fallback
   */
  static async loadAdminData(dataType: 'users' | 'products' | 'orders' | 'accounts', forceAPI = false): Promise<any[]> {
    console.log(`📥 Loading admin ${dataType} data`, { forceAPI });

    try {
      // Try API first if forced or localStorage is stale/empty
      const adminKey = `qai_user_${dataType}`;
      const stored = localStorage.getItem(adminKey);
      let shouldFetchFromAPI = forceAPI;

      if (!shouldFetchFromAPI && stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (parsedData.data && parsedData.timestamp) {
            // Check if data is stale (older than 5 minutes)
            const age = Date.now() - parsedData.timestamp;
            shouldFetchFromAPI = age > 5 * 60 * 1000;
          } else {
            shouldFetchFromAPI = true; // Legacy format, fetch fresh
          }
        } catch {
          shouldFetchFromAPI = true; // Corrupt data, fetch fresh
        }
      } else {
        shouldFetchFromAPI = true; // No stored data
      }

      if (shouldFetchFromAPI) {
        console.log(`🌐 Fetching ${dataType} from API`);
        const apiData = await this.fetchFromAPI(dataType);

        if (Array.isArray(apiData) && apiData.length > 0) {
          // Save to localStorage for faster subsequent access
          const syncData = {
            data: apiData,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            apiSynced: true
          };
          localStorage.setItem(adminKey, JSON.stringify(syncData));

          console.log(`✅ Loaded ${dataType} from API`, { count: apiData.length });
          return apiData;
        }
      }

      // Fallback to localStorage
      if (stored) {
        const parsedData = JSON.parse(stored);

        if (parsedData.data && parsedData.timestamp) {
          console.log(`💾 Loaded ${dataType} from localStorage`, {
            count: parsedData.data.length,
            lastModified: parsedData.lastModified
          });
          return parsedData.data;
        } else {
          console.log(`⚡ Loaded legacy ${dataType} data`, { count: parsedData.length });
          return parsedData;
        }
      }

      console.log(`📝 No ${dataType} data found, returning empty array`);
      return [];
    } catch (error) {
      console.error(`❌ Error loading admin ${dataType} data:`, error);
      return [];
    }
  }

  /**
   * Check if admin data is stale and needs refresh
   */
  static isAdminDataStale(dataType: 'users' | 'products' | 'orders' | 'accounts', maxAgeMinutes: number = 30): boolean {
    try {
      const adminKey = `qai_user_${dataType}`;
      const stored = localStorage.getItem(adminKey);

      if (!stored) return true;

      const parsedData = JSON.parse(stored);
      if (!parsedData.timestamp) return true;

      const now = Date.now();
      const age = now - parsedData.timestamp;
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

      return age > maxAge;
    } catch (error) {
      console.error(`Error checking ${dataType} data staleness:`, error);
      return true;
    }
  }

  /**
   * Subscribe to wallet sync events for specific user
   */
  static subscribeToWalletSync(userId: string, callback: (walletData: any) => void) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `qai-wallet-${userId}` && e.newValue) {
        try {
          const walletData = JSON.parse(e.newValue);
          callback(walletData);
        } catch (error) {
          console.error('Error parsing wallet sync data:', error);
        }
      }
    };

    const handleCustomWalletSync = (e: CustomEvent) => {
      if (e.detail.userId === userId) {
        callback(e.detail.walletData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wallet-sync', handleCustomWalletSync as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallet-sync', handleCustomWalletSync as EventListener);
    };
  }

  /**
   * Subscribe to deposit sync events
   */
  static subscribeToDepositSync(callback: (depositData: any) => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('deposit-sync', handler as EventListener);

    return () => {
      window.removeEventListener('deposit-sync', handler as EventListener);
    };
  }

  // Removed duplicate - using enhanced version below

  /**
   * Update customer ranking based on purchase history (compatible with PaymentContext)
   */
  static async updateCustomerRanking(customerEmail: string, orderTotal: number, itemCount: number): Promise<void> {
    console.log(`📊 Updating customer ranking:`, { customerEmail, orderTotal, itemCount });

    try {
      // Load existing rankings from JSON API
      const apiRankings = await this.fetchFromAPI('userRankings');

      // Find or create customer ranking record
      let rankingRecord = Array.isArray(apiRankings) ?
        apiRankings.find((r: any) => r.userEmail === customerEmail || r.userId === customerEmail) : null;

      if (!rankingRecord) {
        // Create new ranking record
        rankingRecord = {
          id: `rank_${Date.now()}`,
          userId: customerEmail.split('@')[0],
          userEmail: customerEmail,
          rank: 'bronze',
          points: this.calculateRankingPoints(orderTotal, itemCount),
          totalSpent: orderTotal,
          totalOrders: 1,
          joinDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          nextRankPoints: 300,
          rewards: []
        };

        await this.saveToAPI('userRankings', [rankingRecord], 'add');
      } else {
        // Update existing ranking
        const pointsEarned = this.calculateRankingPoints(orderTotal, itemCount);
        rankingRecord.points = (rankingRecord.points || 0) + pointsEarned;
        rankingRecord.totalSpent = (rankingRecord.totalSpent || 0) + orderTotal;
        rankingRecord.totalOrders = (rankingRecord.totalOrders || 0) + 1;
        rankingRecord.lastUpdated = new Date().toISOString();

        // Update rank based on new totals
        rankingRecord.rank = this.determineCustomerRank(rankingRecord.totalSpent, rankingRecord.totalOrders);

        // Update via API
        await this.saveUserData(rankingRecord.userId, 'userRankings', rankingRecord, 'update');
      }

      console.log(`✅ Customer ranking updated:`, {
        customerEmail,
        newRank: rankingRecord.rank,
        totalSpent: rankingRecord.totalSpent,
        totalOrders: rankingRecord.totalOrders,
        points: rankingRecord.points
      });

    } catch (error) {
      console.error(`❌ Error updating customer ranking:`, error);
    }
  }

  /**
   * Calculate ranking points based on order value and items
   * Updated: Buy 200k = 100 points
   */
  static calculateRankingPoints(orderTotal: number, itemCount: number): number {
    // Base points: 1 point per 2000 VND spent (200k = 100 points)
    const basePoints = Math.floor(orderTotal / 2000);

    // Bonus points: 10 points per item purchased
    const itemBonus = itemCount * 10;

    // Volume bonus: extra points for large orders
    let volumeBonus = 0;
    if (orderTotal >= 1000000) volumeBonus = 100; // 1M+ VND
    else if (orderTotal >= 500000) volumeBonus = 50; // 500K+ VND
    else if (orderTotal >= 200000) volumeBonus = 20; // 200K+ VND

    const totalPoints = basePoints + itemBonus + volumeBonus;
    console.log(`💰 Calculated ranking points:`, {
      orderTotal,
      itemCount,
      basePoints,
      itemBonus,
      volumeBonus,
      totalPoints
    });

    return totalPoints;
  }

  /**
   * Update customer points (for spending/earning points)
   */
  static updateCustomerPoints(customerEmail: string, pointsChange: number, reason: string) {
    console.log("💎 Updating customer points", { customerEmail, pointsChange, reason });

    try {
      // Get current points
      const currentPointsKey = `qai_customer_points_${customerEmail}`;
      const currentPoints = parseInt(localStorage.getItem(currentPointsKey) || '0');
      const newTotalPoints = Math.max(0, currentPoints + pointsChange); // Don't allow negative points

      // Save updated points
      localStorage.setItem(currentPointsKey, newTotalPoints.toString());

      // Save point transaction history
      const historyKey = `qai_point_history_${customerEmail}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift({
        type: pointsChange > 0 ? 'earned' : 'spent',
        points: Math.abs(pointsChange),
        reason: reason,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));

      console.log("✅ Customer points updated", {
        customerEmail,
        pointsChange,
        newTotalPoints,
        reason
      });

      // Broadcast points update
      window.dispatchEvent(new CustomEvent('customerPointsUpdated', {
        detail: { customerEmail, pointsChange, newTotalPoints, reason }
      }));
    } catch (error) {
      console.error("❌ Error updating customer points:", error);
    }
  }

  /**
   * Determine customer rank based on spending and order history
   */
  static determineCustomerRank(totalSpent: number, totalOrders: number): string {
    // Diamond: 15M+ VND, 50+ orders
    if (totalSpent >= 15000000 && totalOrders >= 50) return 'diamond';

    // Platinum: 5M+ VND, 20+ orders  
    if (totalSpent >= 5000000 && totalOrders >= 20) return 'platinum';

    // Gold: 1.5M+ VND, 8+ orders
    if (totalSpent >= 1500000 && totalOrders >= 8) return 'gold';

    // Silver: 500K+ VND, 3+ orders
    if (totalSpent >= 500000 && totalOrders >= 3) return 'silver';

    // Bronze: default
    return 'bronze';
  }

  /**
   * Subscribe to order completion events
   */
  static subscribeToOrderCompletion(callback: (orderData: any) => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('order-completion-sync', handler as EventListener);

    return () => {
      window.removeEventListener('order-completion-sync', handler as EventListener);
    };
  }

  /**
   * Subscribe to customer ranking updates
   */
  static subscribeToRankingUpdates(callback: (updateData: any) => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('customer-ranking-update', handler as EventListener);

    return () => {
      window.removeEventListener('customer-ranking-update', handler as EventListener);
    };
  }

  /**
   * Subscribe to admin data changes
   */
  static subscribeToAdminChanges(callback: (type: string, data: any[]) => void) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('qai_user_')) {
        const dataType = e.key.replace('qai_user_', '');
        try {
          if (e.newValue) {
            const parsedData = JSON.parse(e.newValue);
            const data = parsedData.data || parsedData;
            callback(dataType, data);
          }
        } catch (error) {
          console.error('Error parsing admin sync data:', error);
        }
      }
    };

    const handleCustomSync = (e: CustomEvent) => {
      callback(e.detail.type, e.detail.data);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin-data-sync', handleCustomSync as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-data-sync', handleCustomSync as EventListener);
    };
  }

  /**
   * Sync user order data across all parts of website
   */
  static syncUserOrderData(userId: string, orderData: any) {
    console.log(`📋 Syncing user order data:`, { userId, orderId: orderData.orderId });

    try {
      // Update user's order list
      const userOrdersKey = `qai_orders_${userId}`;
      const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');

      // Find and update existing order or add new one
      const orderIndex = userOrders.findIndex((order: any) => order.id === orderData.orderId);
      if (orderIndex !== -1) {
        userOrders[orderIndex].status = 'completed';
        userOrders[orderIndex].paymentStatus = 'completed';
      }

      localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));

      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: userOrdersKey,
        newValue: JSON.stringify(userOrders),
        storageArea: localStorage
      }));

      console.log(`✅ User order data synced for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Error syncing user order data:`, error);
    }
  }

  /**
   * Update order statistics
   */
  static updateOrderStatistics(orderData: any) {
    console.log(`📊 Updating order statistics:`, orderData);

    try {
      const statsKey = 'qai_order_statistics';
      const stats = JSON.parse(localStorage.getItem(statsKey) || '{}');

      // Update statistics
      stats.totalOrdersCompleted = (stats.totalOrdersCompleted || 0) + 1;
      stats.totalRevenue = (stats.totalRevenue || 0) + orderData.total;
      stats.lastOrderDate = orderData.completedAt;
      stats.totalCustomers = new Set([...(stats.totalCustomers || []), orderData.userEmail]).size;

      localStorage.setItem(statsKey, JSON.stringify(stats));

      // Broadcast statistics update
      window.dispatchEvent(new CustomEvent('order-statistics-update', {
        detail: stats
      }));

      console.log(`✅ Order statistics updated:`, stats);
    } catch (error) {
      console.error(`❌ Error updating order statistics:`, error);
    }
  }

  /**
   * Force refresh all order-related data
   */
  static forceOrderRefresh(userId: string) {
    console.log(`🔄 Force refreshing order data for user: ${userId}`);

    // Trigger refresh events
    window.dispatchEvent(new CustomEvent('force-order-refresh', {
      detail: { userId }
    }));

    // Update timestamp to trigger reactivity
    const refreshKey = `qai_order_refresh_${userId}`;
    localStorage.setItem(refreshKey, Date.now().toString());

    window.dispatchEvent(new StorageEvent('storage', {
      key: refreshKey,
      newValue: Date.now().toString(),
      storageArea: localStorage
    }));
  }

  /**
   * Subscribe to global order sync events
   */
  static subscribeToGlobalOrderSync(callback: (eventData: any) => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('global-order-sync', handler as EventListener);
    window.addEventListener('force-order-refresh', handler as EventListener);

    return () => {
      window.removeEventListener('global-order-sync', handler as EventListener);
      window.removeEventListener('force-order-refresh', handler as EventListener);
    };
  }

  /**
   * Sync products from admin to user-facing components
   */
  static syncProductsToUserContext(adminProducts: any[]) {
    console.log(`🛍️ Syncing products to user context:`, { count: adminProducts.length });

    try {
      // Transform admin product format to user product format
      const userProducts = adminProducts.map((adminProduct: any) => ({
        id: adminProduct.id,
        name: adminProduct.name,
        category: adminProduct.category,
        description: adminProduct.description || `${adminProduct.name} - Dịch vụ chất lượng cao`,
        price: adminProduct.price,
        originalPrice: adminProduct.originalPrice,
        rating: adminProduct.rating || 4.8,
        reviews: adminProduct.sales || Math.floor(Math.random() * 500) + 100,
        image: this.getCategoryIcon(adminProduct.category),
        color: this.getCategoryColor(adminProduct.category),
        badge: adminProduct.status === 'active' ? 'Còn hàng' : 'Hết hàng',
        badgeColor: adminProduct.status === 'active' ? 'bg-green-500' : 'bg-red-500',
        features: [
          'Chất lượng cao cấp',
          'Bảo hành 30 ngày',
          'Hỗ trợ 24/7',
          'Giao hàng tức thì'
        ],
        inStock: adminProduct.status === 'active' && (adminProduct.stock || 0) > 0,
        warranty: '30 ngày',
        duration: '1 tháng'
      }));

      // Save to user products storage
      const userProductsKey = 'qai_user_products';
      const userSyncData = {
        data: userProducts,
        timestamp: Date.now(),
        lastModified: new Date().toISOString()
      };

      localStorage.setItem(userProductsKey, JSON.stringify(userSyncData));

      // Trigger user product sync events
      window.dispatchEvent(new StorageEvent('storage', {
        key: userProductsKey,
        newValue: JSON.stringify(userSyncData),
        storageArea: localStorage
      }));

      window.dispatchEvent(new CustomEvent('user-products-sync', {
        detail: { products: userProducts, timestamp: Date.now() }
      }));

      console.log(`✅ Products synced to user context successfully`);
    } catch (error) {
      console.error(`❌ Error syncing products to user context:`, error);
    }
  }

  /**
   * Get category icon for product
   */
  static getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Streaming': '🎬',
      'Music': '🎵',
      'AI Tools': '🤖',
      'Design': '🎨',
      'Productivity': '💼',
      'Gaming': '🎮',
      'Cloud Storage': '☁️',
      'Education': '📚',
      'entertainment': '📺',
      'music': '🎵',
      'ai': '🤖',
      'design': '🎨',
      'productivity': '📊',
      'education': '🎓'
    };
    return iconMap[category] || '📦';
  }

  /**
   * Get category color for product
   */
  static getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'Streaming': 'bg-red-600',
      'Music': 'bg-green-500',
      'AI Tools': 'bg-purple-600',
      'Design': 'bg-blue-500',
      'Productivity': 'bg-gray-700',
      'Gaming': 'bg-indigo-600',
      'Cloud Storage': 'bg-cyan-500',
      'Education': 'bg-emerald-600',
      'entertainment': 'bg-red-500',
      'music': 'bg-green-600',
      'ai': 'bg-purple-600',
      'design': 'bg-blue-500',
      'productivity': 'bg-gray-700',
      'education': 'bg-emerald-600'
    };
    return colorMap[category] || 'bg-gray-500';
  }

  /**
   * Load user products with robust fallback mechanisms
   */
  static async loadUserProducts(): Promise<any[]> {
    console.log(`📥 Loading user products with multiple fallback options`);

    try {
      // 1st priority: Try to load from localStorage cache first (faster)
      const userProductsKey = 'qai_user_products';
      const stored = localStorage.getItem(userProductsKey);

      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (parsedData.data && parsedData.timestamp) {
            // Check if cache is fresh (less than 5 minutes old)
            const age = Date.now() - parsedData.timestamp;
            if (age < 5 * 60 * 1000) {
              console.log(`⚡ Using fresh cached products`, { count: parsedData.data.length });

              // Asynchronously try to update from API in background
              this.updateProductsInBackground();

              return parsedData.data;
            }
          }
        } catch (error) {
          console.warn('Cache data corrupted, clearing:', error);
          localStorage.removeItem(userProductsKey);
        }
      }

      // 2nd priority: Try JSON API
      try {
        const apiProducts = await this.fetchFromAPI('products');

        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          console.log(`🌐 Loaded products from JSON API`, { count: apiProducts.length });

          // Transform and cache for user context
          const userProducts = this.transformProductsForUser(apiProducts);

          const userSyncData = {
            data: userProducts,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            apiSynced: true
          };

          localStorage.setItem(userProductsKey, JSON.stringify(userSyncData));

          // Trigger sync event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('user-products-sync', {
              detail: { products: userProducts, timestamp: Date.now() }
            }));
          }

          return userProducts;
        }
      } catch (apiError) {
        console.warn('API fetch failed, trying fallback sources:', apiError);
      }

      // 3rd priority: Use stale cache if available
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (parsedData.data && Array.isArray(parsedData.data)) {
            console.log(`🕰️ Using stale cached products`, { count: parsedData.data.length });
            return parsedData.data;
          }
        } catch (error) {
          console.warn('Stale cache corrupted:', error);
        }
      }

      // 4th priority: Try admin products from localStorage
      try {
        const adminProducts = await this.loadAdminData('products');
        if (adminProducts.length > 0) {
          console.log(`🔄 Loading from admin localStorage`, { count: adminProducts.length });
          const userProducts = this.transformProductsForUser(adminProducts);

          // Cache the transformed products
          const userSyncData = {
            data: userProducts,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            apiSynced: false
          };

          localStorage.setItem(userProductsKey, JSON.stringify(userSyncData));
          return userProducts;
        }
      } catch (adminError) {
        console.warn('Admin data loading failed:', adminError);
      }

      console.log(`📝 No products found from any source, returning empty array`);
      return [];
    } catch (error) {
      console.error(`❌ Critical error loading user products:`, error);
      return [];
    }
  }

  /**
   * Load user data from JSON API with caching and fallback
   */
  static async loadUserData(userId: string, dataType: string): Promise<any[]> {
    console.log(`👤 Loading ${dataType} for user ${userId}`);

    try {
      const cacheKey = `qai_user_${dataType}_${userId}`;
      const stored = localStorage.getItem(cacheKey);

      // Check fresh cache first
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (parsedData.data && parsedData.timestamp) {
            const age = Date.now() - parsedData.timestamp;
            if (age < 2 * 60 * 1000) { // 2 minutes for user data
              console.log(`⚡ Using fresh cached ${dataType}`, { count: parsedData.data.length });
              this.updateUserDataInBackground(userId, dataType);
              return parsedData.data;
            }
          }
        } catch (error) {
          console.warn(`Cache corrupted for ${dataType}:`, error);
          localStorage.removeItem(cacheKey);
        }
      }

      // Try JSON API
      try {
        const apiData = await this.fetchFromAPI(dataType);

        if (Array.isArray(apiData)) {
          // Filter by userId if applicable
          const userData = apiData.filter((item: any) =>
            item.userId === userId || item.id === userId
          );

          console.log(`🌐 Loaded ${dataType} from API`, { count: userData.length });

          // Cache the data
          const cacheData = {
            data: userData,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            apiSynced: true
          };

          localStorage.setItem(cacheKey, JSON.stringify(cacheData));

          // Trigger sync event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(`user-${dataType}-sync`, {
              detail: { data: userData, userId, timestamp: Date.now() }
            }));
          }

          return userData;
        }
      } catch (apiError) {
        console.warn(`API fetch failed for ${dataType}:`, apiError);
      }

      // Use stale cache as fallback
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (parsedData.data && Array.isArray(parsedData.data)) {
            console.log(`🕰️ Using stale cached ${dataType}`, { count: parsedData.data.length });
            return parsedData.data;
          }
        } catch (error) {
          console.warn(`Stale cache corrupted for ${dataType}:`, error);
        }
      }

      console.log(`📝 No ${dataType} found for user ${userId}`);
      return [];
    } catch (error) {
      console.error(`❌ Error loading ${dataType} for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Save user data to JSON API and cache
   */
  static async saveUserData(userId: string, dataType: string, data: any, action: 'add' | 'update' | 'delete' = 'add'): Promise<boolean> {
    console.log(`💾 Saving ${dataType} for user ${userId}`, { action, data });

    try {
      // Prepare data for API
      const dataWithUserId = { ...data, userId };

      let success = false;

      if (action === 'add') {
        success = await this.saveToAPI(dataType, [dataWithUserId], 'add');
      } else if (action === 'update') {
        // For update, use PUT endpoint
        const updateBody = {
          type: dataType,
          id: data.id,
          item: dataWithUserId
        };

        let jsonBody;
        try {
          jsonBody = JSON.stringify(updateBody);
        } catch (jsonError) {
          console.error('❌ Failed to serialize update body:', jsonError);
          return false;
        }

        const response = await fetch(this.API_BASE_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: jsonBody
        });
        const result = await response.json();
        success = result.success;
      } else if (action === 'delete') {
        // For delete, use DELETE endpoint
        const response = await fetch(`${this.API_BASE_URL}?type=${dataType}&id=${data.id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        success = result.success;
      }

      if (success) {
        // Update local cache
        const cacheKey = `qai_user_${dataType}_${userId}`;
        const currentData = await this.loadUserData(userId, dataType);

        let updatedData;
        if (action === 'add') {
          updatedData = [...currentData, dataWithUserId];
        } else if (action === 'update') {
          updatedData = currentData.map((item: any) =>
            item.id === data.id ? { ...item, ...dataWithUserId } : item
          );
        } else if (action === 'delete') {
          updatedData = currentData.filter((item: any) => item.id !== data.id);
        }

        const cacheData = {
          data: updatedData,
          timestamp: Date.now(),
          lastModified: new Date().toISOString(),
          apiSynced: true
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        // Trigger sync event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(`user-${dataType}-sync`, {
            detail: { data: updatedData, userId, timestamp: Date.now(), action }
          }));
        }

        console.log(`✅ Successfully saved ${dataType} for user ${userId}`);
        return true;
      } else {
        console.warn(`⚠️ API save failed for ${dataType}, updating cache only`);
        // Still update cache for offline functionality
        return this.updateLocalUserData(userId, dataType, data, action);
      }
    } catch (error) {
      console.error(`❌ Error saving ${dataType} for user ${userId}:`, error);
      // Fallback to local storage only
      return this.updateLocalUserData(userId, dataType, data, action);
    }
  }

  /**
   * Update local user data cache only
   */
  private static updateLocalUserData(userId: string, dataType: string, data: any, action: 'add' | 'update' | 'delete'): boolean {
    try {
      const cacheKey = `qai_user_${dataType}_${userId}`;
      const stored = localStorage.getItem(cacheKey);

      let currentData: any[] = [];
      if (stored) {
        const parsedData = JSON.parse(stored);
        currentData = parsedData.data || [];
      }

      const dataWithUserId = { ...data, userId };
      let updatedData: any[];

      if (action === 'add') {
        updatedData = [...currentData, dataWithUserId];
      } else if (action === 'update') {
        updatedData = currentData.map((item: any) =>
          item.id === data.id ? { ...item, ...dataWithUserId } : item
        );
      } else if (action === 'delete') {
        updatedData = currentData.filter((item: any) => item.id !== data.id);
      } else {
        updatedData = currentData;
      }

      const cacheData = {
        data: updatedData,
        timestamp: Date.now(),
        lastModified: new Date().toISOString(),
        apiSynced: false
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));

      console.log(`💾 Updated local ${dataType} cache for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating local ${dataType} for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Sync order creation across the website
   */
  static async syncOrderCreation(orderData: any): Promise<boolean> {
    console.log(`📦 Syncing order creation`, { orderId: orderData.orderId });

    try {
      // Save order to JSON API
      const apiOrder = {
        id: orderData.orderId,
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        customerName: orderData.customerName,
        total: orderData.total,
        status: orderData.status,
        paymentMethod: orderData.paymentMethod,
        createdAt: orderData.createdAt,
        date: orderData.createdAt,
        products: orderData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          duration: item.duration
        })),
        shippingAddress: orderData.shippingAddress || '',
        notes: orderData.notes || ''
      };

      const success = await this.saveToAPI('orders', [apiOrder], 'add');

      // Trigger sync event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('order-created', {
          detail: { orderData: apiOrder, timestamp: Date.now() }
        }));
      }

      console.log(`✅ Order creation synchronized`, { orderId: orderData.orderId, apiSynced: success });
      return success;
    } catch (error) {
      console.error(`❌ Failed to sync order creation:`, error);
      return false;
    }
  }

  /**
   * Sync order status updates across the website
   */
  static async syncOrderStatusUpdate(statusData: any): Promise<boolean> {
    console.log(`📝 Syncing order status update`, { orderId: statusData.orderId, status: statusData.status });

    try {
      // Update order status in JSON API
      const updateData = {
        status: statusData.status,
        updatedAt: statusData.updatedAt || new Date().toISOString()
      };

      const success = await this.updateOrderInAPI(statusData.orderId, updateData);

      // Trigger sync event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('order-status-updated', {
          detail: { statusData, timestamp: Date.now() }
        }));
      }

      console.log(`✅ Order status update synchronized`, { orderId: statusData.orderId, status: statusData.status });
      return success;
    } catch (error) {
      console.error(`❌ Failed to sync order status update:`, error);
      return false;
    }
  }

  /**
   * Sync order completion across the website (enhanced version)
   */
  static async syncOrderCompletion(completionData: any): Promise<boolean> {
    console.log(`🎉 Syncing order completion across website and admin`, { orderId: completionData.orderId });

    try {
      // Save completed order directly to JSON API for immediate admin visibility
      if (completionData.fullOrderData) {
        const orderSaveSuccess = await this.saveToAPI('orders', [completionData.fullOrderData], 'bulk_update');
        console.log("📊 Order completion saved to admin API:", { success: orderSaveSuccess });
      }

      // Update order with completion details in JSON API
      const updateSuccess = await this.updateOrderInAPI(completionData.orderId, {
        status: 'completed',
        paymentStatus: 'completed',
        completedAt: completionData.completedAt,
        deliveryInfo: {
          deliveredAt: completionData.completedAt,
          email: completionData.userEmail,
          accountCredentials: completionData.accountCredentials
        }
      });

      // Update customer accounts for admin dashboard
      if (completionData.accountCredentials) {
        await this.syncCustomerAccounts(completionData);
      }

      // Broadcast order completion event to all tabs and admin dashboard
      if (typeof window !== 'undefined') {
        // Primary order completion event
        window.dispatchEvent(new CustomEvent('order-completed', {
          detail: { completionData, timestamp: Date.now() }
        }));

        // Admin-specific order completion event for real-time dashboard updates
        window.dispatchEvent(new CustomEvent('admin-order-completed', {
          detail: {
            orderId: completionData.orderId,
            userId: completionData.userId,
            userEmail: completionData.userEmail,
            total: completionData.total,
            status: 'completed',
            completedAt: completionData.completedAt,
            orderData: completionData.fullOrderData
          }
        }));

        // Store completion data for cross-tab communication and admin sync
        localStorage.setItem(`qai_order_completion_${completionData.orderId}`, JSON.stringify({
          ...completionData,
          timestamp: Date.now(),
          syncedToAdmin: true
        }));

        // Trigger immediate admin data refresh
        localStorage.setItem('qai_user_refresh', JSON.stringify({
          type: 'order_completion',
          orderId: completionData.orderId,
          timestamp: Date.now()
        }));

        // Clean up old completion events (older than 1 hour)
        setTimeout(() => {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('qai_order_completion_')) {
              try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                if (data.timestamp && Date.now() - data.timestamp > 60 * 60 * 1000) {
                  localStorage.removeItem(key);
                }
              } catch (error) {
                localStorage.removeItem(key);
              }
            }
          });
        }, 100);
      }

      console.log(`✅ Order completion synchronized across all platforms`, {
        orderId: completionData.orderId,
        apiUpdated: updateSuccess
      });
      return updateSuccess;
    } catch (error) {
      console.error(`❌ Failed to sync order completion:`, error);
      return false;
    }
  }

  /**
   * Update order in JSON API
   */
  private static async updateOrderInAPI(orderId: string, updateData: any): Promise<boolean> {
    try {
      if (!orderId || !updateData) {
        console.error('❌ Missing orderId or updateData:', { orderId, updateData });
        return false;
      }

      const requestBody = {
        type: 'orders',
        id: orderId,
        item: updateData
      };

      let jsonBody;
      try {
        jsonBody = JSON.stringify(requestBody);
      } catch (jsonError) {
        console.error('❌ Failed to serialize order update body:', jsonError);
        return false;
      }

      const response = await fetch(this.API_BASE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error(`❌ Failed to update order in API:`, error);
      return false;
    }
  }

  /**
   * Sync customer accounts from order completion
   */
  private static async syncCustomerAccounts(completionData: any): Promise<boolean> {
    try {
      const customerAccounts = completionData.accountCredentials.map((account: any) => ({
        id: `acc_${completionData.orderId}_${account.itemId}`,
        accountEmail: account.credentials.email,
        accountPassword: account.credentials.password,
        customerName: completionData.customerName,
        customerEmail: completionData.userEmail,
        customerPhone: '',
        productType: account.itemName,
        productIcon: account.credentials.icon || '📦',
        productColor: account.credentials.color || 'bg-blue-500',
        purchaseDate: completionData.completedAt,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        status: 'active',
        link: account.credentials.link || '',
        orderId: completionData.orderId,
        duration: account.credentials.duration || '1 năm',
        purchasePrice: completionData.total,
        totalSpent: completionData.total,
        totalOrders: 1,
        currentRank: 'bronze'
      }));

      const success = await this.saveToAPI('customerAccounts', customerAccounts, 'add');
      console.log(`✅ Customer accounts synchronized`, { count: customerAccounts.length });
      return success;
    } catch (error) {
      console.error(`❌ Failed to sync customer accounts:`, error);
      return false;
    }
  }

  /**
   * Force sync all user data across contexts
   */
  static async forceSync(userId: string): Promise<void> {
    console.log(`🔄 Force syncing all data for user ${userId}`);

    try {
      // Trigger sync events for all user data types
      const dataTypes = ['orders', 'userFavorites', 'userCarts', 'userWallets', 'userRankings'];

      for (const dataType of dataTypes) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(`user-${dataType}-sync`, {
            detail: { userId, timestamp: Date.now(), forceRefresh: true }
          }));
        }
      }

      console.log(`✅ Force sync completed for user ${userId}`);
    } catch (error) {
      console.error(`❌ Force sync failed for user ${userId}:`, error);
    }
  }

  /**
   * Update products in background without blocking UI
   */
  private static updateProductsInBackground() {
    setTimeout(async () => {
      try {
        const apiProducts = await this.fetchFromAPI('products');
        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          const userProducts = this.transformProductsForUser(apiProducts);
          const userSyncData = {
            data: userProducts,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            apiSynced: true
          };

          localStorage.setItem('qai_user_products', JSON.stringify(userSyncData));
          console.log(`🔄 Background update completed`, { count: userProducts.length });
        }
      } catch (error) {
        console.debug('Background update failed (non-critical):', error);
      }
    }, 100);
  }

  /**
   * Update user data in background without blocking UI
   */
  private static updateUserDataInBackground(userId: string, dataType: string) {
    setTimeout(async () => {
      try {
        const apiData = await this.fetchFromAPI(dataType);
        if (Array.isArray(apiData)) {
          const userData = apiData.filter((item: any) =>
            item.userId === userId || item.id === userId
          );

          const cacheKey = `qai_user_${dataType}_${userId}`;
          const cacheData = {
            data: userData,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            apiSynced: true
          };

          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          console.log(`🔄 Background ${dataType} update completed for user ${userId}`, { count: userData.length });
        }
      } catch (error) {
        console.debug(`Background ${dataType} update failed (non-critical):`, error);
      }
    }, 150);
  }

  /**
   * Transform admin products to user-friendly format
   */
  static transformProductsForUser(adminProducts: any[]): any[] {
    return adminProducts.map((adminProduct: any) => ({
      id: adminProduct.id,
      name: adminProduct.name,
      category: adminProduct.category,
      description: adminProduct.description || `${adminProduct.name} - Dịch vụ chất lượng cao`,
      price: adminProduct.price,
      originalPrice: adminProduct.originalPrice,
      rating: adminProduct.rating || 4.8,
      reviews: adminProduct.reviews || adminProduct.sales || Math.floor(Math.random() * 500) + 100,
      image: adminProduct.image || this.getCategoryIcon(adminProduct.category),
      color: adminProduct.color || this.getCategoryColor(adminProduct.category),
      badge: adminProduct.badge || (adminProduct.status === 'active' ? 'Còn hàng' : 'Hết hàng'),
      badgeColor: adminProduct.badgeColor || (adminProduct.status === 'active' ? 'bg-green-500' : 'bg-red-500'),
      features: adminProduct.features || [
        'Chất lượng cao cấp',
        'Bảo hành 30 ngày',
        'Hỗ trợ 24/7',
        'Giao hàng tức thì'
      ],
      inStock: adminProduct.inStock !== undefined ? adminProduct.inStock : (adminProduct.status === 'active' && (adminProduct.stock || 0) > 0),
      warranty: adminProduct.warranty || '30 ngày',
      duration: adminProduct.duration || '1 tháng',
      durations: adminProduct.durations || [
        {
          id: '1m',
          name: '1 tháng',
          price: adminProduct.price,
          originalPrice: adminProduct.originalPrice
        }
      ]
    }));
  }

  /**
   * Enhanced cart deletion sync across all website components
   */
  static syncCartDeletion(userId: string, deletedItem: any, updatedCart: any[]) {
    console.log("🗑️ DataSyncHelper: Syncing cart deletion across website", {
      userId,
      deletedItem: deletedItem.name,
      cartSizeAfter: updatedCart.length
    });

    try {
      // Update localStorage immediately
      const cartKey = `qai-store-cart-${userId}`;
      const cartData = {
        items: updatedCart,
        lastModified: Date.now(),
        lastAction: 'delete',
        deletedItem: {
          id: deletedItem.id,
          name: deletedItem.name,
          deletedAt: new Date().toISOString()
        }
      };
      localStorage.setItem(cartKey, JSON.stringify(cartData));

      // Trigger cross-tab synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: cartKey,
          newValue: JSON.stringify(cartData),
          storageArea: localStorage
        }));

        // Broadcast to all components
        window.dispatchEvent(new CustomEvent('global-cart-deletion', {
          detail: {
            userId,
            deletedItem,
            updatedCart,
            timestamp: Date.now()
          }
        }));

        // Update header cart count immediately
        window.dispatchEvent(new CustomEvent('header-cart-update', {
          detail: {
            userId,
            newCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
            action: 'delete'
          }
        }));
      }

      console.log("✅ Cart deletion synced across all website components");
    } catch (error) {
      console.error("❌ Error syncing cart deletion:", error);
    }
  }

  /**
   * Enhanced cart clearance sync across all website components
   */
  static syncCartClearance(userId: string, clearedItems: any[]) {
    console.log("🧹 DataSyncHelper: Syncing cart clearance across website", {
      userId,
      clearedItemsCount: clearedItems.length
    });

    try {
      // Clear localStorage
      const cartKey = `qai-store-cart-${userId}`;
      localStorage.removeItem(cartKey);
      localStorage.removeItem(`qai-store-cart-error-${userId}`);

      // Trigger cross-tab synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: cartKey,
          newValue: null,
          storageArea: localStorage
        }));

        // Broadcast to all components
        window.dispatchEvent(new CustomEvent('global-cart-clearance', {
          detail: {
            userId,
            clearedItems,
            timestamp: Date.now()
          }
        }));

        // Update header cart count to zero
        window.dispatchEvent(new CustomEvent('header-cart-update', {
          detail: {
            userId,
            newCount: 0,
            action: 'clear'
          }
        }));
      }

      console.log("✅ Cart clearance synced across all website components");
    } catch (error) {
      console.error("❌ Error syncing cart clearance:", error);
    }
  }

  /**
   * Subscribe to cart sync events for real-time updates
   */
  static subscribeToCartSync(callback: (eventData: any) => void) {
    const handleCartDeletion = (event: CustomEvent) => {
      callback({ type: 'delete', ...event.detail });
    };

    const handleCartClearance = (event: CustomEvent) => {
      callback({ type: 'clear', ...event.detail });
    };

    const handleCartUpdate = (event: CustomEvent) => {
      callback({ type: 'update', ...event.detail });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('global-cart-deletion', handleCartDeletion as EventListener);
      window.addEventListener('global-cart-clearance', handleCartClearance as EventListener);
      window.addEventListener('header-cart-update', handleCartUpdate as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('global-cart-deletion', handleCartDeletion as EventListener);
        window.removeEventListener('global-cart-clearance', handleCartClearance as EventListener);
        window.removeEventListener('header-cart-update', handleCartUpdate as EventListener);
      }
    };
  }

  /**
   * Subscribe to user product sync events
   */
  static subscribeToUserProductSync(callback: (products: any[]) => void) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'qai_user_products' && e.newValue) {
        try {
          const productData = JSON.parse(e.newValue);
          callback(productData.data || []);
        } catch (error) {
          console.error('Error parsing user product sync data:', error);
        }
      }
    };

    const handleCustomSync = (e: CustomEvent) => {
      callback(e.detail.products || []);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-products-sync', handleCustomSync as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-products-sync', handleCustomSync as EventListener);
    };
  }
}

// Export as default for easier importing
export default DataSyncHelper;