"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Grid, List, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { ProductBase } from "@/lib/products";
import {
  fetchCategories,
  fetchCollaboratorProducts,
  fetchCollaboratorProductsPaginated,
  type ProductsMeta,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { checkRole } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Category } from "@/types/category.interface";

const PER_PAGE = 12;

function CollaboratorProductsContent() {
  const router = useRouter();
  const { user, sessionId } = useAuth();
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [allProducts, setAllProducts] = useState<ProductBase[]>([]);
  const [filterSlug, setFilterSlug] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsMeta, setProductsMeta] = useState<ProductsMeta | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setIsCheckingRole(false);
        return;
      }
      try {
        const roleData = await checkRole(sessionId);
        if (roleData.role !== "collaborator") {
          router.replace("/");
          return;
        }
        setIsAuthorized(true);
      } catch {
        router.replace("/login");
      } finally {
        setIsCheckingRole(false);
      }
    };
    run();
  }, [sessionId, router]);

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
          raw.forEach((parentObj: any) => {
            const parent = {
              id: Number(parentObj.id),
              name: String(parentObj.name ?? ""),
              parent_id: Number(parentObj.parent_id ?? 0),
              slug: parentObj.slug ?? undefined,
            };
            parents.push(parent);
            flatAll.push(parent);
            (parentObj.categories ?? []).forEach((child: any) => {
              flatAll.push({
                id: Number(child.id),
                name: String(child.name ?? ""),
                parent_id: Number(parentObj.id ?? 0),
                slug: child.slug ?? undefined,
              });
            });
          });
        } else {
          raw.forEach((c: any) => {
            flatAll.push({
              id: Number(c.id),
              name: String(c.name ?? ""),
              parent_id: Number(c.parent_id ?? 0),
              slug: c.slug ?? undefined,
            });
          });
          flatAll.forEach((c: any) => {
            if (!c.parent_id || Number(c.parent_id) === 0) {
              parents.push({
                id: Number(c.id),
                name: String(c.name ?? ""),
                parent_id: Number(c.parent_id ?? 0),
                slug: c.slug ?? undefined,
              });
            }
          });
        }
        const map = new Map<number, any>();
        flatAll.forEach((x) => {
          if (!map.has(x.id)) map.set(x.id, x);
        });
        if (mounted) {
          setFlatCategories(Array.from(map.values()));
          setCategories(parents);
        }
      } catch (err) {
        if (mounted) {
          setFlatCategories([]);
          setCategories([]);
        }
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchQuery, filterSlug]);

  useEffect(() => {
    let mounted = true;
    if (!sessionId || !isAuthorized) return;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        if (filterSlug) {
          const data = await fetchCollaboratorProducts(sessionId);
          if (!mounted) return;
          setAllProducts(Array.isArray(data) ? data : []);
          setProductsMeta(null);
          const slug = String(filterSlug).toLowerCase();
          const filtered = (Array.isArray(data) ? data : []).filter(
            (p: ProductBase) =>
              String((p as any)?.category?.slug ?? (p as any)?.slug ?? "").toLowerCase() === slug
          );
          setProducts(filtered);
        } else {
          const res = await fetchCollaboratorProductsPaginated(
            {
              page: currentPage,
              perPage: PER_PAGE,
              categoryId: selectedCategory === "all" ? undefined : selectedCategory,
              search: debouncedSearchQuery.trim() || undefined,
            },
            sessionId
          );
          if (!mounted) return;
          setProducts(res.data ?? []);
          setProductsMeta(res.meta ?? null);
          setAllProducts([]);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Lỗi tải sản phẩm");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, [currentPage, selectedCategory, debouncedSearchQuery, filterSlug, sessionId, isAuthorized]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDebouncedSearchQuery("");
      return;
    }
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 1000);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const raw = searchParams?.get?.("category");
    const search = searchParams?.get?.("search");
    if (search) setSearchQuery(search);
    if (!raw) {
      setSelectedCategory("all");
      setFilterSlug(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      setSelectedCategory(parsed);
      setFilterSlug(null);
      return;
    }
    if (raw === "all") {
      setSelectedCategory("all");
      setFilterSlug(null);
      return;
    }
    setSelectedCategory("all");
    setFilterSlug(raw);
  }, [searchParams?.toString(), flatCategories]);

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) return;
    if (filterSlug) {
      const slug = String(filterSlug).toLowerCase();
      const filtered = allProducts.filter(
        (p) =>
          String((p as any)?.category?.slug ?? (p as any)?.slug ?? "").toLowerCase() === slug
      );
      setProducts(filtered);
      return;
    }
    if (selectedCategory === "all") {
      setProducts(allProducts);
      return;
    }
    const catId = Number(selectedCategory);
    const filtered = allProducts.filter((p) => {
      const cat = (p as any).category;
      if (!cat) return false;
      if (typeof cat === "object") {
        const self = typeof cat.id === "number" && cat.id === catId;
        const parent = typeof (cat as any).parent_id === "number" && (cat as any).parent_id === catId;
        return self || parent;
      }
      return parseInt(String(cat), 10) === catId;
    });
    setProducts(filtered);
  }, [selectedCategory, allProducts, filterSlug]);

  const handleSelectCategoryById = (id: number | "all") => {
    setFilterSlug(null);
    setSelectedCategory(id);
    const url = id === "all" ? "/collaborator/products" : `/collaborator/products?category=${id}`;
    if (typeof window !== "undefined") window.history.pushState({}, "", url);
  };

  function sortProducts(list: ProductBase[], sortBy: string): ProductBase[] {
    return [...list].sort((a, b) => {
      const getPrice = (p: ProductBase) => p.durations?.[0]?.price ?? 0;
      switch (sortBy) {
        case "price-low":
          return getPrice(a) - getPrice(b);
        case "price-high":
          return getPrice(b) - getPrice(a);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return (b.reviews ?? 0) - (a.reviews ?? 0);
      }
    });
  }

  const [sortBy, setSortBy] = useState("popular");
  const normalizeText = (v?: string | null) =>
    (v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];
    if (debouncedSearchQuery.trim() !== "" && filterSlug) {
      const tokens = normalizeText(debouncedSearchQuery).split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const hay = [normalizeText(p.name), normalizeText(p.description)].filter(Boolean).join(" ");
        return tokens.every((t) => hay.includes(t));
      });
    }
    return sortProducts(list, sortBy);
  }, [products, debouncedSearchQuery, sortBy, filterSlug]);

  const displayProducts = useMemo(() => {
    if (filterSlug && filteredAndSortedProducts.length > PER_PAGE) {
      const start = (currentPage - 1) * PER_PAGE;
      return filteredAndSortedProducts.slice(start, start + PER_PAGE);
    }
    return filteredAndSortedProducts;
  }, [filteredAndSortedProducts, currentPage, filterSlug]);

  const paginationTotal = productsMeta?.total ?? (filterSlug ? products.length : 0);
  const paginationLastPage =
    productsMeta?.last_page ?? Math.max(1, Math.ceil(products.length / PER_PAGE));
  const canPrev = currentPage > 1;
  const canNext = currentPage < paginationLastPage;

  if (!user) return null;
  if (isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang kiểm tra quyền...</p>
      </div>
    );
  }
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white py-16">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-2">
              Giá cộng tác viên
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Sản phẩm cho CTV
              <span className="block bg-gradient-to-r from-yellow-200 to-emerald-200 bg-clip-text text-transparent p-1">
                Giá riêng cộng tác viên
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Danh sách sản phẩm với giá dành riêng cho cộng tác viên. Không dùng chung với trang khách hàng.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-max section-padding">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <Grid3X3 className="w-5 h-5 mr-2" />
                    Danh mục
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">Lọc theo danh mục</p>
                </div>
                <div className="p-6 space-y-3">
                  {loadingCategories ? (
                    <div className="text-sm text-gray-500">Đang tải...</div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSelectCategoryById("all")}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                          selectedCategory === "all"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-semibold text-gray-800">Tất cả danh mục</span>
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategoryById(cat.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedCategory === cat.id
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-semibold text-gray-800">{cat.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải sản phẩm...</div>
              ) : displayProducts.length > 0 ? (
                <>
                  <p className="text-gray-600">
                    Hiển thị {displayProducts.length} / {paginationTotal} sản phẩm
                  </p>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
                        : "space-y-4"
                    }
                  >
                    {displayProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isListView={viewMode === "list"}
                        size="medium"
                        showFeatures={true}
                        showFavoriteButton={true}
                        detailPath="/collaborator/products"
                      />
                    ))}
                  </div>
                  {paginationLastPage > 1 && (
                    <div className="flex justify-center gap-2 flex-wrap pt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrev}
                      >
                        Trang trước
                      </Button>
                      <span className="text-sm text-gray-600 px-2">
                        Trang {currentPage} / {paginationLastPage}
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
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <p className="text-gray-600">Chưa có sản phẩm nào.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleSelectCategoryById("all")}
                  >
                    Xem tất cả
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

export default function CollaboratorProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      }
    >
      <CollaboratorProductsContent />
    </Suspense>
  );
}
