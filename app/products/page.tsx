"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Filter, Grid, List, Star, ShoppingCart, Clock, Shield, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataSyncHelper } from '@/lib/syncHelper';
import ProductCard from '@/components/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<any[]>([]);

  // Load products from admin sync or fallback to static data
  useEffect(() => {
    const loadProducts = async () => {
      console.log("🛍️ Loading products for Products page");
      
      try {
        // Load products from API data.json file
        const syncedProducts = await DataSyncHelper.loadUserProducts();
        
        if (Array.isArray(syncedProducts) && syncedProducts.length > 0) {
          console.log("✅ Products page loaded from data.json API", { 
            count: syncedProducts.length,
            source: 'API data.json'
          });
          setProducts(syncedProducts);
        } else {
          console.log("⚠️ No products found in data.json API");
          setProducts([]);
        }
      } catch (error) {
        console.warn("⚠️ Error loading products from API:", error);
        setProducts([]);
      }
    };
    
    // Use a small delay to prevent race conditions and allow proper initialization
    const timeoutId = setTimeout(loadProducts, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Subscribe to product sync updates
  useEffect(() => {
    const unsubscribe = DataSyncHelper.subscribeToUserProductSync((syncedProducts) => {
      console.log("🔄 Products updated from admin sync", { count: syncedProducts.length });
      setProducts(syncedProducts);
    });

    return unsubscribe;
  }, []);

  // Handle URL query parameters
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    const searchParam = searchParams?.get('search');
    
    console.log("URL params detected", { categoryParam, searchParam });
    
    if (categoryParam) {
      // Map breadcrumb category values to product page categories
      const categoryMapping: { [key: string]: string } = {
        // Product detail page category mappings
        'Streaming': 'entertainment',
        'Music': 'music',
        'AI Tools': 'ai',
        'Design': 'design',
        'Productivity': 'productivity',
        // Header category values to product page categories
        'language': 'education',
        'cheap-courses': 'education', 
        'programming': 'education',
        'education': 'education',
        'chatgpt': 'ai',
        'piktory': 'ai',
        'heygen': 'ai',
        'veed': 'ai',
        'midjourney': 'ai',
        'ai-tools': 'ai',
        'youtube': 'entertainment',
        'spotify': 'music',
        'netflix': 'entertainment',
        'streaming': 'entertainment',
        'apple-music': 'music',
        'entertainment': 'entertainment',
        'adobe': 'design',
        'canva': 'design',
        'capcut': 'design',
        'design-resources': 'design',
        'graphics': 'design',
        'vpn': 'productivity',
        'antivirus': 'productivity',
        'proxy': 'productivity',
        'google-one': 'productivity',
        'onedrive': 'productivity',
        'icloud': 'productivity',
        'office': 'productivity',
        'zoom': 'productivity',
        'adobe-key': 'design'
      };
      
      const mappedCategory = categoryMapping[categoryParam] || categoryParam.toLowerCase();
      setSelectedCategory(mappedCategory);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);



  console.log("ProductsPage rendered", { searchQuery, selectedCategory, sortBy, viewMode, productsCount: products.length });

  const categories = [
    { value: 'all', label: 'Tất cả', count: products.length },
    { value: 'entertainment', label: 'Giải trí', count: products.filter(p => p.category === 'entertainment').length },
    { value: 'music', label: 'Âm nhạc', count: products.filter(p => p.category === 'music').length },
    { value: 'ai', label: 'AI Tools', count: products.filter(p => p.category === 'ai').length },
    { value: 'design', label: 'Thiết kế', count: products.filter(p => p.category === 'design').length },
    { value: 'productivity', label: 'Năng suất', count: products.filter(p => p.category === 'productivity').length },
    { value: 'education', label: 'Học tập', count: products.filter(p => p.category === 'education').length },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popular
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, products]);

  const handleBuyNow = (productId: number) => {
    console.log(`Buy now clicked for product ${productId}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigate-to-product', {
        detail: { path: `/products/${productId}` }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-hero py-20">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-2">
              🌟 Tất cả sản phẩm
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Tài khoản Premium
              <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent">
                Chất lượng cao
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Khám phá bộ sưu tập đầy đủ các tài khoản premium với giá tốt nhất thị trường
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-8">
        <div className="container-max section-padding">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Category Table of Contents */}
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <Grid3X3 className="w-5 h-5 mr-2" />
                    Danh mục sản phẩm
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Tìm tài khoản theo danh mục</p>
                </div>
                
                <div className="p-6 space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        selectedCategory === category.value
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedCategory === category.value
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}>
                          {category.value === 'all' && '🌟'}
                          {category.value === 'entertainment' && '🎬'}
                          {category.value === 'music' && '🎵'}
                          {category.value === 'ai' && '🤖'}
                          {category.value === 'design' && '🎨'}
                          {category.value === 'productivity' && '📊'}
                          {category.value === 'education' && '📚'}
                        </div>
                        <div className="text-left">
                          <div className={`font-semibold ${
                            selectedCategory === category.value ? 'text-blue-700' : 'text-gray-800'
                          }`}>
                            {category.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.count} sản phẩm
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedCategory === category.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.count}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Search and Products */}
            <div className="flex-1 space-y-6">
              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>

                  {/* Sort and View Mode */}
                  <div className="flex items-center space-x-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sắp xếp theo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Phổ biến nhất</SelectItem>
                        <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                        <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                        <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                        <SelectItem value="name">Tên A-Z</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode Toggle */}
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Hiển thị {filteredProducts.length} sản phẩm
                  {searchQuery && ` cho "${searchQuery}"`}
                  {selectedCategory !== 'all' && ` trong danh mục "${categories.find(c => c.value === selectedCategory)?.label}"`}
                </p>
                
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              {/* Products */}
              {filteredProducts.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2 gap-4 lg:gap-6' 
                  : 'space-y-4'
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isListView={viewMode === 'list'}
                      size="medium"
                      showFeatures={true}
                      showFavoriteButton={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="btn-primary"
                  >
                    Xem tất cả sản phẩm
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}