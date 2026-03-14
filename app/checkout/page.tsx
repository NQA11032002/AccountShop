"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, CreditCard, Smartphone, Building2, Shield, Check, AlertCircle, User, Mail, Phone, Tag, Percent, Bitcoin, Wallet, Package, Loader2, CheckCircle2, MessageCircle, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import CoinPaymentInterface from '@/components/payment/CoinPaymentInterface';
import { Textarea } from '@/components/ui/textarea';

// Loading fallback component
function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Main checkout component that uses useSearchParams
function CheckoutPageContent() {
  const { items, itemsCount, totalAmount, totalSavings, clearAllCart, addItem } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const {
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    createOrder,
    processPayment,
    isProcessingPayment
  } = usePayment();
  const { balance, canAfford, deductCoins, refundCoins, formatCoins } = useWallet();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [paymentMode] = useState<'coins'>('coins'); // Focus on coin payments only
  const [finalOrderAmount, setFinalOrderAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái kiểm tra khi đang gửi
  const MAX_NOTES_LEN = 300;
  const [orderNotes, setOrderNotes] = useState('');

  // Buy now mode state
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    notes: orderNotes?.trim() || '',
    socialContact: ''
  });
  const [agreeTOS, setAgreeTOS] = useState(false);

  // Khi vào trang checkout: chỉ xóa mã giảm giá nếu đang có mã đã áp dụng; không có mã thì không cần xóa
  useEffect(() => {
    if (appliedDiscount) {
      removeDiscountCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy 1 lần khi vào trang
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Get effective items and totals based on mode
  const getEffectiveItems = () => {
    if (isBuyNowMode && buyNowItem) {
      return [buyNowItem];
    }
    return items;
  };

  const getEffectiveTotals = () => {
    const effectiveItems = getEffectiveItems();
    const itemsCount = effectiveItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = effectiveItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalSavings = effectiveItems.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);

    return { itemsCount, totalAmount, totalSavings };
  };

  const calculateFinalTotal = () => {
    const { totalAmount: effectiveTotalAmount } = getEffectiveTotals();

    const discountAmount = appliedDiscount
      ? (typeof appliedDiscount.discountAmount === 'number'
        ? appliedDiscount.discountAmount
        : Math.min(appliedDiscount.value ?? 0, effectiveTotalAmount))
      : 0;

    // No processing fees for coin payments - always free
    const processingFee = 0;

    const finalTotal = Math.max(0, effectiveTotalAmount - discountAmount + processingFee);

    console.log("calculateFinalTotal", {
      mode: isBuyNowMode ? 'buynow' : 'cart',
      effectiveTotalAmount,
      discountAmount,
      processingFee,
      finalTotal,
      paymentMode: 'coins'
    });

    return finalTotal;
  };

  const { itemsCount: effectiveItemsCount, totalAmount: effectiveTotalAmount } = getEffectiveTotals();

  // Chưa đăng nhập → chuyển sang trang đăng nhập (giữ returnUrl để quay lại checkout sau khi đăng nhập)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=' + encodeURIComponent('/checkout'));
    }
  }, [user, authLoading, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Đang chuyển bạn đến trang đăng nhập...</p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        </Card>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced && !isBuyNowMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-16 h-16 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Giỏ hàng trống
              </h1>
              <p className="text-gray-600 mb-8">
                Bạn cần có sản phẩm trong giỏ hàng để thanh toán.
              </p>
              <Button onClick={() => router.push('/products')} className="btn-primary px-8 py-3">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại mua sắm
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) {
      toast({
        title: "Vui lòng nhập mã giảm giá",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingDiscount(true);
    // console.log("Applying discount code", { code: discountCodeInput, total: effectiveTotalAmount });

    try {
      const success = await applyDiscountCode(discountCodeInput.trim().toUpperCase(), effectiveTotalAmount);
      if (success) {
        setDiscountCodeInput('');
      }
    } catch (error) {
      // console.error("Discount application error:", error);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleCreateOrder = async () => {
    // console.log("Creating order with customer info", { customerInfo, finalTotal: calculateFinalTotal() });
    if (isSubmitting) return; // Nếu đang submit, không làm gì thêm

    setIsSubmitting(true); // Bắt đầu quá trình submit

    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      setIsSubmitting(false);

      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin giao hàng.",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTOS) {
      setIsSubmitting(false);

      toast({
        title: "Chưa đồng ý điều khoản",
        description: "Vui lòng đọc và đồng ý với điều khoản sử dụng.",
        variant: "destructive",
      });
      return;
    }

    const effectiveItems = getEffectiveItems();
    if (!effectiveItems?.length) {
      setIsSubmitting(false);
      toast({
        title: "Không có sản phẩm",
        description: "Giỏ hàng trống hoặc không có sản phẩm để thanh toán.",
        variant: "destructive",
      });
      return;
    }

    const finalTotal = calculateFinalTotal();
    if (finalTotal <= 0) {
      setIsSubmitting(false);
      toast({
        title: "Số tiền không hợp lệ",
        description: "Tổng đơn hàng phải lớn hơn 0.",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford(finalTotal)) {
      setIsSubmitting(false);
      toast({
        title: "Số dư không đủ",
        description: `Bạn cần thêm ${formatCoins(finalTotal - balance)} để thanh toán đơn này. Vui lòng nạp thêm coins.`,
        variant: "destructive",
      });
      return;
    }

    try {

      const orderData = {
        items: effectiveItems,
        total: finalTotal,
        customerInfo,
        notes: orderNotes.trim(),         // <<< thêm dòng này
        mode: isBuyNowMode ? 'buynow' : 'cart'
      };

      const newOrderId = await createOrder(orderData);
      setOrderId(newOrderId);
      setFinalOrderAmount(finalTotal);

      // Move to payment step
      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: "Tạo đơn hàng thất bại",
        description: error.message || "Có lỗi xảy ra khi tạo đơn hàng.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Hoàn tất quá trình, cho phép người dùng nhấn nút lần nữa
    }
  };

  const handleCoinPayment = async () => {
    if (!orderId) {
      // console.error("No order ID for payment");
      return;
    }

    const finalTotal = calculateFinalTotal();

    if (!canAfford(finalTotal)) {
      toast({
        title: "Số dư không đủ",
        description: `Bạn cần thêm ${formatCoins(finalTotal - balance)} để hoàn tất giao dịch.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Deduct coins first

      const deductionSuccess = await deductCoins(
        finalTotal,
        `Thanh toán đơn hàng ${orderId}`,
        orderId
      );

      if (!deductionSuccess) {
        console.error("Coin deduction failed", { finalTotal, balance });
        toast({
          title: "Không thể trừ coins",
          description: "Có lỗi khi trừ coins từ ví của bạn.",
          variant: "destructive",
        });
        return;
      }


      // Process payment completion (this will handle delivery and order status)
      const success = await processPayment(orderId, {
        method: 'wallet',
        amount: finalTotal,
        transactionId: `WALLET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed'
      });

      if (success) {

        // Clear cart if not in buy now mode
        // if (!isBuyNowMode) {
        //   clearAllCart();
        // } else {
        //   // Clear buy now data
        //   sessionStorage.removeItem('qai-store-buy-now-item');
        // }
        clearAllCart();
        setOrderPlaced(true);
        setCurrentStep(3);

        // Redirect to orders page after delay
        // setTimeout(() => {
        //   router.push('/orders');
        // }, 3000);
      } else {

        // Refund the coins that were deducted
        refundCoins(finalTotal, `Hoàn tiền do lỗi xử lý đơn hàng ${orderId}`, orderId);

        toast({
          title: "Lỗi xử lý thanh toán",
          description: "Có lỗi trong quá trình xử lý. Coins đã được hoàn lại vào ví của bạn.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // console.error("💥 Payment failed:", error);

      // If the error occurred after coins were deducted, we should refund them
      // We can check if the error message indicates payment processing failure
      if (error.message && error.message.includes("payment") && !error.message.includes("deduction")) {
        // console.log("🔄 Refunding coins due to payment processing error", { finalTotal, orderId });
        refundCoins(finalTotal, `Hoàn tiền do lỗi thanh toán đơn hàng ${orderId}`, orderId);

        toast({
          title: "Thanh toán thất bại",
          description: "Có lỗi trong quá trình thanh toán. Coins đã được hoàn lại vào ví của bạn.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Thanh toán thất bại",
          description: error.message || "Có lỗi xảy ra trong quá trình thanh toán.",
          variant: "destructive",
        });
      }
    }
  };

  // const handleExternalPaymentSuccess = async (paymentData: any) => {
  //   console.log("External payment successful", { orderId, paymentData });

  //   try {
  //     // Update order with external payment info
  //     const success = await processPayment(orderId, paymentData);

  //     if (success) {
  //       // Clear cart if not in buy now mode
  //       if (!isBuyNowMode) {
  //         clearCart();
  //       } else {
  //         // Clear buy now data
  //         sessionStorage.removeItem('qai-store-buy-now-item');
  //       }

  //       setOrderPlaced(true);
  //       setCurrentStep(3);

  //       // Redirect to orders page after delay
  //       setTimeout(() => {
  //         router.push('/orders');
  //       }, 3000);
  //     }
  //   } catch (error: any) {
  //     console.error("Payment processing failed:", error);
  //     toast({
  //       title: "Xử lý thanh toán thất bại",
  //       description: error.message || "Có lỗi xảy ra khi xử lý thanh toán.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleExternalPaymentError = (error: string) => {
    console.error("External payment error:", error);
    toast({
      title: "Thanh toán thất bại",
      description: error,
      variant: "destructive",
    });
  };

  if (orderPlaced && currentStep === 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-700 mb-4">
                Đặt hàng thành công! 🎉
              </h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã mua hàng! Tài khoản sẽ được gửi về email của bạn. Vui lòng để ý email để nhận tài khoản!
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <p className="font-medium mb-2">Mã đơn hàng: {orderId}</p>
                <p className="text-gray-600 text-sm">
                  Bạn có thể theo dõi đơn hàng trong trang "Đơn hàng của tôi"
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={() => router.push('/orders')} className="w-full btn-primary">
                  Xem đơn hàng
                </Button>
                <Button variant="outline" onClick={() => router.push('/products')} className="w-full">
                  Tiếp tục mua sắm
                </Button>
              </div>
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

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-0">
              {[
                { step: 1, label: "Thông tin" },
                { step: 2, label: "Thanh toán" },
                { step: 3, label: "Hoàn tất" },
              ].map((item) => (
                <div key={item.step} className="flex items-center">
                  <div
                    className={`
            w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0
            ${currentStep >= item.step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}
          `}
                  >
                    {currentStep > item.step ? <Check className="w-5 h-5" /> : item.step}
                  </div>

                  {/* Label */}
                  <span
                    className={`ml-3 sm:ml-2 text-sm font-medium ${currentStep >= item.step ? "text-blue-600" : "text-gray-500"
                      }`}
                  >
                    {item.label}
                  </span>

                  {/* Connector line (only on >= sm) */}
                  {item.step < 3 && (
                    <div
                      className={`hidden sm:block h-0.5 mx-4 w-10 md:w-16 ${currentStep > item.step ? "bg-blue-600" : "bg-gray-200"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Step 1: Customer Information */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Thông tin giao hàng</span>
                      </CardTitle>
                      <CardDescription>
                        Điền thông tin để nhận tài khoản qua email
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Họ và tên *</Label>
                          <Input
                            id="fullName"
                            value={customerInfo.fullName}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại *</Label>
                          <Input
                            id="phone"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="0901234567"
                          />
                          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="socialContact" className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span>Zalo/Facebook (tùy chọn) *</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="socialContact"
                            value={customerInfo.socialContact}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, socialContact: e.target.value }))}
                            placeholder="https://zalo.me/... hoặc facebook.com/..."
                            className="pl-10"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <span>💡</span>
                          <span>Vui lòng ghi đúng thông tin. Để chúng tôi có thể liên hệ hỗ trợ nhanh chóng khi cần thiết</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderNotes">Ghi chú đơn hàng (tùy chọn)</Label>
                        <div className="relative">
                          <Textarea
                            id="orderNotes"
                            value={orderNotes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderNotes(val.slice(0, MAX_NOTES_LEN)); // giới hạn 300 ký tự
                            }}
                            placeholder="Ví dụ: nếu có gói chính chủ hãy ghi thông tin đăng nhập để bên shop truy cập làm. Định dạng: Tài khoản - mật khẩu - cách đăng nhập - đơn hàng"
                            rows={4}
                            className="pr-14"
                          />
                          <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {orderNotes.length}/{MAX_NOTES_LEN}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Ghi chú giúp shop xử lý đúng theo yêu cầu của bạn (không bắt buộc).
                        </p>
                      </div>

                      <Separator />

                      {/* Discount Code */}
                      <div className="space-y-3">
                        <Label>Mã giảm giá</Label>
                        {appliedDiscount ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">{appliedDiscount.code}</span>
                              <span className="text-green-600 text-sm">- {appliedDiscount.description}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeDiscountCode}
                              className="text-green-600 hover:text-green-700"
                            >
                              Xóa
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Nhập mã giảm giá"
                              value={discountCodeInput}
                              onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleApplyDiscount}
                              disabled={isApplyingDiscount || !discountCodeInput.trim()}
                              variant="outline"
                            >
                              {isApplyingDiscount ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Áp dụng'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeTOS"
                          checked={agreeTOS}
                          onCheckedChange={(checked) => setAgreeTOS(!!checked)}
                        />
                        <Label htmlFor="agreeTOS" className="text-sm">
                          Tôi đồng ý với{' '}
                          <Link href="/terms" className="text-blue-600 underline">
                            điều khoản sử dụng
                          </Link>{' '}
                          và{' '}
                          <Link href="/privacy" className="text-blue-600 underline">
                            chính sách bảo mật
                          </Link>
                        </Label>
                      </div>

                      <Button
                        onClick={handleCreateOrder}
                        className="hover:opacity-80 h-12 bg-gradient-to-br from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center shadow-sm w-full" size="lg"
                        disabled={!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !agreeTOS || !customerInfo.socialContact || isSubmitting}
                      >
                        Tiếp tục thanh toán
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Beautiful Coin Payment */}
                {currentStep === 2 && (
                  <CoinPaymentInterface
                    amount={calculateFinalTotal()}
                    onPayment={handleCoinPayment}
                    isProcessing={isProcessingPayment}
                    orderItems={getEffectiveItems()}
                    appliedDiscount={appliedDiscount}
                    notes={orderNotes}
                    customerInfo={customerInfo}
                  />
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {getEffectiveItems().map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity}x {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="font-medium text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(effectiveTotalAmount)}</span>
                      </div>

                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá ({appliedDiscount.code}):</span>
                          <span>
                            -{formatPrice(
                              typeof appliedDiscount.discountAmount === 'number'
                                ? appliedDiscount.discountAmount
                                : Math.min(appliedDiscount.value ?? 0, effectiveTotalAmount)
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-green-600">
                        <span>Phí giao dịch:</span>
                        <span className="flex items-center">
                          <span className="text-xs mr-1">🎁</span>
                          Miễn phí
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between font-semibold text-base">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">{formatPrice(calculateFinalTotal())}</span>
                      </div>

                      <div className="text-xs text-gray-500 text-center mt-2">
                        = {formatCoins(calculateFinalTotal())}
                      </div>
                    </div>

                    {/* Wallet Balance */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-700 flex items-center">
                          <Wallet className="w-4 h-4 mr-1" />
                          Số dư coins:
                        </span>
                        <span className="font-bold text-amber-800 text-lg">{formatCoins(user.coins)}</span>
                      </div>
                      {!canAfford(calculateFinalTotal()) ? (
                        <div className="text-xs text-amber-600 mt-2 flex items-center justify-between">
                          <span>Thiếu {formatCoins(calculateFinalTotal() - balance)}</span>
                          <Link href="/wallet" className="text-amber-700 underline font-medium">
                            Nạp ngay
                          </Link>
                        </div>
                      ) : (
                        <div className="text-xs text-green-600 mt-2 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          <span>Đủ số dư để thanh toán</span>
                        </div>
                      )}
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                      <Shield className="w-4 h-4" />
                      <span>Bảo mật SSL 256-bit</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPageContent />
    </Suspense>
  );
}