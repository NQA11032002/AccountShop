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
import { ProductBase, useProducts } from '@/lib/products';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { Product } from '@/types/product.interface';
import { Category } from '@/types/category.interface';

import { useAuth } from '@/contexts/AuthContext';

function ProductsContent() {
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [allProducts, setAllProducts] = useState<ProductBase[]>([]);


  // Fetch data
  useEffect(() => {
    async function loadCategories() {
      const sessionId = localStorage.getItem('qai_session');
      if (sessionId) {
        try {
          const data = await fetchCategories(sessionId);

          setCategories(data.data);
        } catch (err) {
          console.error('Failed to load categories', err);
        } finally {
          setLoadingCategories(false);
        }
      }

    }

    loadCategories();

    async function loadData() {
      try {
        const data = await fetchProducts();
        setAllProducts(data);
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectCategoryById = (id: number | 'all') => {
    if (id === 'all') {
      setProducts(allProducts);
      setSelectedCategory('all');
      return;
    }

    const filtered = allProducts.filter(p => {
      const cat = p.category;
      if (!cat) return false;

      // Nếu category là object với id / parent_id
      if (typeof cat === 'object') {
        const matchesSelf = typeof cat.id === 'number' && cat.id === id;
        const matchesParent = typeof cat.parent_id === 'number' && cat.parent_id === id;
        return matchesSelf || matchesParent;
      }

      // Nếu category là string (nếu có khả năng)
      const parsed = parseInt(String(cat), 10);
      if (!isNaN(parsed) && parsed === id) return true;
      return String(cat).toLowerCase() === String(id).toLowerCase();
    });

    setProducts(filtered);
    setSelectedCategory(id);
  };

  function sortProducts(list: ProductBase[], sortBy: string): ProductBase[] {
    return [...list].sort((a, b) => {
      const getPrice = (p: ProductBase) => (p.durations?.[0]?.price ?? 0);
      switch (sortBy) {
        case 'price-low':
          return getPrice(a) - getPrice(b);
        case 'price-high':
          return getPrice(b) - getPrice(a);
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'popular':
        default:
          return (b.reviews ?? 0) - (a.reviews ?? 0);
      }
    });
  }

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...allProducts];

    // search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name?.toLowerCase().includes(q) || '')
        || (p.description?.toLowerCase().includes(q) || '')
      );
    }

    // category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => {
        const cat = p.category;
        if (!cat) return false;

        let categoryId: number | null = null;
        let parentId: number | null = null;

        if (typeof cat === 'object') {
          if (typeof cat.id === 'number') categoryId = cat.id;
          if (typeof (cat as any).parent_id === 'number') parentId = (cat as any).parent_id;
        } else {
          const parsed = parseInt(String(cat), 10);
          if (!isNaN(parsed)) categoryId = parsed;
        }

        return categoryId === selectedCategory || parentId === selectedCategory;
      });
    }

    // sort
    return sortProducts(list, sortBy);
  }, [allProducts, searchQuery, selectedCategory, sortBy]);

  const handleBuyNow = (productId: number) => {
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
                      key={category.id}
                      onClick={() => handleSelectCategoryById(category.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCategory === category.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-white text-gray-600 border border-gray-200'
                          }`}>
                          {category.name === 'all' && '🌟'}
                          {category.name === 'entertainment' && '🎬'}
                          {category.name === 'music' && '🎵'}
                          {category.name === 'ai' && '🤖'}
                          {category.name === 'design' && '🎨'}
                          {category.name === 'productivity' && '📊'}
                          {category.name === 'education' && '📚'}
                        </div>
                        <div className="text-left">
                          <div className={`font-semibold ${selectedCategory === category.id ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                            {category.name}
                          </div>
                          {/* <div className="text-xs text-gray-500">
                            {category.count} sản phẩm
                          </div> */}
                        </div>
                      </div>
                      {/* <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedCategory === category.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-600'
                        }`}>
                        {category.count}
                      </div> */}
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
                  Hiển thị {filteredAndSortedProducts?.length} sản phẩm
                  {searchQuery && ` cho "${searchQuery}"`}
                  {/* {selectedCategory !== 'all' && (
                    <>
                      {' trong danh mục "'}
                      {categories.find(c => c.id === selectedCategory)?.name ?? 'Không rõ'}
                      {'"'}
                    </>
                  )} */}
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
              {filteredAndSortedProducts.length ? (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2 gap-4 lg:gap-6'
                  : 'space-y-4'
                }>
                  {filteredAndSortedProducts.map((product) => (
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
                    className="border-brand-purple text-brand-purple hover:bg-gradient-to-r hover:from-brand-gray hover:to-brand-blue hover:text-white px-8 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
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