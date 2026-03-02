"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Percent } from "lucide-react";
import { useProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DiscountedProductsSlider() {
  const { products, loading, error } = useProducts();
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const discountedProducts = products.filter(
    (p) => Number(p.discount_percent) > 0
  );

  // Không có sản phẩm giảm giá thì không hiển thị gì
  if (!loading && (!discountedProducts || discountedProducts.length === 0)) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    const container = sliderRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 sm:py-12 bg-gradient-to-b from-white via-blue-50/40 to-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm font-medium mb-2">
              <Percent className="w-3 h-3 mr-1.5" />
              Sản phẩm đang giảm giá
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Ưu đãi hấp dẫn hôm nay
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Lọc tự động các sản phẩm có giảm giá, kéo ngang để xem thêm.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 mr-2">
              {discountedProducts.length > 0 && (
                <span>
                  Đang hiển thị {discountedProducts.length} sản phẩm giảm giá
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-gray-300 text-gray-700 hover:bg-white shadow-sm"
                onClick={() => scroll("left")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-gray-300 text-gray-700 hover:bg-white shadow-sm"
                onClick={() => scroll("right")}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 -mx-2 px-2 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          {discountedProducts.map((product) => (
            <div
              key={product.id}
              className="snap-start flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%]"
            >
              <ProductCard
                product={product}
                size="medium"
                showFeatures={false}
                showFavoriteButton={true}
                className="h-full border border-red-100/70 hover:border-red-300/80 bg-white/80 backdrop-blur-sm"
              >
                {product.discount_percent && product.discount_percent > 0 && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white text-[10px] sm:text-xs shadow-sm">
                    Giảm {product.discount_percent}%
                  </Badge>
                )}
              </ProductCard>
            </div>
          ))}

          {/* Loading skeleton nếu cần */}
          {loading && discountedProducts.length === 0 && (
            <div className="flex gap-4 w-full">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] h-48 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}
        </div>

        {/* Link xem tất cả */}
        {discountedProducts.length > 0 && (
          <div className="text-center mt-6">
            <Link href="/products">
              <Button
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-xs sm:text-sm"
              >
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

