"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import PaymentInstructions from './PaymentInstructions';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Bitcoin, 
  Shield, 
  Lock, 
  Check,
  AlertCircle,
  Loader2,
  Wallet
} from 'lucide-react';

// Validation schemas
const cardPaymentSchema = z.object({
  cardNumber: z.string().min(16, 'Số thẻ phải có ít nhất 16 số').max(19, 'Số thẻ không hợp lệ'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Định dạng MM/YY'),
  cvv: z.string().min(3, 'CVV phải có 3-4 số').max(4),
  cardholderName: z.string().min(2, 'Tên chủ thẻ không hợp lệ'),
});

const bankTransferSchema = z.object({
  accountNumber: z.string().min(6, 'Số tài khoản không hợp lệ'),
  bankCode: z.string().min(1, 'Vui lòng chọn ngân hàng'),
});

const momoSchema = z.object({
  phoneNumber: z.string().regex(/^(0[3-9])[0-9]{8}$/, 'Số điện thoại không hợp lệ'),
});

const cryptoSchema = z.object({
  walletAddress: z.string().min(26, 'Địa chỉ ví không hợp lệ'),
  cryptoType: z.string().min(1, 'Vui lòng chọn loại tiền điện tử'),
});

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'banking' | 'momo' | 'crypto' | 'wallet';
  icon: React.ReactNode;
  fee: number;
  processingTime: string;
  description: string;
  isActive: boolean;
}

interface PaymentProcessorProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  orderId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'form' | 'processing' | 'success' | 'instructions'>('select');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Thẻ tín dụng/ghi nợ',
      type: 'card',
      icon: <CreditCard className="w-5 h-5" />,
      fee: 2500,
      processingTime: 'Tức thì',
      description: 'Visa, Mastercard, JCB',
      isActive: true
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      type: 'banking',
      icon: <Building2 className="w-5 h-5" />,
      fee: 0,
      processingTime: '5-15 phút',
      description: 'Chuyển khoản qua Internet Banking',
      isActive: true
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      type: 'momo',
      icon: <Smartphone className="w-5 h-5" />,
      fee: 0,
      processingTime: 'Tức thì',
      description: 'Thanh toán qua ứng dụng MoMo',
      isActive: true
    },
    {
      id: 'crypto',
      name: 'Tiền điện tử',
      type: 'crypto',
      icon: <Bitcoin className="w-5 h-5" />,
      fee: 0,
      processingTime: '10-30 phút',
      description: 'Bitcoin, USDT, Ethereum',
      isActive: true
    }
  ];

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const totalAmount = amount + (selectedPaymentMethod?.fee || 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Card payment form
  const cardForm = useForm({
    resolver: zodResolver(cardPaymentSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    }
  });

  // Banking form
  const bankingForm = useForm({
    resolver: zodResolver(bankTransferSchema),
    defaultValues: {
      accountNumber: '',
      bankCode: '',
    }
  });

  // MoMo form
  const momoForm = useForm({
    resolver: zodResolver(momoSchema),
    defaultValues: {
      phoneNumber: '',
    }
  });

  // Crypto form
  const cryptoForm = useForm({
    resolver: zodResolver(cryptoSchema),
    defaultValues: {
      walletAddress: '',
      cryptoType: 'BTC',
    }
  });

  console.log("PaymentProcessor rendered", { 
    amount, 
    orderId, 
    selectedMethod, 
    paymentStep,
    totalAmount: totalAmount
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{2,4}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];
    for (let i = 0, len = Math.min(match.length, 4); i < len; i += 2) {
      parts.push(match.substring(i, i + 2));
    }
    if (parts.length) {
      return parts.join('/');
    } else {
      return v;
    }
  };

  const processCardPayment = async (data: z.infer<typeof cardPaymentSchema>) => {
    console.log("Processing card payment", { data, orderId, amount: totalAmount });
    
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      
      // Simulate payment success (95% success rate)
      const success = Math.random() > 0.05;
      
      if (success) {
        setPaymentStep('success');
        
        const paymentData = {
          method: 'card',
          transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: totalAmount,
          fee: selectedPaymentMethod?.fee || 0,
          cardLast4: data.cardNumber.slice(-4),
          timestamp: new Date().toISOString(),
          status: 'completed'
        };
        
        console.log("Card payment successful", paymentData);
        
        toast({
          title: "Thanh toán thành công! 🎉",
          description: `Giao dịch ${paymentData.transactionId} đã được xử lý`,
        });
        
        setTimeout(() => {
          onSuccess(paymentData);
        }, 1500);
      } else {
        throw new Error("Thẻ bị từ chối bởi ngân hàng");
      }
    } catch (error: any) {
      console.error("Card payment failed:", error);
      setPaymentStep('form');
      onError(error.message || "Thanh toán thất bại");
      
      toast({
        title: "Thanh toán thất bại",
        description: error.message || "Có lỗi xảy ra khi xử lý thanh toán",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processBankingPayment = async (data: z.infer<typeof bankTransferSchema>) => {
    console.log("Processing banking payment", { data, orderId, amount: totalAmount });
    
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Generate banking transfer info
      const transferInfo = {
        bankAccount: "1234567890",
        bankName: "QAI Bank",
        accountHolder: "QAI Store",
        transferAmount: totalAmount,
        transferContent: `QAI ${orderId}`,
        referenceCode: `REF${Date.now()}`
      };

      // Simulate transfer instruction display and confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentData = {
        method: 'banking',
        transactionId: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: totalAmount,
        fee: 0,
        transferInfo,
        status: 'pending', // Banking payments start as pending
        timestamp: new Date().toISOString()
      };
      
      console.log("Banking payment initiated", paymentData);
      
      setPaymentResult(paymentData);
      setPaymentStep('instructions');
      
      toast({
        title: "Hướng dẫn chuyển khoản",
        description: "Vui lòng thực hiện chuyển khoản theo thông tin được cung cấp",
      });
      
    } catch (error: any) {
      console.error("Banking payment failed:", error);
      setPaymentStep('form');
      onError(error.message || "Không thể tạo hướng dẫn chuyển khoản");
    } finally {
      setIsProcessing(false);
    }
  };

  const processMoMoPayment = async (data: z.infer<typeof momoSchema>) => {
    console.log("Processing MoMo payment", { data, orderId, amount: totalAmount });
    
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate MoMo processing
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      const success = Math.random() > 0.02; // 98% success rate for MoMo
      
      if (success) {
        setPaymentStep('success');
        
        const paymentData = {
          method: 'momo',
          transactionId: `MOMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: totalAmount,
          fee: 0,
          phoneNumber: data.phoneNumber,
          status: 'completed',
          timestamp: new Date().toISOString()
        };
        
        console.log("MoMo payment successful", paymentData);
        
        toast({
          title: "Thanh toán MoMo thành công! 🎉",
          description: `Giao dịch đã được xử lý qua số ${data.phoneNumber}`,
        });
        
        setTimeout(() => {
          onSuccess(paymentData);
        }, 1500);
      } else {
        throw new Error("Ví MoMo không đủ số dư hoặc bị khóa");
      }
    } catch (error: any) {
      console.error("MoMo payment failed:", error);
      setPaymentStep('form');
      onError(error.message || "Thanh toán MoMo thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const processCryptoPayment = async (data: z.infer<typeof cryptoSchema>) => {
    console.log("Processing crypto payment", { data, orderId, amount: totalAmount });
    
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Generate crypto payment address and amount
      const cryptoInfo = {
        paymentAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        cryptoAmount: data.cryptoType === 'BTC' ? (totalAmount / 1000000000).toFixed(8) : 
                     data.cryptoType === 'USDT' ? (totalAmount / 23000).toFixed(2) :
                     (totalAmount / 50000000).toFixed(6), // ETH
        cryptoType: data.cryptoType,
        qrCode: `${data.cryptoType}:${data.walletAddress}?amount=${totalAmount}`,
        referenceCode: `CRYPTO${Date.now()}`
      };

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const paymentData = {
        method: 'crypto',
        transactionId: `CRYPTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: totalAmount,
        fee: 0,
        cryptoInfo,
        status: 'pending', // Crypto payments need confirmation
        timestamp: new Date().toISOString()
      };
      
      console.log("Crypto payment initiated", paymentData);
      
      setPaymentResult(paymentData);
      setPaymentStep('instructions');
      
      toast({
        title: "Hướng dẫn thanh toán crypto",
        description: `Chuyển ${cryptoInfo.cryptoAmount} ${data.cryptoType} đến địa chỉ được cung cấp`,
      });
      
    } catch (error: any) {
      console.error("Crypto payment failed:", error);
      setPaymentStep('form');
      onError(error.message || "Không thể tạo thanh toán crypto");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    setPaymentStep('form');
  };

  const handleSubmitPayment = () => {
    switch (selectedMethod) {
      case 'card':
        cardForm.handleSubmit(processCardPayment)();
        break;
      case 'banking':
        bankingForm.handleSubmit(processBankingPayment)();
        break;
      case 'momo':
        momoForm.handleSubmit(processMoMoPayment)();
        break;
      case 'crypto':
        cryptoForm.handleSubmit(processCryptoPayment)();
        break;
      default:
        onError("Phương thức thanh toán không hợp lệ");
    }
  };

  const handlePaymentStatusChange = (newStatus: string) => {
    console.log("Payment status changed", { 
      transactionId: paymentResult?.transactionId, 
      oldStatus: paymentResult?.status, 
      newStatus 
    });

    if (newStatus === 'completed' && paymentResult) {
      // Payment has been confirmed, proceed with success
      const updatedPaymentData = {
        ...paymentResult,
        status: 'completed'
      };
      
      setPaymentStep('success');
      
      setTimeout(() => {
        onSuccess(updatedPaymentData);
      }, 1500);
    }
  };

  if (paymentStep === 'processing') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Đang xử lý thanh toán...</h3>
            <p className="text-gray-600">
              Vui lòng không đóng trang này. Giao dịch đang được xử lý.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Bảo mật với mã hóa SSL 256-bit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-700">Thanh toán thành công!</h3>
            <p className="text-gray-600">
              Giao dịch của bạn đã được xử lý thành công.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Payment Method Selection */}
      {paymentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Chọn phương thức thanh toán</span>
            </CardTitle>
            <CardDescription>
              Chọn phương thức thanh toán phù hợp với bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label 
                    htmlFor={method.id} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {method.icon}
                        </div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-500">{method.description}</div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm text-gray-600">{method.processingTime}</div>
                        {method.fee > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Phí: {formatPrice(method.fee)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Separator />

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tổng tiền hàng:</span>
                <span>{formatPrice(amount)}</span>
              </div>
              {selectedPaymentMethod?.fee && selectedPaymentMethod.fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Phí xử lý:</span>
                  <span>{formatPrice(selectedPaymentMethod.fee)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Tổng thanh toán:</span>
                <span className="text-blue-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <Button 
              onClick={handleContinue} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Tiếp tục thanh toán
            </Button>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Bảo mật với SSL 256-bit</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {paymentStep === 'form' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedPaymentMethod?.icon}
              <span>Thanh toán qua {selectedPaymentMethod?.name}</span>
            </CardTitle>
            <CardDescription>
              Nhập thông tin thanh toán của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Card Payment Form */}
            {selectedMethod === 'card' && (
              <form onSubmit={cardForm.handleSubmit(processCardPayment)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Số thẻ</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    {...cardForm.register('cardNumber')}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      e.target.value = formatted;
                      cardForm.setValue('cardNumber', formatted.replace(/\s/g, '') as string);
                    }}
                    maxLength={19}
                  />
                  {cardForm.formState.errors.cardNumber && (
                    <p className="text-sm text-red-600">{cardForm.formState.errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">MM/YY</Label>
                    <Input
                      id="expiryDate"
                      placeholder="12/28"
                      {...cardForm.register('expiryDate')}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        e.target.value = formatted;
                        cardForm.setValue('expiryDate', formatted as string);
                      }}
                      maxLength={5}
                    />
                    {cardForm.formState.errors.expiryDate && (
                      <p className="text-sm text-red-600">{cardForm.formState.errors.expiryDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      {...cardForm.register('cvv')}
                      maxLength={4}
                    />
                    {cardForm.formState.errors.cvv && (
                      <p className="text-sm text-red-600">{cardForm.formState.errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
                  <Input
                    id="cardholderName"
                    placeholder="NGUYEN VAN A"
                    {...cardForm.register('cardholderName')}
                  />
                  {cardForm.formState.errors.cardholderName && (
                    <p className="text-sm text-red-600">{cardForm.formState.errors.cardholderName.message}</p>
                  )}
                </div>
              </form>
            )}

            {/* Banking Form */}
            {selectedMethod === 'banking' && (
              <form onSubmit={bankingForm.handleSubmit(processBankingPayment)} className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bạn sẽ nhận được hướng dẫn chuyển khoản chi tiết sau khi xác nhận.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="bankCode">Ngân hàng</Label>
                  <select 
                    {...bankingForm.register('bankCode')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Chọn ngân hàng</option>
                    <option value="VCB">Vietcombank</option>
                    <option value="TCB">Techcombank</option>
                    <option value="MB">MBBank</option>
                    <option value="VTB">Vietinbank</option>
                    <option value="BIDV">BIDV</option>
                  </select>
                  {bankingForm.formState.errors.bankCode && (
                    <p className="text-sm text-red-600">{bankingForm.formState.errors.bankCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Số tài khoản của bạn</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    {...bankingForm.register('accountNumber')}
                  />
                  {bankingForm.formState.errors.accountNumber && (
                    <p className="text-sm text-red-600">{bankingForm.formState.errors.accountNumber.message}</p>
                  )}
                </div>
              </form>
            )}

            {/* MoMo Form */}
            {selectedMethod === 'momo' && (
              <form onSubmit={momoForm.handleSubmit(processMoMoPayment)} className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Đảm bảo bạn đã cài đặt ứng dụng MoMo và có đủ số dư.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại MoMo</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="0901234567"
                    {...momoForm.register('phoneNumber')}
                  />
                  {momoForm.formState.errors.phoneNumber && (
                    <p className="text-sm text-red-600">{momoForm.formState.errors.phoneNumber.message}</p>
                  )}
                </div>
              </form>
            )}

            {/* Crypto Form */}
            {selectedMethod === 'crypto' && (
              <form onSubmit={cryptoForm.handleSubmit(processCryptoPayment)} className="space-y-4">
                <Alert>
                  <Bitcoin className="h-4 w-4" />
                  <AlertDescription>
                    Giao dịch crypto có thể mất 10-30 phút để xác nhận.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="cryptoType">Loại tiền điện tử</Label>
                  <select 
                    {...cryptoForm.register('cryptoType')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Địa chỉ ví của bạn</Label>
                  <Input
                    id="walletAddress"
                    placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                    {...cryptoForm.register('walletAddress')}
                  />
                  {cryptoForm.formState.errors.walletAddress && (
                    <p className="text-sm text-red-600">{cryptoForm.formState.errors.walletAddress.message}</p>
                  )}
                </div>
              </form>
            )}

            <Separator />

            {/* Payment Summary */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tổng tiền hàng:</span>
                <span>{formatPrice(amount)}</span>
              </div>
              {selectedPaymentMethod?.fee && selectedPaymentMethod.fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Phí xử lý:</span>
                  <span>{formatPrice(selectedPaymentMethod.fee)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-blue-700">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setPaymentStep('select')}
                className="flex-1"
                disabled={isProcessing}
              >
                Quay lại
              </Button>
              <Button 
                onClick={handleSubmitPayment}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  `Thanh toán ${formatPrice(totalAmount)}`
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Thông tin của bạn được bảo mật với SSL 256-bit</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions Step */}
      {paymentStep === 'instructions' && paymentResult && (
        <PaymentInstructions
          paymentData={paymentResult}
          onStatusChange={handlePaymentStatusChange}
        />
      )}

      {onCancel && (
        <div className="text-center">
          <Button variant="ghost" onClick={onCancel} className="text-gray-500">
            Hủy thanh toán
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessor;