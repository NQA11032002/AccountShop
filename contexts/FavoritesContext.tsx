"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { FavoriteItem } from '@/types/favorite.interface';
import { getFavorites, addFavorite, removeFavorite } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';



interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (product_id: number, name: string) => void;
  removeFromFavorites: (id: number, name: string) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { user, sessionId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadFavorites = async () => {
      if (!sessionId) return;
      try {
        const data = await getFavorites(sessionId);

        if (data) {
          const mappedFavorites: FavoriteItem[] = data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            name: item.product?.name || '',
            price: item.product?.price || 0,
            original_price: item.product?.original_price,
            image: item.product?.image,
            rating: item.product?.rating,
            description: item.product?.description,
            color: item.product?.color,
            duration: item.product?.duration, // nếu có
            selected_duration: item.selected_duration, // nếu có
            reviews: item.product?.reviews,
            added_at: item.added_at
          }));

          setFavorites(mappedFavorites);
        }
      } catch (err) {
        toast({
          title: "Lỗi",
          description: `${err}Không thể tải danh sách yêu thích`,
          variant: "destructive"
        });
      }
    };

    loadFavorites();
  }, [sessionId]);


  const addToFavorites = async (product_id: number, name: string) => {
    if (!sessionId) return;

    try {
      await addFavorite(product_id, sessionId);

      // 🛠️ THÊM DÒNG NÀY để cập nhật UI ngay
      setFavorites(prev => [...prev, {
        id: Date.now(), // tạm thời tạo ID giả nếu chưa có từ server
        product_id,
        name,
        price: 0,
        original_price: 0,
        image: '',
        rating: 0,
        description: '',
        color: '',
        duration: '',
        selected_duration: 1,
        reviews: 0,
        added_at: new Date().toISOString()
      }]);

    } catch (error) {
      console.error("❌ Failed to add to favorites:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm vào danh sách yêu thích.",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (id: number, name: string) => {
    if (!sessionId) return;

    try {
      await removeFavorite(id, sessionId);
      setFavorites(prev => prev.filter(item => item.product_id !== id));
      toast({
        title: `Đã xoá ${name} khỏi yêu thích`,
        description: "Sản phẩm đã được xoá.",
      });
    } catch (error) {
      console.error("❌ Failed to remove from favorites:", error);
      toast({
        title: "Lỗi xoá",
        description: "Không thể xoá khỏi yêu thích.",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (id: number): boolean => {
    return favorites.some(item => item.product_id === id);
  };

  const clearFavorites = () => {
    setFavorites([]);
    toast({
      title: "Đã xoá tất cả",
      description: "Đã xoá toàn bộ sản phẩm yêu thích.",
    });
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