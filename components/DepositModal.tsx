"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { createTransaction, getUserCoins, checkDepositStatus } from '@/lib/api'; // import đúng đường dẫn tới hàm createTransaction
import { User } from '@/types/user.interface';

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
  const [step, setStep] = useState<'qr' | 'approved' | 'pending' | 'rejected'>('qr');
  const [orderId, setOrderId] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes
  const { toast } = useToast();
  const [users, setUser] = useState<User>();

  useEffect(() => {
    if (isOpen && user) {
      // Generate QR code data based on payment method (orderId từ closure, cập nhật sau)
      let qrContent = '';
      switch (method.id) {
        case 'momo':
          qrContent = `${user.id}:${orderId}`;
          break;
        case 'banking':
          qrContent = `19073157703011`;
          break;
        default:
          qrContent = `${user.id}:${orderId}`;
      }
      setQrData(qrContent);
    }
    // Không reset timeLeft ở đây - dùng effect [isOpen] để chỉ reset khi mở modal

    let interval: NodeJS.Timeout | null = null;

    // Polling check trạng thái giao dịch khi ở bước "pending"
    if (step === 'pending' && user) {
      const sessionId = localStorage.getItem('qai_session');
      interval = setInterval(async () => {
        try {
          // Gọi API, truyền cả orderId và sessionId nếu cần
          const res = await checkDepositStatus(orderId, sessionId!);
          if (res.status === 'approved') {
            await refreshUserCoins();
            setStep('approved');
            setIsProcessing(false);
            // handleClose();

            if (interval) clearInterval(interval);
          }
        } catch (error) {
          console.error('Error checking deposit status:', error);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, amount, method?.id, user?.id, orderId, step]);

  const refreshUserCoins = async () => {
    try {
      const sessionId = localStorage.getItem('qai_session');
      if (!sessionId) return;

      const data = await getUserCoins(sessionId);
      updateUserCoinsInLocalStorage(data.coins);
    } catch (error: any) {
      console.error('Không lấy được coins:', error.message);
    }
  };

  const updateUserCoinsInLocalStorage = (newCoins: number) => {
    const userStr = localStorage.getItem('qai_user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      user.coins = newCoins;
      localStorage.setItem('qai_user', JSON.stringify(user));
      setUser(user)
    } catch (e) {
      console.error('Lỗi parse user từ localStorage:', e);
    }
  };

  function generateRandomString(length = 13): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  // Timer countdown - chỉ chạy khi modal đang mở
  useEffect(() => {
    if (!isOpen) return;

    if (step === 'qr' && timeLeft > 0) {
      const timer = setTimeout(
        () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
        1000
      );
      return () => clearTimeout(timer);
    }

    if (step === 'qr' && timeLeft === 0) {
      setStep('pending');
    }
  }, [isOpen, step, timeLeft]);

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
    if (isProcessing) {
      return;
    }

    const sessionId = localStorage.getItem('qai_session') || '';

    try {
      setIsProcessing(true);
      setStep('pending');

      const transactionData = {
        user_id: user?.id,
        transaction_id: orderId,
        amount: amount,
        type: 'deposit',
        description: 'Thanh toán nạp coin ví',
        status: 'pending'
      };

      if (sessionId) {
        const result = await createTransaction(sessionId, transactionData);

        toast({
          title: "⏳ Chờ xác nhận",
          description: "Thanh toán thành công vui lòng chờ trong ít phút. Admin sẽ kiểm duyệt và cộng coin cho bạn!",
        });

        return true;
      }

      return false;
    } catch (error) {
      return false;
    } finally {

    }

  };

  const handleClose = () => {
    // setStep('qr');
    // setTimeLeft(900);
    onClose();
    window.location.reload();
  };

  const finalAmount = amount - method.fee;
  const totalReceived = finalAmount;

  useEffect(() => {
    if (isOpen) {
      const newOrderId = `qai_${generateRandomString(13)}`;
      setOrderId(newOrderId);
      setStep('qr');
      setTimeLeft(900);
    }
  }, [isOpen]);

  const getPaymentInstructions = () => {
    if (!user) return { title: "Thanh toán", steps: [] };

    // Transfer content: QAI + amount + account ID
    const transferContent = orderId;

    switch (method.id) {
      case 'momo':
        return {
          title: "Thanh toán qua Ví MoMo",
          steps: [
            "Mở ứng dụng MoMo trên điện thoại",
            "Chọn 'Quét mã QR' hoặc 'Chuyển tiền'",
            "Quét mã QR hoặc nhập thông tin chuyển khoản",
            "Nhập đúng số tiền và nội dung chuyển khoản",
            "Đã thanh toán"
          ],
          account: '19073157703011',
          accountName: 'NGUYEN QUOC ANH',
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
            "Nhấn nút 'Đã thanh toán'",
          ],
          account: '19073157703011',
          accountName: 'NGUYEN QUOC ANH',
          bank: "Techcombank",
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
  const accountName = 'NGUYEN QUOC ANH';
  const paymentInfo = getPaymentInstructions();
  const qrUrl = `https://img.vietqr.io/image/TCB-${paymentInfo.account}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(orderId)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full mx-auto bg-white border border-gray-200 shadow-xl max-h-[90dvh] overflow-y-auto overscroll-contain">
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
          {/* Hướng dẫn - Đặt đầu tiên để người dùng dễ thấy */}
          {step === 'qr' && (
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📋</span> Hướng dẫn
                </h4>
                <div className="space-y-2 text-sm">
                  {paymentInfo.steps.slice(0, 6).map((s, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-5 h-5 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm leading-tight">{s}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
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

          {/* QR Code & Bank Transfer */}
          {step === 'qr' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-gray-800 mb-3">Mã QR thanh toán</h4>
                  <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3 border">
                    <img src={qrUrl} alt="QR Thanh toán VietQR" className="w-40 h-40" />
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
                            {orderId}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Timer & Button - Mobile: nút trên cùng, Desktop: giữ thứ tự */}
          {step === 'qr' && (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4 flex flex-col-reverse lg:flex-col gap-4">
                <div className="flex items-center justify-center space-x-2 p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">Còn lại:</span>
                  <span className="font-mono font-bold text-orange-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-center text-sm font-medium text-gray-700 lg:mb-0">
                  <span className="lg:hidden">Sau khi chuyển khoản xong, hãy nhấn nút phía trên:</span>
                  <span className="hidden lg:inline">Sau khi chuyển khoản xong, hãy nhấn nút bên dưới:</span>
                </p>
                <Button
                  onClick={handlePaymentConfirmation}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-full min-w-0 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl ring-2 ring-green-400/50 ring-offset-2 ring-offset-white transition-all duration-200 cursor-pointer select-none active:scale-[0.98] border-2 border-green-400/30 overflow-hidden"
                  disabled={isProcessing}
                  type="button"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin shrink-0" />
                        <span className="text-sm sm:text-base font-bold truncate">Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span className="text-sm sm:text-base font-bold whitespace-nowrap shrink-0">Đã thanh toán</span>
                      </>
                    )}
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Step - Clean white design */}
          {step === 'pending' && (
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
                    Chúng tôi đang kiểm tra giao dịch của bạn. Quá trình này sẽ hoàn thành trong vài phút. <span className='text-red-700 font-bold'>Vui lòng không tắt cửa sổ trình duyệt này</span>
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
                    Nếu sau 10 phút chưa được duyệt liên hệ <span className='font-bold'>Zalo: 038.966.0305</span>
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
          {step === 'approved' && (
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
            {step === 'approved' ? 'Hoàn thành' : 'Hủy bỏ'}
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