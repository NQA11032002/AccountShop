"use client";

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import { DataSyncHelper } from '@/lib/syncHelper';
import { type ProductBase } from '@/lib/utils';

export default function FeaturedCategories() {
  const [products, setProducts] = useState<ProductBase[]>([]);

  console.log("FeaturedCategories component rendered", { productsCount: products.length });

  // Load products from API data.json file
  useEffect(() => {
    const loadProducts = async () => {
      console.log("🛍️ Loading products for FeaturedCategories");
      
      try {
        // Load products from API data.json file
        const syncedProducts = await DataSyncHelper.loadUserProducts();
        
        if (Array.isArray(syncedProducts) && syncedProducts.length > 0) {
          console.log("✅ FeaturedCategories loaded from data.json API", { 
            count: syncedProducts.length,
            source: 'API data.json'
          });
          setProducts(syncedProducts.slice(0, 6)); // Get top 6 for display
        } else {
          console.log("⚠️ No products found in data.json API");
          setProducts([]);
        }
      } catch (error) {
        console.warn("⚠️ Error loading products from API:", error);
        setProducts([]);
      }
    };
    
    const timeoutId = setTimeout(loadProducts, 50);
    return () => clearTimeout(timeoutId);
  }, []);

  // Subscribe to product sync updates
  useEffect(() => {
    const unsubscribe = DataSyncHelper.subscribeToUserProductSync((syncedProducts) => {
      console.log("🔄 FeaturedCategories updated from admin sync", { count: syncedProducts.length });
      setProducts(syncedProducts.slice(0, 6));
    });

    return unsubscribe;
  }, []);



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