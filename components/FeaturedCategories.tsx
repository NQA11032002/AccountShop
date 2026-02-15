"use client";

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
// import { DataSyncHelper } from '@/lib/syncHelper';
import { fetchProducts } from '@/lib/api';
import { useProducts } from '@/lib/products';

export default function FeaturedCategories() {

  const { products, loading, error } = useProducts();


  return (
    <section id="categories" className="section-spacing bg-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16 animate-fade-in">
          <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 mb-3 sm:mb-4 text-xs sm:text-sm">
            Danh mục nổi bật
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 sm:mb-4 px-2">
            Tài khoản Premium
            <span className="gradient-text"> Chất lượng cao</span>
          </h2>
          <p className="text-base sm:text-lg text-brand-gray/80 text-balance leading-relaxed px-2">
            Khám phá bộ sưu tập các tài khoản premium được yêu thích nhất với giá cả hợp lý và bảo hành uy tín
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              size="large"
              showFeatures={true}
              showFavoriteButton={true}
              className={`animate-fade-in animation-delay-${index * 100}`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center animate-fade-in animation-delay-600">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/products'}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
          >
            Xem tất cả danh mục
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  );
}