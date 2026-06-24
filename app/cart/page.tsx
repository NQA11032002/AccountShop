"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Truck, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import PageShell from '@/components/PageShell';

export default function CartPage() {
  const { items, itemsCount, totalAmount, totalSavings, updateQuantity, removeItem, clearAllCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleQuantityChange = (productId: number, durationId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Ngăn không cho giảm dưới 1
    setIsProcessing(true); // Bật trạng thái đang xử lý
    updateQuantity(productId, durationId, newQuantity);
    setIsProcessing(false); // Reset trạng thái sau khi thay đổi xong

  };


  const handleRemoveItem = (id: number, durationId: string) => {
    if (isProcessing) return; // Ngăn không cho xóa khi đang xử lý
    setIsProcessing(true); // Bật trạng thái đang xử lý
    removeItem(id, durationId);
    setIsProcessing(false); // Reset trạng thái sau khi xóa xong
  };

  const handleCheckout = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigate-to-checkout', {
        detail: { path: '/checkout' }
      }));
    }
  };

  const handleContinueShopping = () => {
    // Use Next.js navigation instead of window.location.href
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigate-to-products', {
        detail: { path: '/products' }
      }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Giỏ hàng trống
              </h1>
              <p className="text-gray-600 mb-8">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các tài khoản cao cấp của chúng tôi!
              </p>
              <Button
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-brand-charcoal to-brand-blue hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <PageShell>
      <Header />

      <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90 pb-16 pt-10">
        <section className="section-spacing-home pb-0">
          <div className="container-max section-padding">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-brand-charcoal md:text-4xl">
                  Giỏ hàng của bạn
                </h1>
                <p className="text-brand-gray/80">
                  {itemsCount} sản phẩm đang chờ thanh toán
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleContinueShopping}
                className="border-violet-200/90 bg-white text-violet-950 shadow-sm hover:bg-violet-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Sản phẩm trong giỏ ({itemsCount})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllCart}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  disabled={isProcessing}

                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </Button>
              </div>

              {items.map((item) => (
                <Card key={`${item.id}-${item.duration}`} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left block: Image + Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
                          <img
                            src={`https://www.taikhoangpremium.shop/images/products/${item.image}`}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                            {item.product_name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span>Thời hạn:</span>
                              <Badge variant="outline" className="text-xs">
                                {item.duration}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3" />
                              <span>Bảo hành {item.warranty}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right block: Price + Quantity + Remove */}
                      <div className="sm:text-right sm:flex-shrink-0 w-full sm:w-auto">
                        <div className="flex items-start justify-between sm:justify-end gap-4 mb-3">
                          <div className="sm:text-right">
                            <div className="text-base sm:text-lg font-bold text-brand-blue">
                              {formatPrice(item.price)}
                            </div>
                            {item.original_price > item.price && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(item.original_price)}
                              </div>
                            )}
                          </div>

                          {/* Remove (mobile: top-right) */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id, item.duration)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 sm:hidden"
                            disabled={isProcessing}
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.selected_duration, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isProcessing}
                              className="w-9 h-9 sm:w-8 sm:h-8 p-0"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>

                            <span className="w-10 text-center font-medium">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.selected_duration, item.quantity + 1)}
                              className="w-9 h-9 sm:w-8 sm:h-8 p-0"
                              disabled={isProcessing}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Remove (desktop) */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id, item.duration)}
                            className="hidden sm:inline-flex text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                            disabled={isProcessing}
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Tổng cộng ({item.quantity} sản phẩm):
                      </span>

                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-bold text-brand-blue">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.original_price > item.price && (
                          <div className="text-sm text-brand-emerald">
                            Tiết kiệm {formatPrice((item.original_price - item.price) * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl">Tổng đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính ({itemsCount} sản phẩm):</span>
                      <span className="font-medium">{formatPrice(totalAmount + totalSavings)}</span>
                    </div>
                    <div className="flex justify-between text-brand-emerald">
                      <span>Giảm giá:</span>
                      <span className="font-medium">{formatPrice(totalSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium text-brand-emerald">Miễn phí</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-brand-blue">{formatPrice(totalAmount)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        🎉 Bạn đã tiết kiệm được <strong>{formatPrice(totalSavings)}</strong>!
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setIsCheckingOut(true);
                      handleCheckout();
                    }}
                    disabled={isCheckingOut}
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-charcoal hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Thanh toán ngay
                  </Button>

                  {/* Security Features */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900">Cam kết của chúng tôi:</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-brand-blue" />
                        <span>Giao hàng tự động tức thì</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-brand-emerald" />
                        <span>Bảo hành theo thời hạn gói</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Hỗ trợ 24/7</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageShell>
  );
}