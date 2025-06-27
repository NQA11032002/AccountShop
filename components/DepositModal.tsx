"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QrCode, Copy, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  method: {
    id: string;
    name: string;
    icon: string;
    fee: number;
  };
  formatCoins: (amount: number) => string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  orderId?: string; // Pass the actual orderId from wallet context
  onNavigateToHistory: () => void;
  onConfirmUserPayment: (orderId: string) => Promise<boolean>;
}

export default function DepositModal({ isOpen, onClose, amount, method, formatCoins, user, orderId: externalOrderId, onNavigateToHistory, onConfirmUserPayment }: DepositModalProps) {
  const [step, setStep] = useState<'qr' | 'confirmation' | 'pending' | 'completed'>('qr');
  const [orderId, setOrderId] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      // Use external orderId if provided, otherwise generate new one
      const currentOrderId = externalOrderId || `QAI${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setOrderId(currentOrderId);
      
      console.log("🆔 DepositModal orderId set", { 
        externalOrderId, 
        currentOrderId,
        user: user.email,
        amount,
        method: method.name 
      });
      
      // Transfer content: QAI + amount + account ID
      const transferContent = `QAI${amount}${user.id}`;
      
      // Generate QR code data based on payment method
      let qrContent = '';
      switch (method.id) {
        case 'momo':
          qrContent = `2|99|${user.id}|${user.name}|${transferContent}|0|0|${amount}`;
          break;
        case 'banking':
          qrContent = `00020101021238530010A00000072701270006970436011${user.id}08QRINSTANT5303704540${amount}5802VN5912${user.name.substring(0, 12).toUpperCase()}6304${transferContent}`;
          break;
        default:
          qrContent = `qai-store-payment:${currentOrderId}:${amount}:${method.id}:${user.id}`;
      }
      setQrData(qrContent);
      
      // Reset states
      setStep('qr');
      setTimeLeft(900);
    }
  }, [isOpen, amount, method, user, externalOrderId]);

  // Timer countdown
  useEffect(() => {
    if (step === 'qr' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setStep('pending');
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyQR = () => {
    navigator.clipboard.writeText(qrData);
    toast({
      title: "Đã sao chép",
      description: "Thông tin QR đã được sao chép vào clipboard",
    });
  };

  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePaymentConfirmation = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log("🔘 Payment button clicked", { 
      isProcessing, 
      step, 
      orderId, 
      amount,
      method: method.name,
      user: user?.email,
      timestamp: new Date().toISOString() 
    });
    
    if (isProcessing) {
      console.log("❌ Payment confirmation already processing, ignoring click");
      return;
    }
    
    console.log("✅ Processing payment confirmation", { 
      orderId, 
      amount, 
      method: method.name,
      timestamp: new Date().toISOString()
    });
    
    try {
      setIsProcessing(true);
      setStep('confirmation');
      
      toast({
        title: "✅ Xác nhận thanh toán",
        description: "Đang lưu thông tin giao dịch...",
      });
      
      // Call the new confirmUserPayment function to save transaction history
      const success = await onConfirmUserPayment(orderId);
      
      if (success) {
        console.log("🔄 Moving to pending state", { orderId, timestamp: new Date().toISOString() });
        setStep('pending');
        
        toast({
          title: "⏳ Chờ xác nhận",
          description: "Giao dịch đã được lưu và đang chờ admin phê duyệt",
        });
        
        // Navigate to history after short delay
        setTimeout(() => {
          console.log("📝 Navigating to history page", { orderId, timestamp: new Date().toISOString() });
          handleClose();
          onNavigateToHistory();
        }, 1500);
      } else {
        throw new Error("Failed to confirm user payment");
      }
      
    } catch (error) {
      console.error("❌ Payment confirmation error:", error);
      toast({
        title: "Lỗi xử lý",
        description: "Có lỗi xảy ra khi lưu giao dịch, vui lòng thử lại",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('qr');
    setTimeLeft(900);
    onClose();
  };

  const finalAmount = amount - method.fee;
  const totalReceived = finalAmount;

  const getPaymentInstructions = () => {
    if (!user) return { title: "Thanh toán", steps: [] };
    
    // Transfer content: QAI + amount + account ID
    const transferContent = `QAI${amount}${user.id}`;
    
    switch (method.id) {
      case 'momo':
        return {
          title: "Thanh toán qua Ví MoMo",
          steps: [
            "Mở ứng dụng MoMo trên điện thoại",
            "Chọn 'Quét mã QR' hoặc 'Chuyển tiền'",
            "Quét mã QR hoặc nhập thông tin chuyển khoản",
            "Nhập đúng số tiền và nội dung chuyển khoản",
            "Xác nhận giao dịch"
          ],
          account: user.id,
          accountName: user.name,
          transferContent
        };
      case 'banking':
        return {
          title: "Chuyển khoản ngân hàng",
          steps: [
            "Mở ứng dụng ngân hàng hoặc Internet Banking",
            "Chọn 'Chuyển khoản' hoặc 'Quét QR'",
            "Quét mã QR hoặc nhập thông tin người nhận",
            "Nhập đúng số tiền và nội dung chuyển khoản",
            "Xác nhận giao dịch bằng OTP"
          ],
          account: user.id,
          accountName: user.name,
          bank: "Vietcombank",
          transferContent
        };
      default:
        return {
          title: "Thanh toán",
          steps: [
            "Sử dụng ứng dụng thanh toán",
            "Quét mã QR được cung cấp",
            "Xác nhận thông tin giao dịch",
            "Hoàn tất thanh toán"
          ],
          transferContent
        };
    }
  };

  const paymentInfo = getPaymentInstructions();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full mx-auto bg-white border border-gray-200 shadow-xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center justify-center space-x-3 text-xl">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
              {method.icon}
            </div>
            <span className="text-gray-800 font-bold">
              Nạp tiền - {method.name}
            </span>
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            Thực hiện thanh toán theo hướng dẫn bên dưới để nạp tiền vào tài khoản
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary - Clean white design */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className={`grid gap-4 text-sm ${method.fee > 0 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 font-medium mb-1">Mã đơn hàng</div>
                  <div className="font-mono text-brand-blue font-semibold text-xs">
                    {orderId}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 font-medium mb-1">Số tiền nạp</div>
                  <div className="font-semibold text-lg">{formatCoins(amount)}</div>
                </div>
                {method.fee > 0 && (
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-red-600 font-medium mb-1">Phí xử lý</div>
                    <div className="font-semibold text-red-600">-{formatCoins(method.fee)}</div>
                  </div>
                )}
                <div className="text-center p-3 bg-brand-blue/10 rounded-lg">
                  <div className="text-brand-blue font-medium mb-1">Tổng nhận</div>
                  <div className="font-bold text-lg text-brand-blue">{formatCoins(totalReceived)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Steps - Horizontal Layout */}
          {step === 'qr' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* QR Code Section */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-gray-800 mb-3">Mã QR thanh toán</h4>
                  <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3 border">
                    <QrCode className="w-20 h-20 text-gray-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs text-gray-600 break-all p-2 bg-white/90 rounded text-center">
                        {qrData.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyQR}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Sao chép QR</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Info Section */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">{paymentInfo.title}</h4>
                  
                  {paymentInfo.account && (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-600">STK:</span>
                          <span className="font-mono text-brand-blue">{paymentInfo.account}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-600">Tên:</span>
                          <span className="text-gray-800">{paymentInfo.accountName}</span>
                        </div>
                        {paymentInfo.bank && (
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-600">NH:</span>
                            <span className="text-gray-800">{paymentInfo.bank}</span>
                          </div>
                        )}
                        <div className="p-2 bg-brand-blue/10 rounded">
                          <div className="font-medium text-gray-600 text-xs mb-1">Nội dung chuyển khoản:</div>
                          <div className="font-mono text-brand-blue font-semibold text-center">
                            {paymentInfo.transferContent}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Instructions & Actions */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Hướng dẫn</h4>
                  
                  {/* Compact Steps */}
                  <div className="space-y-2 text-sm mb-4">
                    {paymentInfo.steps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 text-xs leading-tight">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 p-3 bg-orange-50 rounded-lg mb-4">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-800">Còn lại:</span>
                    <span className="font-mono font-bold text-orange-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  {/* Enhanced Payment Confirmation Button */}
                  <Button 
                    onClick={handlePaymentConfirmation}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
                    disabled={isProcessing}
                    type="button"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-base font-semibold">Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-base font-semibold">✅ Tôi đã thanh toán</span>
                        </>
                      )}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Confirmation Step - Clean white design */}
          {step === 'confirmation' && (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-gray-800">
                    Đang xác minh...
                  </h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Chúng tôi đang kiểm tra giao dịch của bạn. Quá trình này sẽ hoàn thành trong vài giây.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Admin Approval - Clean white design */}
          {step === 'pending' && (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-amber-500 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-gray-800">
                    Chờ xác nhận
                  </h3>
                  <p className="text-gray-600 text-sm max-w-lg mx-auto">
                    Giao dịch của bạn đang chờ admin xác nhận. 
                    Thời gian xử lý thường từ 5-30 phút trong giờ hành chính.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 text-sm font-semibold">
                    🕐 Đang chờ xử lý
                  </Badge>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">
                      Mã giao dịch: <span className="font-mono text-amber-600">{orderId}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed - Clean white design */}
          {step === 'completed' && (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-brand-emerald rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-gray-800">
                    🎉 Hoàn thành!
                  </h3>
                  <p className="text-gray-600 text-sm max-w-lg mx-auto">
                    Giao dịch đã được xác nhận thành công và coins đã được nạp vào tài khoản của bạn.
                  </p>
                </div>
                <div className="bg-brand-emerald/10 p-4 rounded-lg space-y-2">
                  <div className="text-sm text-gray-600 font-medium">Số coins đã nhận</div>
                  <div className="text-2xl font-bold text-brand-emerald">{formatCoins(totalReceived)}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Clean Footer */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1 py-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
          >
            {step === 'completed' ? 'Hoàn thành' : 'Hủy bỏ'}
          </Button>
          {step === 'pending' && (
            <Button 
              variant="outline" 
              className="flex-1 py-2 bg-white hover:bg-brand-blue/10 border-blue-300 text-blue-700 font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Kiểm tra trạng thái
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}