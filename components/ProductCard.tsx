"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Eye, Heart, CheckCircle, Zap, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
// import { getFeaturedDuration, formatPrice, calculateSavings, createCartItem } from '@/lib/utils';
import { ProductBase } from '@/lib/products';
import { getFeaturedDuration, formatPrice, calculateSavings, createCartItem } from '@/lib/utils';
import { FavoriteItem } from '@/types/favorite.interface';

interface ProductCardProps {
  product: ProductBase;
  isListView?: boolean;
  showFeatures?: boolean;
  showFavoriteButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ProductCard({
  product,
  isListView = false,
  showFeatures = true,
  showFavoriteButton = true,
  size = 'medium',
  className = ''
}: ProductCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  const featuredDuration = getFeaturedDuration(product.durations || []);
  const savings = calculateSavings(
    featuredDuration.original_price || featuredDuration.price,
    featuredDuration.price
  );
  const standardDurationId = featuredDuration.id.toString();

  const handleAddToCart = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    if (!product.in_stock) {
      toast({
        title: "Sản phẩm hết hàng",
        description: "Sản phẩm này hiện tại đã hết hàng.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    if (isInCart(product.id, standardDurationId)) {
      toast({
        title: "Sản phẩm đã có trong giỏ",
        description: `${product.name} đã có trong giỏ hàng của bạn.`,
      });
      setIsProcessing(false);
      return;
    }

    const cartItem = {
      ...createCartItem(product, featuredDuration, user.id),
      durationId: standardDurationId
    };

    const currentQuantity = getItemQuantity(product.id, standardDurationId);
    addItem(cartItem);

    setTimeout(() => {
      const newQuantity = getItemQuantity(product.id, standardDurationId);
      toast({
        title: currentQuantity > 0 ? 'Đã tăng số lượng!' : 'Đã thêm vào giỏ hàng!',
        description: `${product.name} (${featuredDuration.name})`,
      });
      setIsProcessing(false);
    }, 100);
  };

  const handleToggleFavorite = () => {

    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id, product.name);
      toast({
        title: "Đã xóa khỏi yêu thích",
        description: `${product.name} đã được xóa khỏi danh sách yêu thích.`,
      });
    } else {
      addToFavorites(product.id, product.name);
      toast({
        title: "Đã thêm vào yêu thích!",
        description: `${product.name} đã được thêm vào danh sách yêu thích.`,
      });
    }
  };

  // const handleBuyNow = () => {
  //   // console.log("Buy now clicked - direct checkout", { productId: product.id });

  //   if (!user) {
  //     toast({
  //       title: "Cần đăng nhập",
  //       description: "Vui lòng đăng nhập để mua hàng.",
  //       variant: "destructive",
  //     });
  //     if (typeof window !== 'undefined') {
  //       window.location.href = '/login';
  //     }
  //     return;
  //   }

  //   // Create buy now item data with featured duration
  //   const buyNowItem = {
  //     id: product.id,
  //     name: product.name,
  //     price: featuredDuration.price,
  //     originalPrice: featuredDuration.original_price || featuredDuration.price,
  //     duration: featuredDuration.name,
  //     durationId: standardDurationId,
  //     image: product.image,
  //     color: product.color || '#3B82F6',
  //     description: product.description,
  //     warranty: product.warranty || '30 ngày',
  //     quantity: 1
  //   };

  //   // Store buy now data and redirect to checkout
  //   if (typeof window !== 'undefined') {
  //     sessionStorage.setItem('qai-store-buy-now-item', JSON.stringify(buyNowItem));
  //     window.location.href = '/checkout?mode=buynow';
  //   }

  //   toast({
  //     title: "Chuyển đến thanh toán",
  //     description: `Đang xử lý ${product.name} - ${featuredDuration.name}`,
  //   });
  // };

  // Size configurations
  const sizeConfig = {
    small: {
      iconSize: 'w-12 h-12',
      textSize: 'text-lg',
      priceSize: 'text-xl',
      padding: 'p-4',
      gap: 'gap-2'
    },
    medium: {
      iconSize: 'w-14 h-14',
      textSize: 'text-xl',
      priceSize: 'text-2xl xl:text-3xl',
      padding: 'p-4 lg:p-6',
      gap: 'gap-3'
    },
    large: {
      iconSize: 'w-16 h-16',
      textSize: 'text-2xl',
      priceSize: 'text-3xl xl:text-4xl',
      padding: 'p-6 lg:p-8',
      gap: 'gap-4'
    }
  };

  const config = sizeConfig[size];

  if (isListView) {
    return (
      <Card className={`group hover:shadow-xl transition-all duration-500 border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1 flex flex-row h-auto ${className}`}>
        <CardContent className="flex-1 flex flex-row space-x-6 p-6">
          <div className="flex-shrink-0">
            <div className={`${config.iconSize} ${product.color || 'bg-gray-500'} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
              <img src={`/images/products/${product.image}`}
                alt="" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className={`${config.textSize} font-bold text-gray-900`}>{product.name}</h3>
              {showFavoriteButton && (
                <button
                  onClick={handleToggleFavorite}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorite(product.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-600 hover:text-red-500 hover:bg-red-50'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.reviews} đánh giá)</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`${config.priceSize} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
            <div className={`flex space-x-2 ${config.gap}`}>
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock || isProcessing}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang thêm...
                  </>
                ) : isInCart(product.id, standardDurationId) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Trong giỏ ({getItemQuantity(product.id, standardDurationId)})
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ
                  </>
                )}
              </Button>
              <Link href={`/products/${product.id}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl">
                  <Eye className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={`group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-[1.02] flex flex-col w-full max-w-sm mx-auto transform hover:-translate-y-1 ${className}`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Product Icon */}
      <div className="absolute top-5 left-5 z-10">
        <div
          className={`${config.iconSize} rounded-2xl flex items-center justify-center text-2xl transform group-hover:scale-110 transition-transform duration-300 bg-transparent`}
        >
          <img
            className="filter drop-shadow-sm"
            src={`/images/products/${product.image}`}
            alt={product.name}
          />
        </div>
      </div>

      {/* Status Badge */}
      {product.badge && (
        <div className="absolute top-5 right-5 z-10">
          <Badge className={`${product.badge_color} text-white px-3 py-1.5 text-xs font-bold rounded-lg shadow-md transform group-hover:scale-105 transition-transform duration-300`}>
            {product.badge}
          </Badge>
        </div>
      )}

      {/* Favorite Button */}
      {showFavoriteButton && (
        <button
          onClick={handleToggleFavorite}
          className={`absolute z-50 cursor-grab top-14 right-5 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-md  ${isFavorite(product.id)
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'
            }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Stock Status */}
      <div className="absolute top-24 right-5 z-10">
        <Badge variant={product.in_stock ? "default" : "destructive"} className="text-xs px-2 py-1 rounded-md shadow-sm">
          {product.in_stock ? (
            <><span className="mr-1">✓</span>Còn hàng</>
          ) : (
            <><span className="mr-1">⚠️</span>Hết hàng</>
          )

          }
        </Badge>

      </div>

      {/* Savings Badge */}
      {featuredDuration.original_price && savings > 0 && (
        <div className="absolute top-32 right-5 z-10">
          <Badge className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md shadow-sm">
            -{savings}%
          </Badge>
        </div>
      )}

      <CardContent className={`${config.padding} pt-20 lg:pt-24 flex flex-col relative z-10 min-h-auto justify-between`}>
        <div className="flex-grow">
          {/* Product Title */}
          <h3 className={`${config.textSize} font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2`}>
            {product.name}
          </h3>

          {/* Category */}
          <Badge variant="outline" className="w-fit mb-3 text-xs">
            {product.category.name}
          </Badge>

          {/* Description */}
          <p className="text-xs lg:text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="space-y-3">
          {/* Features Preview */}
          {showFeatures && (
            <div className="hidden lg:block">
              <div className="flex flex-wrap gap-1">
                {(product.features || []).slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200">
                    <Zap className="w-3 h-3 mr-1" />
                    {feature}
                  </span>
                ))}
                {(product.features?.length || 0) > 2 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{(product.features?.length || 0) - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 lg:w-4 lg:h-4 ${i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="ml-2 text-xs lg:text-sm text-gray-500 font-medium">
              {product.rating} ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline">
            <span className={`${config.priceSize} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              {formatPrice(featuredDuration.price)}
            </span>
            {featuredDuration.original_price && (
              <span className="ml-2 text-xs lg:text-sm text-gray-400 line-through">
                {formatPrice(featuredDuration.original_price)}
              </span>
            )}
          </div>

          {/* Duration and Warranty */}
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <div className="flex items-center text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {featuredDuration.name}
            </div>
            <Badge className="bg-green-50 text-green-600 px-2 py-1 text-xs border border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              {product.warranty}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex ${config.gap} mt-4`}>
          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock || isProcessing}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 lg:py-3 text-xs lg:text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="hidden lg:inline">Đang thêm...</span>
                <span className="lg:hidden">...</span>
              </>
            ) : isInCart(product.id, standardDurationId) ? (
              <>
                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Trong giỏ ({getItemQuantity(product.id, standardDurationId)})</span>
                <span className="lg:hidden">({getItemQuantity(product.id, standardDurationId)})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Thêm vào giỏ</span>
                <span className="lg:hidden">Thêm</span>
              </>
            )}
          </Button>
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 lg:py-3 text-xs lg:text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
              <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span className="hidden lg:inline">Chi tiết</span>
              <span className="lg:hidden">Xem</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}