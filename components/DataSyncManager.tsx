"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import DataSyncHelper from '@/lib/syncHelper';

/**
 * DataSyncManager ensures all data is properly synchronized across contexts
 * This component should be placed at the root level to monitor data consistency
 */
export default function DataSyncManager() {
  const { user } = useAuth();
  const { itemsCount } = useCart();
  const { favorites } = useFavorites();

  // Monitor data synchronization
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        const summary = DataSyncHelper.getDataSummary(user.id);
        const validation = DataSyncHelper.validateUserData(user.id);
        
        console.log("Data sync check", {
          userId: user.id,
          contextData: { cartItems: itemsCount, favorites: favorites.length },
          storageData: summary,
          isValid: validation.isValid
        });

        // If there's a mismatch or validation error, fix it
        if (!validation.isValid) {
          console.warn("Data validation failed, cleaning up:", validation.errors);
          DataSyncHelper.clearUserData(user.id);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, itemsCount, favorites.length]);

  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user && (e.key?.startsWith(`qai-store-cart-${user.id}`) || e.key?.startsWith(`qai_favorites_${user.id}`))) {
        console.log("Cross-tab storage change detected", { key: e.key, userId: user.id });
        // Force re-sync by triggering context updates
        DataSyncHelper.forceSync(user.id);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Initial sync on user change
  useEffect(() => {
    if (user?.id) {
      console.log("User changed, performing data sync", { userId: user.id });
      const validation = DataSyncHelper.validateUserData(user.id);
      if (!validation.isValid) {
        console.warn("Initial data validation failed:", validation.errors);
        DataSyncHelper.clearUserData(user.id);
      }
    }
  }, [user?.id]);

  // This component doesn't render anything visible
  return null;
}