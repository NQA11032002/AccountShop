"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, CreditCard, Smartphone, Building2, Shield, Check, AlertCircle, User, Mail, Phone, Tag, Percent, Bitcoin, Wallet, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const { items, itemsCount, totalAmount, totalSavings, clearCart, addItem } = useCart();
  const { user } = useAuth();
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
  const { balance, canAfford, deductCoins, formatCoins } = useWallet();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [useWalletPayment, setUseWalletPayment] = useState(true); // Always use wallet payment
  const [finalOrderAmount, setFinalOrderAmount] = useState(0);
  
  // Buy now mode state
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });
  const [agreeTOS, setAgreeTOS] = useState(false);
  
  // Check for buy now mode and load product data
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'buynow') {
      const buyNowData = sessionStorage.getItem('qai-store-buy-now-item');
      if (buyNowData) {
        try {
          const parsedData = JSON.parse(buyNowData);
          setBuyNowItem(parsedData);
          setIsBuyNowMode(true);
          console.log("Buy now mode activated", { product: parsedData });
        } catch (error) {
          console.error("Failed to parse buy now data:", error);
          toast({
            title: "Lỗi dữ liệu",
            description: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
            variant: "destructive"
          });
          router.push('/products');
        }
      } else {
        toast({
          title: "Không tìm thấy sản phẩm",
          description: "Vui lòng chọn sản phẩm để mua.",
          variant: "destructive"
        });
        router.push('/products');
      }
    }
  }, [searchParams, router, toast]);

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
    
    const discountAmount = appliedDiscount ? 
      (appliedDiscount.type === 'percentage' ? 
        Math.min((effectiveTotalAmount * appliedDiscount.value) / 100, appliedDiscount.maxDiscount || Infinity) :
        appliedDiscount.value) : 0;
    
    // Always 0 processing fee for coin payments
    const processingFee = 0;
    
    const finalTotal = Math.max(0, effectiveTotalAmount - discountAmount + processingFee);
    
    console.log("calculateFinalTotal", {
      mode: isBuyNowMode ? 'buynow' : 'cart',
      effectiveTotalAmount,
      discountAmount,
      processingFee,
      finalTotal,
      useWalletPayment: true
    });
    
    return finalTotal;
  };

  const { itemsCount: effectiveItemsCount, totalAmount: effectiveTotalAmount } = getEffectiveTotals();
  
  console.log("CheckoutPage rendered", { 
    currentStep, 
    mode: isBuyNowMode ? 'buynow' : 'cart',
    buyNowItem: buyNowItem?.name,
    effectiveItemsCount, 
    effectiveTotalAmount, 
    finalTotal: calculateFinalTotal(),
    appliedDiscount: appliedDiscount?.code,
    useWalletPayment,
    user: user?.email 
  });

  // Rest of the component logic...
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để tiếp tục thanh toán.</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/login')} className="w-full">
              Đăng nhập
            </Button>
            <Button variant="outline" onClick={() => router.push('/register')} className="w-full">
              Đăng ký tài khoản
            </Button>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Thanh toán</h1>
            <p className="text-gray-600">
              {isBuyNowMode 
                ? `Hoàn tất mua ngay ${buyNowItem?.name}` 
                : `Bạn có ${effectiveItemsCount} sản phẩm trong giỏ hàng`
              }
            </p>
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