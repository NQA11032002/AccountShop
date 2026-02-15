"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, User, MapPin, Phone, Wallet, Shield, Crown, Grid3X3, ChevronDown, LogOut, Heart, Ticket } from 'lucide-react';
import DataSyncHelper from '@/lib/syncHelper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { fetchCategories, fetchProducts } from '@/lib/api';
import type { Category, ParentCategory } from '@/types/category.interface';
import type { ProductBase } from '@/lib/products';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { itemsCount } = useCart();
  const [realtimeCartCount, setRealtimeCartCount] = useState(itemsCount);
  const { favorites } = useFavorites();
  const { balance, formatCoins } = useWallet();
  const { user, logout, setRole, setSessionId } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // categories state (flat list). Use any internally to allow slug even if your type lacks it.
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // products for header search suggestions
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // search input
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');

  // Enhanced real-time cart sync for Header
  useEffect(() => {
    if (!user) {
      setRealtimeCartCount(0);
      return;
    }

    // Sync realtime count with context
    setRealtimeCartCount(itemsCount);

    // Subscribe to cart sync events
    const unsubscribe = DataSyncHelper.subscribeToCartSync((eventData) => {
      if (eventData.userId === user.id) {
        if (eventData.type === 'delete') {
          const newCount = eventData.updatedCart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          setRealtimeCartCount(newCount);
        } else if (eventData.type === 'clear') {
          setRealtimeCartCount(0);
        } else if (eventData.type === 'update') {
          setRealtimeCartCount(eventData.newCount || 0);
        }
      }
    });

    return unsubscribe;
  }, [user, itemsCount]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi Admin Panel.",
    });
    localStorage.clear();
    setRole('');
    setSessionId('');
    router.push('/login');
  };

  // Sync realtime count with context changes
  useEffect(() => {
    setRealtimeCartCount(itemsCount);
  }, [itemsCount]);

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Danh mục sản phẩm', href: '/products' },
    { name: 'Chính sách mua hàng', href: '/how-to-buy' },
    { name: 'Tin tức công nghệ', href: '/news' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Prompt GPT', href: '/prompt' },
    { name: 'Lấy Code', href: '/onetimecode' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  // SEARCH: debounce 3 giây, không cần Enter/click
  useEffect(() => {
    const q = (searchInput || '').trim();
    if (!q) {
      setDebouncedSearchInput('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchInput(q);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const q = debouncedSearchInput;
    if (!q) return;

    const qLower = q.toLowerCase();

    // exact match slug OR exact match name (case-insensitive)
    const matched = categories.find((c: any) =>
      (c.slug && String(c.slug).toLowerCase() === qLower) ||
      (c.name && String(c.name).toLowerCase() === qLower)
    );

    if (matched) {
      const val = matched.slug ? matched.slug : String(matched.id);
      router.push(`/products?category=${encodeURIComponent(val)}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    }
  }, [debouncedSearchInput, categories, router]);

  // Load categories & products cho search header
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingCategories(true);
      setLoadingProducts(true);
      setCategoriesError(null);

      try {
        const resp = await fetchCategories();
        // resp may be an array or { data: [...] } or parent objects with .categories
        const raw: any[] = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.categories) ? resp.categories : []));

        const flat: any[] = [];

        if (raw.length > 0) {
          const first = raw[0];

          if (first && Array.isArray(first.categories)) {
            // raw is array of parent objects; convert parent + children to flat categories
            raw.forEach((parentObj: any) => {
              // push parent as top-level (parent_id may be 0 or undefined)
              flat.push({
                id: Number(parentObj.id),
                name: String(parentObj.name ?? ''),
                parent_id: Number(parentObj.parent_id ?? 0),
                parent: undefined,
                slug: parentObj.slug ?? undefined
              });

              (parentObj.categories ?? []).forEach((child: any) => {
                flat.push({
                  id: Number(child.id),
                  name: String(child.name ?? ''),
                  parent_id: Number(child.parent_id ?? parentObj.id ?? 0),
                  parent: { id: Number(parentObj.id), name: String(parentObj.name ?? '') } as ParentCategory,
                  // child may have its own slug; fallback to parent's slug if child.slug missing
                  slug: child.slug ?? parentObj.slug ?? undefined
                });
              });
            });
          } else {
            // raw is likely flat list of categories already
            raw.forEach((c: any) => {
              flat.push({
                id: Number(c.id),
                name: String(c.name ?? ''),
                parent_id: Number(c.parent_id ?? 0),
                parent: c.parent ? { id: Number(c.parent.id), name: String(c.parent.name ?? '') } : undefined,
                slug: c.slug ?? undefined
              });
            });
          }
        }

        // dedupe by id (keep first)
        const map = new Map<number, any>();
        flat.forEach((c) => {
          if (!map.has(c.id)) map.set(c.id, c);
        });
        const unique = Array.from(map.values());

        if (mounted) {
          setCategories(unique);
        }

        // load products cho gợi ý search
        const productData = await fetchProducts();
        if (mounted) {
          setProducts(productData || []);
        }
      } catch (err: any) {
        console.error('Failed to load categories in Header:', err);
        if (mounted) {
          setCategoriesError(err?.message || 'Không lấy được danh mục');
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
          setLoadingProducts(false);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Hàm bỏ dấu tiếng Việt + lowercase để search linh hoạt
  const normalizeText = (value?: string | null) =>
    (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Gợi ý sản phẩm ngay khi gõ (không chờ debounce), tối đa 8 sản phẩm
  const suggestedProducts = useMemo(() => {
    if (loadingProducts) return [];
    if (searchInput.trim() === '') return [];

    const normalizedQuery = normalizeText(searchInput);
    const tokens = normalizedQuery
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const matches = products.filter((p) => {
      const haystack = [
        normalizeText(p.name),
        normalizeText((p as any).description),
      ]
        .filter(Boolean)
        .join(' ');

      return tokens.every((token) => haystack.includes(token));
    });

    return matches.slice(0, 8);
  }, [products, searchInput, loadingProducts]);

  // Build grouped categories: top-level parents with their children
  const groupedCategories = (() => {
    if (!categories || categories.length === 0) return [];
    // Top-level parents: parent_id === 0 or falsy
    // const parents = categories.filter((c) => !c.parent_id || Number(c.parent_id) === 0);
    // sort alphabetically
    // parents.sort((a, b) => (String(a.name || '').localeCompare(String(b.name || ''))));

    return categories.map((parent) => ({
      parent,
      children: categories.filter((c) => Number(c.parent_id) === Number(parent.id)).sort((a, b) => (String(a.name || '').localeCompare(String(b.name || '')))),
    }));
  })();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
              <img src="/images/logo.png" alt="QAI STORE" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col leading-tight">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-brand-blue transition">
                QAI STORE
              </h1>
              <p className="text-[11px] sm:text-sm text-gray-400 group-hover:text-gray-500 transition">
                SHOP TÀI KHOẢN
              </p>
            </div>
          </Link>

          {/* Center - Search (Desktop/Tablet) */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="hidden md:flex items-center flex-1 max-w-xl mx-2 lg:mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm tài khoản, khóa học, phần mềm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-12 py-3 w-full rounded-lg border-gray-200 bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
              />
              {suggestedProducts.length > 0 && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                  {suggestedProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        const name = product.name || '';
                        setSearchInput(name);
                        setDebouncedSearchInput(name);
                        router.push(`/products/${product.id}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-800 line-clamp-1">
                        {product.name}
                      </span>
                      {(product as any).durations?.[0]?.price && (
                        <span className="text-xs text-gray-500">
                          {(product as any).durations[0].price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <Button
                type="button"
                disabled
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-blue/60 text-white p-2 rounded-md cursor-default"
              >
                <Search className="w-4 h-4 text-white opacity-80" />
              </Button>
            </div>
          </form>

          {/* Right - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
            {/* Location (Desktop only) */}
            <div className="hidden xl:flex items-center gap-2 text-gray-800 text-sm">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <div className="leading-tight">
                <p className="text-xs text-gray-500">Địa Chỉ</p>
                <p className="font-medium">96 Ngô Tất Thành</p>
              </div>
            </div>

            {/* Phone (Desktop only) */}
            <div className="hidden xl:flex items-center gap-2 text-gray-800 text-sm">
              <Phone className="w-4 h-4 text-brand-blue" />
              <div className="leading-tight">
                <p className="text-xs text-gray-500">Hotline</p>
                <p className="font-medium">038.966.0305</p>
              </div>
            </div>

            {/* Cart */}
            <Button
              variant="ghost"
              onClick={handleCartClick}
              className="relative text-gray-800 hover:bg-gray-100 p-2 sm:p-3 rounded-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="ml-2 hidden sm:inline">Giỏ hàng</span>
              {realtimeCartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {realtimeCartCount > 99 ? "99+" : realtimeCartCount}
                </Badge>
              )}
            </Button>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-800 hover:bg-gray-100 p-2 rounded-lg">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs bg-gray-100 text-gray-800 border border-gray-300">
                        {user.name?.charAt(0)?.toUpperCase?.() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 hidden md:inline text-sm max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white/95 backdrop-blur-md border-white/20 text-gray-800 shadow-xl rounded-xl"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex items-center px-4 py-3 hover:bg-green-50 rounded-lg">
                      <Wallet className="mr-3 h-4 w-4 text-green-600" />
                      <div>
                        <span>Ví của tôi</span>
                        <div className="text-xs text-green-600 font-medium">{formatCoins(user.coins)}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/accounts" className="flex items-center px-4 py-3 hover:bg-purple-50 rounded-lg">
                      <Shield className="mr-3 h-4 w-4 text-purple-600" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-ranking" className="flex items-center px-4 py-3 hover:bg-pink-50 rounded-lg">
                      <Crown className="mr-3 h-4 w-4 text-purple-600" />
                      <span>Hạng của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-vouchers" className="flex items-center px-4 py-3 hover:bg-amber-50 rounded-lg">
                      <Ticket className="mr-3 h-4 w-4 text-amber-600" />
                      <span>Voucher của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg">
                      <ShoppingCart className="mr-3 h-4 w-4 text-blue-600" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center px-4 py-3 hover:bg-pink-50 rounded-lg">
                      <Heart className="mr-3 h-4 w-4 text-purple-600" />
                      <span>Yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center px-4 py-3 border-t hover:bg-red-100 text-red-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="text-gray-800 hover:bg-gray-100 text-sm rounded-lg px-4 py-2">
                  <User className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="lg:hidden text-gray-800 hover:bg-gray-100 p-2 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search (below top bar) */}
        <div className="md:hidden pb-3">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm tài khoản, khóa học, phần mềm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-3 py-2 w-full rounded-lg border-gray-200 bg-white text-gray-800 placeholder-gray-500"
              />
              {suggestedProducts.length > 0 && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                  {suggestedProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        const name = product.name || '';
                        setSearchInput(name);
                        setDebouncedSearchInput(name);
                        router.push(`/products/${product.id}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-800 line-clamp-1">
                        {product.name}
                      </span>
                      {(product as any).durations?.[0]?.price && (
                        <span className="text-xs text-gray-500">
                          {(product as any).durations[0].price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center h-12 gap-2 xl:gap-6">
          {navigation.map((item) => (
            <div key={item.name} className="relative group">
              {item.name === "Danh mục sản phẩm" ? (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-brand-blue font-medium text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition flex items-center"
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-300" />
                  </Link>

                  {/* Mega menu */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-[min(100vw-24px,1000px)] bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 mt-2">
                    <div className="p-6">
                      {loadingCategories ? (
                        <div className="py-10 text-center text-gray-500">Đang tải danh mục...</div>
                      ) : categoriesError ? (
                        <div className="py-10 text-center text-red-500">Không tải được danh mục</div>
                      ) : (
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                          {groupedCategories.slice(0, 6).map(({ parent, children }) => (
                            <div key={parent.id} className="space-y-3">
                              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center shadow-sm">
                                  <span className="text-white text-sm">📂</span>
                                </div>
                                <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">
                                  {parent.name}
                                </h3>
                              </div>

                              <ul className="space-y-1">
                                {children?.length > 0 ? (
                                  children.slice(0, 5).map((child) => (
                                    <li key={child.id}>
                                      <Link
                                        href={`/products?category=${encodeURIComponent(child.slug ?? String(child.id))}`}
                                        className="block text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 px-2 py-1.5 rounded-md transition hover:translate-x-1"
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))
                                ) : (
                                  <li>
                                    <Link
                                      href={`/products?category=${encodeURIComponent(parent.slug ?? String(parent.id))}`}
                                      className="block text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 px-2 py-1.5 rounded-md transition hover:translate-x-1"
                                    >
                                      {parent.name}
                                    </Link>
                                  </li>
                                )}

                                {children?.length > 5 && (
                                  <li>
                                    <Link
                                      href={`/products?category=${encodeURIComponent(parent.slug ?? String(parent.id))}`}
                                      className="block text-xs text-blue-600 font-medium px-2 py-1.5 hover:text-blue-700"
                                    >
                                      + {children.length - 5} mục khác
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                        <p className="text-gray-500 text-sm hidden sm:block">
                          Khám phá hàng trăm sản phẩm chất lượng
                        </p>
                        <div className="flex gap-3">
                          <Link href="/products">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white text-xs px-4 py-2 shadow-md"
                            >
                              Xem tất cả
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-4 py-2"
                          >
                            Hỗ trợ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-brand-blue font-medium text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition flex items-center"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile/Tablet Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-3 sm:px-4 py-5 space-y-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 text-gray-700 hover:text-brand-blue font-medium text-base rounded-lg hover:bg-gray-100 px-4 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {!user && (
                <Link
                  href="/login"
                  className="block py-3 text-gray-700 font-medium text-base rounded-lg hover:bg-gray-100 px-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}

              {/* Top-level categories on mobile */}
              {!loadingCategories && categories?.length > 0 && (
                <>
                  <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 px-4">
                    Danh mục
                  </div>
                  {categories
                    .filter((c) => !c.parent_id || Number(c.parent_id) === 0)
                    .slice(0, 10)
                    .map((top) => (
                      <Link
                        key={top.id}
                        href={`/products?category=${encodeURIComponent(top.slug ?? String(top.id))}`}
                        className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {top.name}
                      </Link>
                    ))}
                </>
              )}
            </nav>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-gray-800">
                <MapPin className="w-4 h-4 text-brand-blue" />
                <div>
                  <p className="text-xs text-gray-500">Vận chuyển</p>
                  <p className="font-medium text-sm">31 Nguyễn Đình Khởi</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-800">
                <Phone className="w-4 h-4 text-brand-blue" />
                <div>
                  <p className="text-xs text-gray-500">Hotline/Zalo</p>
                  <p className="font-medium text-sm">0389.66.0305</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

  );
}
