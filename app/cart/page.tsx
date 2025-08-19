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
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các tài khoản premium của chúng tôi!
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-10 pb-16">
        {/* Page Header */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Giỏ hàng của bạn
                </h1>
                <p className="text-blue-100">
                  {itemsCount} sản phẩm đang chờ thanh toán
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleContinueShopping}
                className="border-white text-indigo-500 hover:bg-white hover:text-brand-blue"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className={`w-20 h-20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                        <img src={`/images/products/${item.image}`} alt="Product image" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>Thời hạn:</span>
                            <Badge variant="outline" className="text-xs">
                              {item.duration}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>Bảo hành {item.warranty}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Quantity */}
                      <div className="text-right flex-shrink-0">
                        <div className="mb-3">
                          <div className="text-lg font-bold text-brand-blue">
                            {formatPrice(item.price)}
                          </div>
                          {item.original_price > item.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(item.original_price)}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.selected_duration, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isProcessing}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.selected_duration, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                            disabled={isProcessing}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>


                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id, item.duration)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                          disabled={isProcessing}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Tổng cộng ({item.quantity} sản phẩm):
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-brand-blue">
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
    </div>
  );
}