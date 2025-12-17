"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, ShoppingCart, Shield, Clock, Users, Heart, MessageCircle, ThumbsUp, CreditCard, Check, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductFeatures from './ProductFeatures';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, calculateSavings, createCartItem } from '@/lib/utils';
import { fetchProductById } from '@/lib/api';
import { Review } from '@/types/reviews.interface';
import { fetchReviews, postReview } from '@/lib/api';
import { addToCart } from '@/lib/api';
import DOMPurify from 'dompurify';

// interface Review {
//   id: number;
//   productId: number;
//   userId: string;
//   userName: string;
//   userAvatar: string;
//   rating: number;
//   comment: string;
//   date: string;
//   helpful: number;
// }
// export async function generateStaticParams() {
//   const productIds = ["1", "2", "3", "4", "5", "6"]; // hoặc lấy từ DB/API trong build-time

//   return productIds.map((id) => ({ id }));
// }

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { sessionId } = useAuth();
  const productId = parseInt(params.id as string);

  // Get product from centralized data

  const selectedPrice = Array.isArray(product?.durations)
    ? product.durations.find((d: any) => d.id === selectedDuration)
    : null;

  const getCategoryLabel = (cat: any): string => {
    if (!cat) return '';
    if (typeof cat === 'object') return cat.name ?? '';
    return String(cat);
  };

  const categoryLabel = getCategoryLabel(product?.category);

  //hiển thị chi tiết sản phẩm
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
        if (data.durations?.length) {
          setSelectedDuration(data.durations[0].id);
        }
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  //hiển thị danh sách review product
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchReviews(productId);
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    loadReviews();
  }, [productId]);


  const handleAddToCart = async () => {
    if (!user || !sessionId) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    if (!product || !selectedPrice) return;

    try {
      const cartItem = createCartItem(product, selectedPrice, user.id);

      // // 🟢 Gọi API thêm vào giỏ
      // const addedItem = await addToCart(cartItem, sessionId);

      // 🟢 Cập nhật state context giỏ hàng
      addItem(cartItem);

      toast({
        title: "Đã thêm vào giỏ hàng!",
        description: `${product.name} (${selectedPrice.name}) đã được thêm vào giỏ hàng.`,
      });
    } catch (error) {
      toast({
        title: "Lỗi khi thêm vào giỏ hàng",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  const handleBuyNow = async () => {

    if (!sessionId || !user) {
      toast({
        title: 'Phiên hết hạn',
        description: 'Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      return
    }

    if (!product || !selectedPrice) return;

    try {
      const cartItem = createCartItem(product, selectedPrice, user.id);

      // 🟢 Gọi API thêm vào giỏ
      // const addedItem = await addToCart(cartItem, sessionId);

      // 🟢 Cập nhật state context giỏ hàng
      // sessionStorage.setItem('qai-store-buy-now-item', JSON.stringify(cartItem));
      addItem(cartItem);


      toast({
        title: "Chuyển đến thanh toán",
        description: `Đang xử lý ${product.name} - ${selectedPrice.name}`,
      });

      router.push('/checkout?mode=buynow');

    } catch (error) {
      toast({
        title: "Lỗi khi thêm vào giỏ hàng",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
      console.error(error);
    };
  }


  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm vào danh sách yêu thích.",
        variant: "destructive",
      });
      return;
    }

    if (!product || !selectedPrice) return;

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

  const getFeatureDescription = (feature: string): string => {
    const descriptions: { [key: string]: string } = {
      'Unlimited movies': 'Xem phim không giới hạn với chất lượng 4K',
      'Multiple devices': 'Sử dụng trên nhiều thiết bị cùng lúc',
      'Offline downloads': 'Tải về xem offline mọi lúc mọi nơi',
      'No ads': 'Không có quảng cáo làm gián đoạn',
      'Premium music': 'Nhạc chất lượng cao, playlist không giới hạn',
      'AI features': 'Tính năng AI tiên tiến và thông minh',
      'Cloud sync': 'Đồng bộ dữ liệu trên cloud an toàn',
      'Template premium': 'Hàng nghìn template chuyên nghiệp',
      'Xóa phông': 'Công cụ xóa phông tự động bằng AI',
      'Magic Resize': 'Thay đổi kích thước thiết kế tự động',
      'Brand Kit': 'Bộ công cụ quản lý thương hiệu',
      'Tất cả ứng dụng': 'Truy cập tất cả phần mềm Adobe',
      'Cloud storage': 'Lưu trữ đám mây 100GB',
      'Font premium': 'Hàng nghìn font chữ đẹp',
      'Stock photos': 'Thư viện ảnh stock miễn phí'
    };
    return descriptions[feature] || 'Tính năng premium chất lượng cao';
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để đánh giá sản phẩm.",
        variant: "destructive",
      });
      return;
    }

    if (!newReview.comment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung đánh giá.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      const reviewData = {
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
        rating: newReview.rating,
        comment: newReview.comment,
        product_id: product.id,
      };

      const newPostedReview = await postReview(productId, reviewData);
      setReviews(prev => [newPostedReview, ...prev]);
      setNewReview({ rating: 5, comment: '' });

      toast({
        title: "Đánh giá thành công!",
        description: "Cảm ơn bạn đã đánh giá sản phẩm.",
      });
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 pt-20">
        <div className="container-max section-padding py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push('/')}
              className="hover:text-brand-blue transition-colors"
            >
              Trang chủ
            </button>
            <span>›</span>
            <button
              onClick={() => router.push(`/products?category=${encodeURIComponent(categoryLabel)}`)}
              className="hover:text-brand-blue transition-colors"
            >
              {categoryLabel === 'Streaming' && 'Giải trí & Streaming'}
              {categoryLabel === 'Music' && 'Âm nhạc'}
              {categoryLabel === 'AI Tools' && 'Công cụ AI'}
              {categoryLabel === 'Design' && 'Thiết kế & Sáng tạo'}
              {categoryLabel === 'Productivity' && 'Năng suất & Công việc'}
              {!['Streaming', 'Music', 'AI Tools', 'Design', 'Productivity'].includes(categoryLabel) && 'Sản phẩm'}
            </button>
            <span>›</span>
            <span className="text-gray-800 font-medium">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-max section-padding py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden p-10">
              <div
                className="h-96 flex items-center justify-center relative"
                style={{ backgroundColor: product.color }}
              >
                <img className='text-8xl h-1/2 w-1/2 object-contain' src={`https://www.taikhoangpremium.shop/images/products/${product.image}`}></img>
              </div>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">{categoryLabel}</Badge>
              <h1 className="text-3xl font-bold text-brand-charcoal mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews_count} đánh giá)</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  Có sẵn
                </Badge>
              </div>
              {/* <p className="text-gray-600 text-lg leading-relaxed mb-4"></p> */}



              {/* Key Benefits */}
              {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-brand-charcoal mb-2">✨ Điểm nổi bật:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-emerald rounded-full"></div>
                    <span className="text-sm text-gray-700">Giao hàng tức thì 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-emerald rounded-full"></div>
                    <span className="text-sm text-gray-700">Bảo hành {product.warranty}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-emerald rounded-full"></div>
                    <span className="text-sm text-gray-700">Hỗ trợ kỹ thuật miễn phí</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-emerald rounded-full"></div>
                    <span className="text-sm text-gray-700">Đổi trả trong 7 ngày</span>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Duration Selection */}
            <div>
              <h3 className="font-semibold text-brand-charcoal mb-3">Chọn thời hạn:</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(product.durations) && product.durations.map((duration: any) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedDuration === duration.id
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-medium">{duration.name}</div>
                    <div className="text-lg font-bold text-brand-emerald">
                      {formatPrice(duration.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-brand-emerald/10 to-brand-blue/10 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-brand-emerald">
                    {formatPrice(selectedPrice?.price || 0)}
                  </span>
                  {selectedPrice?.originalPrice && (
                    <span className="text-gray-500 line-through ml-3">
                      {formatPrice(selectedPrice.originalPrice)}
                    </span>
                  )}
                </div>
                {selectedPrice?.originalPrice && (
                  <Badge className="bg-red-500 text-white">
                    Tiết kiệm {calculateSavings(selectedPrice.originalPrice, selectedPrice.price)}%
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-brand-emerald to-brand-blue hover:from-brand-emerald/90 hover:to-brand-blue/90 text-white h-12 text-lg font-semibold"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Mua ngay - {formatPrice(selectedPrice?.price || 0)}
                </Button>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 h-12 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToggleFavorite}
                    className={`h-12 px-4 ${isFavorite(product.id)
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="features">Chi tiết tính năng</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
            <TabsTrigger value="warranty">Chính sách</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border-b">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r text-black from-brand-purple to-brand-blue bg-clip-text text-transparent flex items-center">
                  <p className='text-black'>🔥 Tính năng toàn diện</p>
                </CardTitle>
                <p className="text-gray-600 mt-2">Khám phá tất cả những gì bạn nhận được với sản phẩm này</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* What's Included */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl">📦</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Thông tin sản phẩm</h3>
                  </div>
                  <div
                    className="
    prose prose-gray max-w-none
    text-sm sm:text-base lg:text-lg
    leading-relaxed sm:leading-7
    mb-4

    /* Media inside description */
    [&_img]:max-w-full
    [&_img]:h-auto
    [&_img]:rounded-lg
    [&_img]:my-4

    [&_iframe]:w-full
    [&_iframe]:aspect-video
    [&_iframe]:rounded-lg
    [&_iframe]:my-4

    /* Table / code safety */
    [&_table]:block
    [&_table]:overflow-x-auto
    [&_pre]:overflow-x-auto
  "
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />


                </div>

                {/* System Requirements */}
                {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-xl">⚙️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Yêu cầu hệ thống</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm p-5 rounded-lg border border-blue-200/50 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Thiết bị được hỗ trợ
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span>Windows 10/11, macOS 10.15+</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span>iOS 13+, Android 8.0+</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span>Smart TV, Gaming Console</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span>Web Browser (Chrome, Safari, Firefox)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm p-5 rounded-lg border border-blue-200/50 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                        Kết nối internet
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                          <span>Tối thiểu: 5 Mbps</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                          <span>Đề xuất: 25 Mbps (4K)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                          <span>Ổn định cho streaming</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                          <span>Hỗ trợ wifi & di động</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div> */}

                {/* Usage Guide */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-100 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <span className="text-white text-lg sm:text-xl">📋</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      Hướng dẫn sử dụng
                    </h3>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      {
                        step: 1,
                        color: "from-blue-500 to-blue-600",
                        title: "Nhận thông tin tài khoản",
                        desc:
                          "Sau khi thanh toán thành công, bạn sẽ nhận được tài khoản chứa đầy đủ thông tin đăng nhập và hướng dẫn chi tiết",
                      },
                      {
                        step: 2,
                        color: "from-green-500 to-green-600",
                        title: "Đăng nhập và kích hoạt",
                        desc:
                          "Sử dụng thông tin được cung cấp để đăng nhập vào dịch vụ và bắt đầu trải nghiệm ngay lập tức",
                      },
                      {
                        step: 3,
                        color: "from-purple-500 to-purple-600",
                        title: "Hỗ trợ 24/7",
                        desc:
                          "Đội ngũ hỗ trợ chuyên nghiệp luôn sẵn sàng hỗ trợ bạn qua Fanpage và Zalo mọi lúc trong ngày",
                      },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="
          flex items-start gap-3 sm:gap-4
          bg-white/80 backdrop-blur-sm
          p-4 sm:p-5 rounded-lg
          border border-purple-200/50
          transition-all duration-300
          hover:shadow-md
          sm:hover:scale-[1.02]
        "
                      >
                        {/* Step number */}
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r ${item.color}
          rounded-full flex items-center justify-center
          text-white font-bold text-sm sm:text-lg
          shadow-lg flex-shrink-0`}
                        >
                          {item.step}
                        </div>

                        {/* Content */}
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 text-base sm:text-lg mb-1 sm:mb-2">
                            {item.title}
                          </div>
                          <div className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Benefits */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-amber-100 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <span className="text-white text-lg sm:text-xl">✨</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Lợi ích đặc biệt</h3>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200/50 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Bảo mật cao</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        Tài khoản được bảo mật tuyệt đối
                      </p>
                    </div>

                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200/50 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Tốc độ cao</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        Trải nghiệm mượt mà với tốc độ tải nhanh chóng
                      </p>
                    </div>

                    <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200/50 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Hỗ trợ tận tình</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        Đội ngũ hỗ trợ nhiệt tình, chuyên nghiệp 24/7
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Add Review */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Viết đánh giá</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={`w-6 h-6 ${star <= newReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
                      <Textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                      className="w-full bg-gradient-to-r from-brand-emerald to-brand-blue hover:from-brand-emerald/90 hover:to-brand-blue/90 text-white h-12 text-lg font-semibold"
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.user_avatar} alt={review.user_name} />
                          <AvatarFallback>{review.user_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{review.user_name}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Hữu ích ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="warranty" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">

                  <ul className="space-y-2 text-gray-700">
                    <h3 className="text-lg font-semibold">Chính sách bảo hành</h3>
                    <li>• Bảo hành đầy đủ thời gian của gói kể từ ngày mua</li>
                    <li>• Hỗ trợ 24/7 qua Telegram và Zalo</li>
                    <li>• Đổi tài khoản mới hoặc fix lỗi nếu có vấn đề trong thời gian bảo hành</li>
                    <li>• Không bảo hành nếu khách hàng vi phạm chính sách của gói</li>
                    <h3 className="text-lg font-semibold">Hướng dẫn sử dụng</h3>
                    <li>• Sau khi nhận tài khoản hãy kiểm tra ngay lập tức</li>
                    <li>• Nếu có vấn đề bất thường hãy liên hệ lại Shop để được hỗ trợ.</li>
                    <li>• Sử dụng & bảo quản tài khoản theo đúng quy định</li>
                    <h3 className="text-lg font-semibold ">Đối với gói chính chủ</h3>
                    <li>• Nâng trực tiếp từ tài khoản Anh/Chị </li>
                    <li>• Sau khi nâng cấp hãy đổi toàn bộ thông tin, tài khoản sẽ do Anh/Chị quản lý, Shop sẽ không can thiệp vào tài khoản </li>
                    <h3 className="text-lg font-semibold ">Đối với gói dùng chung</h3>
                    <li>• Tài khoản Shop cấp để Anh/Chị truy cập vào sử dụng</li>
                    <li>• Không chia sẽ hoặc bán tài khoản cho bất kỳ ai</li>
                    <li>• Không thay đổi bất kỳ thông tin nào </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}