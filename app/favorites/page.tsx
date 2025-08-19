"use client";

import { useState } from 'react';
import { Heart, Star, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { CartItem } from '@/types/cart.interface';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();


  const handleAddToCart = (item: any) => {
    // console.log("Adding favorite item to cart", { itemId: item.id });

    const cartItem: CartItem = {
      id: 0, // Giả định là 0 nếu chưa có ID từ server
      user_id: user?.id || '0',
      product_id: item.product_id || item.id,
      product_name: item.name,
      price: item.price,
      original_price: item.original_price || item.price,
      quantity: 1,
      selected_duration: item.selected_duration || 1,
      duration: item.duration || "1 tháng",
      image: item.image || '',
      color: item.color || '#3B82F6',
      description: item.description || '',
      warranty: item.warranty || '30 ngày',
      added_at: new Date().toISOString()
    };

    addItem(cartItem);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${item.name} đã được thêm vào giỏ hàng.`,
    });
  };

  const handleRemoveFromFavorites = (itemId: number, name: string) => {
    removeFromFavorites(itemId, name);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="mb-6">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-brand-charcoal mb-2">Đăng nhập để xem yêu thích</h2>
            <p className="text-gray-600">Bạn cần đăng nhập để xem danh sách sản phẩm yêu thích.</p>
          </div>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">
                Đăng ký tài khoản
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container-max section-padding py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-brand-charcoal">Sản phẩm yêu thích</h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} sản phẩm trong danh sách yêu thích của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-max section-padding py-8">
        {favorites.length === 0 ? (
          <Card className="text-center p-12">
            <div className="mb-6">
              <Heart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-brand-charcoal mb-2">Chưa có sản phẩm yêu thích</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Hãy khám phá các sản phẩm tuyệt vời và thêm vào danh sách yêu thích để dễ dàng tìm lại sau này.
              </p>
            </div>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90">
                Khám phá sản phẩm
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <div
                    className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: item.color }}
                  >
                    <img
                      src={`/images/products/${item.image}`}
                      alt={item.name}
                      className="w-16 h-16 object-contain filter drop-shadow-lg"
                    />
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{item.rating}</span>
                    </div>
                  </div>

                  {/* Remove from favorites */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromFavorites(item.product_id, item.name)}
                    className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-brand-charcoal mb-1 group-hover:text-brand-blue transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-brand-emerald">
                        {item.price?.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {item.original_price?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.reviews} đánh giá
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Thêm {new Date(item.added_at).toLocaleDateString('vi-VN')}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="bg-gradient-to-r from-brand-charcoal to-brand-blue hover:from-brand-blue hover:to-brand-emerald text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}