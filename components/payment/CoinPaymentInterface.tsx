"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Coins,
  Wallet,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Gift,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface CoinPaymentInterfaceProps {
  amount: number;
  onPayment: () => Promise<void>;
  isProcessing: boolean;
  orderItems: any[];
  appliedDiscount?: any;
}

export default function CoinPaymentInterface({
  amount,
  onPayment,
  isProcessing,
  orderItems,
  appliedDiscount
}: CoinPaymentInterfaceProps) {
  const { balance, canAfford, formatCoins } = useWallet();
  const { user } = useAuth();
  const [animationStep, setAnimationStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation progression
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(prev => Math.min(prev + 1, 3));
    }, 500);
    return () => clearTimeout(timer);
  }, [animationStep]);

  const balancePercentage = Math.min((balance / amount) * 100, 100);
  const isAffordable = canAfford(amount);
  const shortfall = Math.max(0, amount - balance);

  const handlePayment = async () => {
    console.log("CoinPaymentInterface: Starting payment", { amount });
    setShowConfetti(true);
    try {
      await onPayment();
      console.log("CoinPaymentInterface: Payment completed successfully");
    } catch (error) {
      console.error("CoinPaymentInterface: Payment failed", error);
      setShowConfetti(false);
      throw error;
    }
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="pb-4 bg-gradient-to-r from-brand-blue to-brand-emerald text-white">
            <div className="flex items-center space-x-3">
              <div className={`
                w-16 h-16 rounded-lg flex items-center justify-center 
                bg-white/20 shadow-sm
                transform transition-all duration-700 ease-out
                ${animationStep >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
              `}>
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className={`
                  text-2xl font-bold text-white
                  transform transition-all duration-700 ease-out delay-200
                  ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}>
                  Thanh toán bằng Coins
                </CardTitle>
                <p className={`
                  text-blue-100 mt-1
                  transform transition-all duration-700 ease-out delay-300
                  ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}>
                  Nhanh chóng, an toàn và không phí giao dịch
                </p>
              </div>
              <div className={`
                flex items-center space-x-2
                transform transition-all duration-700 ease-out delay-400
                ${animationStep >= 1 ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              `}>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Tức thì
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <Gift className="w-3 h-3 mr-1" />
                  Miễn phí
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Animated background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-brand-emerald/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Wallet Status */}
      <Card className={`
        transform transition-all duration-700 ease-out delay-500 bg-white border border-gray-200 shadow-lg
        ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        ${isAffordable ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}
      `}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${isAffordable ? 'bg-gradient-to-r from-brand-blue to-brand-emerald' : 'bg-orange-100'}
              `}>
                <Wallet className={`w-6 h-6 ${isAffordable ? 'text-white' : 'text-orange-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Ví Coins của bạn</h3>
                <p className="text-sm text-gray-600">
                  Số dư hiện tại: <span className="font-medium">{formatCoins(balance)}</span>
                </p>
              </div>
            </div>
            {isAffordable && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Đủ số dư</span>
              </div>
            )}
          </div>

          {/* Balance Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Số dư hiện tại</span>
              <span className="font-medium">{formatCoins(balance)}</span>
            </div>
            <Progress
              value={balancePercentage}
              className="h-3"
              style={{
                background: isAffordable ? 'rgb(220 252 231)' : 'rgb(254 243 199)'
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Số tiền cần thanh toán</span>
              <span className="font-medium text-lg text-brand-blue">{formatCoins(amount)}</span>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {!isAffordable && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Bạn cần thêm <strong>{formatCoins(shortfall)}</strong> để hoàn tất giao dịch
                  </span>
                  <Link href="/wallet" className="text-orange-600 hover:text-orange-700 font-medium underline">
                    Nạp ngay
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className={`
        transform transition-all duration-700 ease-out delay-700 bg-white border border-gray-200 shadow-lg
        ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Sparkles className="w-5 h-5 text-brand-blue" />
            <span>Chi tiết đơn hàng</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Items */}
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity}x {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-800">
                  {formatCoins(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pricing Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính:</span>
              <span>{formatCoins(amount + (appliedDiscount ? (appliedDiscount.type === 'percentage' ? Math.min((amount * appliedDiscount.value) / 100, appliedDiscount.maxDiscount || Infinity) : appliedDiscount.value) : 0))}</span>
            </div>

            {appliedDiscount && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá ({appliedDiscount.code}):</span>
                <span>
                  -{formatCoins(
                    appliedDiscount.type === 'percentage' ?
                      Math.min((amount * appliedDiscount.value) / 100, appliedDiscount.maxDiscount || Infinity) :
                      appliedDiscount.value
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm text-green-600">
              <span>Phí giao dịch:</span>
              <span className="flex items-center">
                <Gift className="w-3 h-3 mr-1" />
                Miễn phí
              </span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-800">Tổng thanh toán:</span>
              <span className="text-2xl text-brand-blue font-bold">
                {formatCoins(amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Action */}
      <Card className="border-2 border-dashed border-brand-blue/30 bg-gradient-to-r from-blue-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Bảo mật cao</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Giao dịch tức thì • Mã hóa 256-bit
                </p>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!isAffordable || isProcessing}
              size="lg"
              className={`
                px-8 py-4 text-lg font-semibold min-w-[200px] rounded-lg
                ${isAffordable
                  ? 'bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : isAffordable ? (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Thanh toán {formatCoins(amount)}
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Số dư không đủ
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, title: "Tức thì", desc: "Nhận ngay lập tức", color: "text-brand-blue" },
          { icon: Shield, title: "An toàn", desc: "Mã hóa 256-bit", color: "text-brand-emerald" },
          { icon: Gift, title: "Miễn phí", desc: "Không phí giao dịch", color: "text-green-600" }
        ].map((benefit, index) => (
          <Card key={index} className={`
            text-center p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md
            transform transition-all duration-700 ease-out hover:scale-105
            ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
          `} style={{ transitionDelay: `${800 + index * 100}ms` }}>
            <benefit.icon className={`w-8 h-8 mx-auto mb-2 ${benefit.color}`} />
            <h4 className="font-semibold text-sm text-gray-800">{benefit.title}</h4>
            <p className="text-xs text-gray-500">{benefit.desc}</p>
          </Card>
        ))}
      </div>

      {/* Confetti Effect (hidden by default) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-emerald/10 animate-pulse"></div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-brand-blue rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}