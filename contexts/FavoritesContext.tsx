"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import DataSyncHelper from '@/lib/syncHelper';

interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  description: string;
  rating: number;
  reviews: number;
  addedDate: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { user } = useAuth();

  console.log("FavoritesProvider initialized", { favoritesCount: favorites.length, user: user?.email });

  useEffect(() => {
    const loadUserFavorites = async () => {
      if (user) {
        console.log("💖 Loading favorites for user", { userId: user.id });
        
        try {
          // Load favorites from JSON API with fallback to localStorage
          const favoritesData = await DataSyncHelper.loadUserData(user.id, 'userFavorites');
          
          if (favoritesData.length > 0) {
            // Transform API favorites data to local format
            const favoriteItems: (FavoriteItem | null)[] = await Promise.all(
              favoritesData.map(async (fav: any) => {
                // Get product details for each favorite
                const products = await DataSyncHelper.loadUserProducts();
                const product = products.find((p: any) => p.id === fav.productId);
                
                if (product) {
                  return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.image,
                    color: product.color,
                    description: product.description,
                    rating: product.rating,
                    reviews: product.reviews,
                    addedDate: fav.addedAt
                  } as FavoriteItem;
                }
                return null;
              })
            );
            
            const validFavorites = favoriteItems.filter((item): item is FavoriteItem => item !== null);
            setFavorites(validFavorites);
            console.log("✅ Favorites loaded from API", { count: validFavorites.length });
          } else {
            // Fallback to localStorage
            const storedFavorites = localStorage.getItem(`qai_favorites_${user.id}`);
            if (storedFavorites) {
              try {
                const favoritesData = JSON.parse(storedFavorites);
                setFavorites(favoritesData);
                console.log("💾 Favorites loaded from localStorage", { count: favoritesData.length });
              } catch (error) {
                console.error("❌ Error parsing stored favorites:", error);
                localStorage.removeItem(`qai_favorites_${user.id}`);
                setFavorites([]);
              }
            } else {
              setFavorites([]);
              console.log("📝 No saved favorites found for user");
            }
          }
        } catch (error) {
          console.error("❌ Error loading user favorites:", error);
          setFavorites([]);
        }
      } else {
        // Clear favorites when no user is logged in
        setFavorites([]);
        console.log("🚪 Favorites cleared - no user logged in");
      }
    };

    loadUserFavorites();
  }, [user]);

  const saveFavorites = async (newFavorites: FavoriteItem[]) => {
    if (user) {
      // Save to localStorage immediately
      localStorage.setItem(`qai_favorites_${user.id}`, JSON.stringify(newFavorites));
      
      try {
        // Transform to API format and sync to JSON API
        const apiFavoritesData = newFavorites.map((fav: FavoriteItem) => ({
          userId: user.id,
          productId: fav.id,
          addedAt: fav.addedDate
        }));
        
        // Save to API
        const success = await DataSyncHelper.saveToAPI('userFavorites', apiFavoritesData, 'bulk_update');
        
        console.log("💾 Favorites synced", { 
          userId: user.id, 
          count: newFavorites.length, 
          apiSynced: success 
        });
      } catch (error) {
        console.warn("⚠️ Failed to sync favorites to API (saved locally):", error);
      }
    }
  };

  const addToFavorites = (item: FavoriteItem) => {
    console.log("Adding to favorites", { itemId: item.id, itemName: item.name });
    if (!user) {
      console.log("Cannot add to favorites - user not logged in");
      return;
    }

    const itemWithDate = {
      ...item,
      addedDate: new Date().toISOString()
    };

    const newFavorites = [...favorites, itemWithDate];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const removeFromFavorites = (id: number) => {
    console.log("Removing from favorites", { itemId: id });
    const newFavorites = favorites.filter(item => item.id !== id);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (id: number): boolean => {
    return favorites.some(item => item.id === id);
  };

  const clearFavorites = () => {
    console.log("Clearing all favorites");
    setFavorites([]);
    if (user) {
      localStorage.removeItem(`qai_favorites_${user.id}`);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      clearFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}