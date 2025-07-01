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
    <section id="categories" className="py-20 bg-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 mb-4">
            Danh mục nổi bật
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
            Tài khoản Premium
            <span className="gradient-text"> Chất lượng cao</span>
          </h2>
          <p className="text-lg text-brand-gray/80 text-balance leading-relaxed">
            Khám phá bộ sưu tập các tài khoản premium được yêu thích nhất với giá cả hợp lý và bảo hành uy tín
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
            className="border-brand-purple text-brand-purple hover:bg-gradient-to-r hover:from-brand-purple hover:to-brand-blue hover:text-white px-8 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Xem tất cả danh mục
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}