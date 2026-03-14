"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  CreditCard,
  Heart,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, calculateSavings, createCartItem } from "@/lib/utils";
import { getCollaboratorProductById } from "@/lib/api";
import { checkRole } from "@/lib/api";
import DOMPurify from "dompurify";

export default function CollaboratorProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user, sessionId } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const productId = parseInt(params.id as string, 10);

  const selectedPrice = Array.isArray(product?.durations)
    ? product.durations.find((d: any) => d.id === selectedDuration)
    : null;

  const discountPct = Math.min(100, Math.max(0, Number(product?.discount_percent) || 0));
  const hasDiscount = discountPct > 0;
  const displayPrice = selectedPrice
    ? (discountPct > 0 ? Math.round(selectedPrice.price * (1 - discountPct / 100)) : selectedPrice.price)
    : 0;
  const displayOriginalPrice = selectedPrice
    ? (discountPct > 0 ? selectedPrice.price : (selectedPrice.original_price ?? selectedPrice.price))
    : 0;

  const categoryLabel = product?.category && typeof product.category === "object"
    ? (product.category.name ?? "")
    : String(product?.category ?? "");

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
    if (!sessionId || !isAuthorized || !productId) return;
    const load = async () => {
      try {
        const data = await getCollaboratorProductById(productId, sessionId);
        const allDurations = Array.isArray(data.durations) ? data.durations : [];
        const featured = allDurations.filter(
          (d: any) => (d.featured as number) === 1 || d.featured === true
        );
        const durationsToUse = featured.length ? featured : allDurations;
        setProduct({ ...data, durations: durationsToUse });
        if (durationsToUse.length) setSelectedDuration(durationsToUse[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, sessionId, isAuthorized]);

  const handleAddToCart = async () => {
    if (!user || !sessionId) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm vào giỏ.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    if (!product || !selectedPrice) return;
    try {
      const cartItem = createCartItem(product, selectedPrice, user.id);
      addItem(cartItem);
      toast({
        title: "Đã thêm vào giỏ!",
        description: `${product.name} (${selectedPrice.name}) - giá CTV.`,
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = async () => {
    if (!sessionId || !user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để mua hàng.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    if (!product || !selectedPrice) return;
    try {
      const cartItem = createCartItem(product, selectedPrice, user.id);
      addItem(cartItem);
      toast({
        title: "Chuyển đến thanh toán",
        description: `${product.name} - ${selectedPrice.name}`,
      });
      router.push("/checkout?mode=buynow");
    } catch {
      toast({
        title: "Lỗi",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm yêu thích.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    if (!product) return;
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id, product.name);
      toast({ title: "Đã xóa khỏi yêu thích" });
    } else {
      addToFavorites(product.id, product.name);
      toast({ title: "Đã thêm vào yêu thích!" });
    }
  };

  if (!user) return null;
  if (isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang kiểm tra quyền...</p>
      </div>
    );
  }
  if (!isAuthorized) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
          <Button asChild>
            <Link href="/collaborator/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách CTV
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
      <Header />

      <div className="bg-gray-50 border-b border-gray-200 pt-20">
        <div className="container-max section-padding py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600">Trang chủ</Link>
            <span>›</span>
            <Link href="/collaborator" className="hover:text-emerald-600">Kênh CTV</Link>
            <span>›</span>
            <Link href="/collaborator/products" className="hover:text-emerald-600">Sản phẩm</Link>
            <span>›</span>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-max section-padding py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="overflow-hidden p-10">
            <div
              className="h-96 flex items-center justify-center relative"
              style={{ backgroundColor: product.color || "#f0fdf4" }}
            >
              <img
                className="max-h-full w-auto object-contain"
                src={`https://www.taikhoangpremium.shop/images/products/${product.image}`}
                alt={product.name}
              />
            </div>
          </Card>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-emerald-100 text-emerald-800">Giá CTV</Badge>
              <Badge variant="secondary">{categoryLabel}</Badge>
              {hasDiscount && (
                <Badge className="bg-rose-500 text-white">Giảm {discountPct}%</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating ?? 0}</span>
                <span className="text-gray-500">({product.reviews_count ?? 0} đánh giá)</span>
              </div>
              <Badge className="bg-green-500 text-white">Có sẵn</Badge>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Chọn thời hạn (giá CTV):</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(product.durations) &&
                  product.durations.map((duration: any) => (
                    <button
                      key={duration.id}
                      onClick={() => setSelectedDuration(duration.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedDuration === duration.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium">{duration.name}</div>
                      <div className="text-lg font-bold text-emerald-600">
                        {formatPrice(
                          discountPct > 0
                            ? Math.round(duration.price * (1 - discountPct / 100))
                            : duration.price
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatPrice(displayPrice)}
                  </span>
                  {displayOriginalPrice > displayPrice && (
                    <span className="text-gray-500 line-through ml-3">
                      {formatPrice(displayOriginalPrice)}
                    </span>
                  )}
                </div>
                {displayOriginalPrice > displayPrice && (
                  <Badge className="bg-red-500 text-white">
                    Tiết kiệm {calculateSavings(displayOriginalPrice, displayPrice)}%
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-semibold"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Mua ngay - {formatPrice(displayPrice)}
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToggleFavorite}
                    className={`h-12 px-4 ${
                      isFavorite(product.id) ? "bg-red-50 border-red-200 text-red-600" : ""
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {product.description && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Mô tả sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description),
                }}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/collaborator/products" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách sản phẩm CTV
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
