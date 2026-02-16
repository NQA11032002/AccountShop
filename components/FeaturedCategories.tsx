"use client";

import { useRef, useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/lib/products';

const FEATURED_LIMIT = 9;

export default function FeaturedCategories() {
  const { products } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const featuredProducts = products.slice(0, FEATURED_LIMIT);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [featuredProducts.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

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

        {/* Carousel với mũi tên */}
        <div className="relative mb-10 sm:mb-12">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-brand-blue/30 text-brand-blue shadow-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center"
              aria-label="Xem trước"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-brand-blue/30 text-brand-blue shadow-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center"
              aria-label="Xem tiếp"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth scrollbar-hide py-2 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[340px] animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  size="large"
                  showFeatures={true}
                  showFavoriteButton={true}
                />
              </div>
            ))}
          </div>
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