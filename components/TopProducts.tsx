"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { DataSyncHelper } from '@/lib/syncHelper';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/products';

const PRODUCT_CATEGORIES = [
  { id: '1', name: 'Học Tâp, Khóa Học', icon: '📚' },
  { id: '2', name: 'Phần Mềm, Công Cụ AI', icon: '🤖' },
  { id: '3', name: 'Giải Trí & Xem Phim', icon: '🎵' },
  { id: '4', name: 'Thiết Kế & Đồ Họa', icon: '🎨' },
  { id: '5', name: 'Bảo Mật, VPN', icon: '💼' },
  { id: '6', name: 'Dung Lượng Lưu Trữ', icon: '☁️' },
  { id: '7', name: 'Key & Window', icon: '📺' }
];

export default function TopProducts() {
  const { products, loading, error } = useProducts();

  // Lọc các sản phẩm có nhãn "Hot" (không phân biệt hoa/thường)
  const hotProducts = products.filter(
    (p) => p.badge && p.badge.toLowerCase() === 'hot'
  );

  // Lấy 9 sản phẩm đầu tiên có nhãn Hot
  const hotDisplayedProducts = hotProducts.slice(0, 9);

  // Lấy giá hiệu dụng: ưu tiên durations[0].price nếu có, fallback về product.price
  const getEffectivePrice = (p: any) =>
    (p.durations?.[0]?.price ?? p.price ?? 0);

  // Sắp xếp theo giá tăng dần và lấy 9 sản phẩm rẻ nhất
  const cheapestProducts = [...products]
    .sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b))
    .slice(0, 9);

  return (
    <>
      {/* Mục 1: Tài khoản Premium Chất lượng cao (Hot) */}
      <section className="section-spacing bg-white">
        <div className="container-max section-padding">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 border border-green-200">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
              Tài khoản Premium chất lượng cao
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Tài khoản Premium Chất lượng cao
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Hiển thị tối đa 9 sản phẩm được gắn nhãn <strong>Hot</strong>, giúp bạn nhanh chóng chọn các gói nổi bật nhất.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {hotDisplayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                size="medium"
                showFeatures={true}
                showFavoriteButton={true}
                className="h-full"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mục 2: 9 tài khoản giá tốt nhất hôm nay (rẻ nhất) */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container-max section-padding">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 border border-blue-200">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
              9 tài khoản giá tốt nhất hôm nay
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              9 tài khoản giá tốt nhất hôm nay
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Tự động chọn 9 sản phẩm có giá thấp nhất để bạn dễ dàng lựa chọn, vẫn đảm bảo chất lượng dịch vụ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cheapestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                size="medium"
                showFeatures={true}
                showFavoriteButton={true}
                className="h-full"
              />
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link href="/products">
              <Button className="bg-white border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
                Xem tất cả sản phẩm
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}