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
  { id: 'streaming', name: 'Streaming', icon: '📺' },
  { id: 'music', name: 'Âm nhạc', icon: '🎵' },
  { id: 'ai', name: 'AI Tools', icon: '🤖' },
  { id: 'design', name: 'Thiết kế', icon: '🎨' },
  { id: 'productivity', name: 'Văn phòng', icon: '💼' },
  { id: 'storage', name: 'Lưu trữ', icon: '☁️' },
  { id: 'education', name: 'Học tập', icon: '📚' }
];

export default function TopProducts() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { products, loading, error } = useProducts();

  const filteredProducts = selectedCategory === 'all' ? products : products.filter(product =>
    product.category.toLowerCase().replace(' ', '-') === selectedCategory
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4 border border-green-200">
            <TrendingUp className="w-4 h-4 mr-2" />
            Sản phẩm bán chạy nhất
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Top 6 Tài Khoản Hot Nhất
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những tài khoản được khách hàng tin tưởng và mua nhiều nhất, chất lượng đảm bảo 100%
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-6 ${selectedCategory === 'all'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            🔥 Tất cả
          </Button>
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-6 ${selectedCategory === category.id
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
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

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button className="bg-white border-brand-purple text-brand-purple hover:bg-gradient-to-r hover:from-brand-gray hover:to-brand-blue hover:text-white px-8 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
              Xem tất cả sản phẩm
              <TrendingUp className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section >
  );
}