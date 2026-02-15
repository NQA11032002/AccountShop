"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Grid, List, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import { ProductBase } from '@/lib/products';
import { fetchProducts, fetchCategories, fetchProductsPaginated, type ProductsMeta } from '@/lib/api';
import { Category } from '@/types/category.interface';
import DOMPurify from 'dompurify';

const PER_PAGE = 12;

function ProductsContent() {
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [allProducts, setAllProducts] = useState<ProductBase[]>([]);
  const [filterSlug, setFilterSlug] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsMeta, setProductsMeta] = useState<ProductsMeta | null>(null);

  // Fetch data (products + categories)
  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const resp = await fetchCategories();
        const raw: any[] = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.data)
            ? resp.data
            : Array.isArray(resp?.categories)
              ? resp.categories
              : [];

        const flatAll: any[] = [];
        const parents: Category[] = [];

        if (raw.length > 0 && raw[0] && Array.isArray(raw[0].categories)) {
          // API trả về parent objects có .categories
          raw.forEach((parentObj: any) => {
            const parent = {
              id: Number(parentObj.id),
              name: String(parentObj.name ?? ''),
              parent_id: Number(parentObj.parent_id ?? 0),
              slug: parentObj.slug ?? undefined,
            };
            parents.push(parent);
            flatAll.push(parent);

            (parentObj.categories ?? []).forEach((child: any) => {
              flatAll.push({
                id: Number(child.id),
                name: String(child.name ?? ''),
                parent_id: Number(child.parent_id ?? parentObj.id ?? 0),
                slug: child.slug ?? undefined,
              });
            });
          });
        } else {
          // API trả về flat list
          raw.forEach((c: any) => {
            flatAll.push({
              id: Number(c.id),
              name: String(c.name ?? ''),
              parent_id: Number(c.parent_id ?? 0),
              slug: c.slug ?? undefined,
            });
          });

          // derive top-level parents
          flatAll.forEach((c: any) => {
            if (!c.parent_id || Number(c.parent_id) === 0) {
              parents.push({
                id: Number(c.id),
                name: String(c.name ?? ''),
                parent_id: Number(c.parent_id ?? 0),
                slug: c.slug ?? undefined,
              });
            }
          });
        }

        // dedupe
        const map = new Map<number, any>();
        flatAll.forEach((x) => { if (!map.has(x.id)) map.set(x.id, x); });
        const uniqueFlat = Array.from(map.values());

        if (mounted) {
          setFlatCategories(uniqueFlat);
          setCategories(parents);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        if (mounted) {
          setFlatCategories([]);
          setCategories([]);
        }
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => { mounted = false; };
  }, []);

  // Reset trang về 1 khi đổi danh mục, tìm kiếm hoặc slug
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchQuery, filterSlug]);

  // Tải sản phẩm: phân trang server (khi không có slug) hoặc load hết rồi lọc theo slug
  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        if (filterSlug) {
          const data = await fetchProducts();
          if (!mounted) return;
          setAllProducts(data);
          setProductsMeta(null);
          // Lọc theo slug sẽ do useEffect filter bên dưới xử lý
          const slug = String(filterSlug).toLowerCase();
          const filtered = data.filter((p: ProductBase) =>
            String((p as any)?.category?.slug ?? (p as any)?.slug ?? '').toLowerCase() === slug
          );
          setProducts(filtered);
        } else {
          const res = await fetchProductsPaginated({
            page: currentPage,
            perPage: PER_PAGE,
            categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
            search: debouncedSearchQuery.trim() || undefined,
          });
          if (!mounted) return;
          setProducts(res.data);
          setProductsMeta(res.meta);
          setAllProducts([]);
        }
      } catch (err: any) {
        console.error('Failed to load products', err);
        if (mounted) setError(err.message || 'Failed to fetch data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { mounted = false; };
  }, [currentPage, selectedCategory, debouncedSearchQuery, filterSlug]);

  // Debounce 1 giây trước khi áp dụng search vào danh sách sản phẩm
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDebouncedSearchQuery('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Replace your existing "Read ?category=..." useEffect with this one
  useEffect(() => {
    const raw = searchParams?.get?.('category');
    const search = searchParams?.get?.('search');

    if (search) {
      setSearchQuery(search);
    } else {
      if (!raw) {
        // nothing specified -> all
        setSelectedCategory('all');
        setFilterSlug(null);
        return;
      }

      // numeric id?
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) {
        setSelectedCategory(parsed);
        setFilterSlug(null);

        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (raw === 'all') {
        setSelectedCategory('all');
        setFilterSlug(null);

        return;
      }

      // treat as slug (string)
      const slug = String(raw);
      // keep sidebar default = 'all'
      setSelectedCategory('all');
      setFilterSlug(slug);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  }, [searchParams?.toString(), flatCategories]);

  // Chỉ chạy khi có allProducts (chế độ filter theo slug/category từ full list). Khi phân trang server thì allProducts rỗng, không ghi đè products.
  useEffect(() => {
    if (!allProducts || allProducts.length === 0) return;

    if (filterSlug) {
      const slug = String(filterSlug).toLowerCase();
      const filtered = allProducts.filter((p: ProductBase) =>
        String((p as any)?.category?.slug ?? (p as any)?.slug ?? '').toLowerCase() === slug
      );
      setProducts(filtered);
      return;
    }

    if (selectedCategory === 'all') {
      setProducts(allProducts);
      return;
    }

    const catId = Number(selectedCategory);
    const filteredById = allProducts.filter((p: ProductBase) => {
      const cat = (p as any).category;
      if (!cat) return false;
      if (typeof cat === 'object') {
        const matchesSelf = typeof cat.id === 'number' && cat.id === catId;
        const matchesParent = typeof (cat as any).parent_id === 'number' && (cat as any).parent_id === catId;
        return matchesSelf || matchesParent;
      }
      const parsed = parseInt(String(cat), 10);
      return !isNaN(parsed) && parsed === catId;
    });
    setProducts(filteredById);
  }, [selectedCategory, allProducts, filterSlug]);


  // When user clicks a category button in sidebar -> set selectedCategory and clear slug
  const handleSelectCategoryById = (id: number | 'all') => {
    // avoid redundant update
    if (selectedCategory === id && !filterSlug) {
      const url = id === 'all' ? '/products' : `/products?category=${id}`;
      if (typeof window !== 'undefined') window.history.replaceState({}, '', url);
      return;
    }

    // clear any slug filter when user explicitly selects numeric category
    setFilterSlug(null);
    setSelectedCategory(id);

    if (typeof window !== 'undefined') {
      const url = id === 'all' ? '/products' : `/products?category=${id}`;
      window.history.pushState({}, '', url);
    }
  };

  // sortProducts + filteredAndSortedProducts remain same as your code (use products as base)
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

  // Hàm bỏ dấu tiếng Việt + đưa về lowercase để search linh hoạt hơn
  const normalizeText = (value?: string | null) =>
    (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Gợi ý sản phẩm ngay khi gõ (không chờ debounce)
  const suggestedProducts = useMemo(() => {
    if (searchQuery.trim() === '') return [];

    const normalizedQuery = normalizeText(searchQuery);
    const tokens = normalizedQuery
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const matches = products.filter((p) => {
      const haystack = [
        normalizeText(p.name),
        normalizeText(p.description),
      ]
        .filter(Boolean)
        .join(' ');

      return tokens.every((token) => haystack.includes(token));
    });

    return matches.slice(0, 8); // tối đa 8 gợi ý
  }, [products, searchQuery]);

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];
    if (debouncedSearchQuery.trim() !== '' && filterSlug) {
      const normalizedQuery = normalizeText(debouncedSearchQuery);
      const tokens = normalizedQuery.split(/\s+/).map((t) => t.trim()).filter(Boolean);
      list = list.filter((p) => {
        const haystack = [normalizeText(p.name), normalizeText(p.description)].filter(Boolean).join(' ');
        return tokens.every((token) => haystack.includes(token));
      });
    }
    return sortProducts(list, sortBy);
  }, [products, debouncedSearchQuery, sortBy, filterSlug]);

  // Danh sách hiển thị: khi có filterSlug thì cắt theo trang (client-side), không thì dùng đúng 1 trang từ API
  const displayProducts = useMemo(() => {
    if (filterSlug && filteredAndSortedProducts.length > PER_PAGE) {
      const start = (currentPage - 1) * PER_PAGE;
      return filteredAndSortedProducts.slice(start, start + PER_PAGE);
    }
    return filteredAndSortedProducts;
  }, [filteredAndSortedProducts, currentPage, filterSlug]);

  const paginationTotal = productsMeta?.total ?? (filterSlug ? products.length : 0);
  const paginationLastPage = productsMeta?.last_page ?? Math.max(1, Math.ceil(products.length / PER_PAGE));
  const canPrev = currentPage > 1;
  const canNext = currentPage < paginationLastPage;

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
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-2">
              🌟 Tất cả sản phẩm
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Tài khoản Premium
              <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent p-1">
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
                  {loadingCategories ? (
                    <div className="text-sm text-gray-500">Đang tải danh mục...</div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSelectCategoryById('all')}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCategory === 'all'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white text-gray-600 border border-gray-200'
                            }`}>🌟</div>
                          <div className="text-left">
                            <div className={`font-semibold ${selectedCategory === 'all' ? 'text-blue-700' : 'text-gray-800'}`}>
                              Tất cả danh mục
                            </div>
                          </div>
                        </div>
                      </button>

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
                              {category.name.toLowerCase().includes('youtube') && '🎬'}
                              {category.name.toLowerCase().includes('spotify') && '🎵'}
                              {category.name.toLowerCase().includes('netflix') && '📺'}
                              {!['youtube', 'spotify', 'netflix'].some(k => category.name.toLowerCase().includes(k)) && '📁'}
                            </div>
                            <div className="text-left">
                              <div className={`font-semibold ${selectedCategory === category.id ? 'text-blue-700' : 'text-gray-800'}`}>
                                {category.name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
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
                    {suggestedProducts.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                        {suggestedProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              const name = product.name || '';
                              setSearchQuery(name);
                              setDebouncedSearchQuery(name);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-800">
                              {product.name}
                            </span>
                            {product.durations?.[0]?.price && (
                              <span className="text-xs text-gray-500">
                                {product.durations[0].price.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sort and View Mode */}
                  <div className="flex items-center space-x-4">
                    <div className="flex border rounded-lg">
                      <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-r-none">
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-l-none">
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Hiển thị {displayProducts.length} / {paginationTotal} sản phẩm
                  {searchQuery && ` cho "${searchQuery}"`}
                </p>

                {(searchQuery || selectedCategory !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      handleSelectCategoryById('all');
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
              {displayProducts.length ? (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2 gap-4 lg:gap-6'
                  : 'space-y-4'
                }>
                  {displayProducts.map((product) => (
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
              ) : null}

              {/* Phân trang */}
              {displayProducts.length > 0 && paginationLastPage > 1 && (
                <div className="flex items-center justify-center gap-2 flex-wrap pt-6 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!canPrev}
                  >
                    Trang trước
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    Trang <strong>{currentPage}</strong> / {paginationLastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(paginationLastPage, p + 1))}
                    disabled={!canNext}
                  >
                    Trang sau
                  </Button>
                </div>
              )}

              {displayProducts.length === 0 && (
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
                      handleSelectCategoryById('all');
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
