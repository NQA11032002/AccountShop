"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PromotionalItem {
  id: number;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  image: string;
  sold: number;
  description: string;
  isOfficial: boolean;
  category: string;
}

export default function PromotionalAccounts() {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const promotionalItems: PromotionalItem[] = [
    {
      id: 101,
      name: "Google AI Ultra",
      originalPrice: 750000,
      discountedPrice: 150000,
      discount: 98,
      image: "https://logo.clearbit.com/google.com",
      sold: 98,
      description: "Tài khoản Google AI Ultra - Google VEO 3",
      isOfficial: true,
      category: "AI Tools"
    },
    {
      id: 102,
      name: "Gamma AI Pro Plus",
      originalPrice: 520000,
      discountedPrice: 99000,
      discount: 81,
      image: "https://logo.clearbit.com/gamma.app",
      sold: 13,
      description: "Nâng cấp tài khoản Gamma AI giá rẻ từ 99k",
      isOfficial: true,
      category: "AI Tools"
    },
    {
      id: 103,
      name: "Tinder Gold, Platinum",
      originalPrice: 2990000,
      discountedPrice: 299000,
      discount: 90,
      image: "https://logo.clearbit.com/tinder.com",
      sold: 67,
      description: "Nâng Cấp Tinder Gold, Platinum Chính Chủ Giá Rẻ",
      isOfficial: true,
      category: "Dating"
    },
    {
      id: 104,
      name: "YouTube Premium",
      originalPrice: 149000,
      discountedPrice: 59000,
      discount: 60,
      image: "https://logo.clearbit.com/youtube.com",
      sold: 47,
      description: "Nâng cấp Youtube Premium Chính Chủ Giá Từ 59k",
      isOfficial: true,
      category: "Streaming"
    }
  ];

  const handleAddToCart = (item: PromotionalItem) => {
    console.log("Adding promotional item to cart", { item });

    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.discountedPrice,
      originalPrice: item.originalPrice,
      duration: "1 tháng",
      durationId: "1m",
      image: item.image,
      color: "#6366f1",
      description: item.description,
      warranty: "Bảo hành 30 ngày"
    };

    addItem(cartItem);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${item.name} đã được thêm vào giỏ hàng.`,
    });
  };

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gray-50"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"></div>

      <div className="container-max section-padding relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold text-gray-800">
              TÀI KHOẢN, PHẦN MỀM KHUYẾN MÃI
            </h2>
            <span className="text-2xl">🔥</span>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            Chương trình đã kết thúc
          </Badge>
        </div>

        {/* Promotional Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {promotionalItems.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-200/60 rounded-xl">
              {/* Discount Badge */}
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1 rounded-md shadow-sm">
                  Giảm {item.discount}%
                </Badge>
              </div>

              {/* Official Badge */}
              {item.isOfficial && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-sm">
                    Chính chủ
                  </Badge>
                </div>
              )}

              <CardContent className="p-0">
                {/* Product Image Area */}
                <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain filter drop-shadow-sm"
                  />
                  {/* Price overlay */}
                  <div className="absolute bottom-3 left-3 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                    {item.discountedPrice.toLocaleString()}đ
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 line-through text-sm">
                        {item.originalPrice.toLocaleString()}đ
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {item.discountedPrice.toLocaleString()}đ
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Giá rẻ nhất thị trường, bảo hành đầy đủ
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-1">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      size="sm"
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Thêm vào giỏ hàng
                    </Button>
                  </div>

                  {/* Sold count */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2.5 rounded-lg font-semibold text-sm shadow-sm">
                    🔥 Đã bán {item.sold}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/products')}
            className="bg-gray-800 hover:bg-gray-900 text-white border border-gray-700 px-8 py-3 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Xem tất cả
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}