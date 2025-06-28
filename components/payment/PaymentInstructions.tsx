"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Check, 
  Clock, 
  Building2, 
  Bitcoin, 
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PaymentInstructionsProps {
  paymentData: {
    method: string;
    transactionId: string;
    amount: number;
    status: string;
    transferInfo?: any;
    cryptoInfo?: any;
  };
  onStatusChange?: (status: string) => void;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  paymentData,
  onStatusChange
}) => {
  const [copiedField, setCopiedField] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState(paymentData.status);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast();

  console.log("PaymentInstructions rendered", { paymentData, currentStatus });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Đã sao chép!",
        description: `${fieldName} đã được sao chép vào clipboard.`,
      });
      
      setTimeout(() => {
        setCopiedField('');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const checkPaymentStatus = async () => {
    setIsCheckingStatus(true);
    console.log("Checking payment status", { transactionId: paymentData.transactionId, method: paymentData.method });

    try {
      const response = await fetch(`/api/payments?transactionId=${paymentData.transactionId}&method=${paymentData.method}`);
      const result = await response.json();
      
      if (result.success) {
        const newStatus = result.data.status;
        console.log("Payment status updated", { oldStatus: currentStatus, newStatus });
        
        setCurrentStatus(newStatus);
        
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        
        if (newStatus === 'completed' && currentStatus !== 'completed') {
          toast({
            title: "Thanh toán đã xác nhận! 🎉",
            description: "Giao dịch của bạn đã được xử lý thành công.",
          });
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast({
        title: "Lỗi kiểm tra trạng thái",
        description: "Không thể kiểm tra trạng thái thanh toán.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Auto-check status for pending payments
  useEffect(() => {
    if (currentStatus === 'pending') {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentStatus]);

  const StatusBadge = () => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Đang chờ' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Hoàn tất' },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Thất bại' }
    };

    const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {paymentData.method === 'banking' ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <Bitcoin className="w-5 h-5" />
                )}
                <span>
                  {paymentData.method === 'banking' ? 'Hướng dẫn chuyển khoản' : 'Hướng dẫn thanh toán Crypto'}
                </span>
              </CardTitle>
              <CardDescription>
                Mã giao dịch: {paymentData.transactionId}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge />
              <Button
                variant="outline"
                size="sm"
                onClick={checkPaymentStatus}
                disabled={isCheckingStatus}
              >
                {isCheckingStatus ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Banking Instructions */}
      {paymentData.method === 'banking' && paymentData.transferInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chuyển khoản</CardTitle>
            <CardDescription>
              Vui lòng chuyển khoản chính xác số tiền và nội dung bên dưới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Quan trọng:</strong> Chuyển đúng số tiền và nội dung để được xử lý tự động
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Ngân hàng</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{paymentData.transferInfo.bankName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Số tài khoản</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono">{paymentData.transferInfo.bankAccount}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentData.transferInfo.bankAccount, 'Số tài khoản')}
                    >
                      {copiedField === 'Số tài khoản' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Chủ tài khoản</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{paymentData.transferInfo.accountHolder}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Số tiền chuyển</label>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-bold text-blue-700 text-lg">
                      {formatPrice(paymentData.transferInfo.transferAmount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.transferInfo.transferAmount.toString(), 
                        'Số tiền'
                      )}
                    >
                      {copiedField === 'Số tiền' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Nội dung chuyển khoản</label>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-mono text-yellow-800">
                      {paymentData.transferInfo.transferContent}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.transferInfo.transferContent, 
                        'Nội dung'
                      )}
                    >
                      {copiedField === 'Nội dung' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Mã tham chiếu</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{paymentData.transferInfo.referenceCode}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Lưu ý quan trọng:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Chuyển đúng số tiền: <strong>{formatPrice(paymentData.transferInfo.transferAmount)}</strong></li>
                <li>• Ghi đúng nội dung: <strong>{paymentData.transferInfo.transferContent}</strong></li>
                <li>• Giao dịch sẽ được xử lý trong vòng 5-15 phút</li>
                <li>• Liên hệ hỗ trợ nếu không nhận được tài khoản sau 30 phút</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crypto Instructions */}
      {paymentData.method === 'crypto' && paymentData.cryptoInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thanh toán Crypto</CardTitle>
            <CardDescription>
              Chuyển {paymentData.cryptoInfo.cryptoType} theo thông tin bên dưới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Bitcoin className="h-4 w-4" />
              <AlertDescription>
                <strong>Lưu ý:</strong> Giao dịch crypto có thể mất 10-30 phút để xác nhận
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Địa chỉ nhận</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm break-all">
                      {paymentData.cryptoInfo.paymentAddress}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.cryptoInfo.paymentAddress, 
                        'Địa chỉ ví'
                      )}
                    >
                      {copiedField === 'Địa chỉ ví' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Số lượng cần chuyển</label>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-bold text-orange-700">
                      {paymentData.cryptoInfo.cryptoAmount} {paymentData.cryptoInfo.cryptoType}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.cryptoInfo.cryptoAmount, 
                        'Số lượng'
                      )}
                    >
                      {copiedField === 'Số lượng' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Mã tham chiếu</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{paymentData.cryptoInfo.referenceCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  QR Code cho thanh toán nhanh
                </p>
                <Button variant="outline" size="sm">
                  <QrCode className="w-4 h-4 mr-2" />
                  Xem QR Code
                </Button>
              </div>
            </div>

            <Separator />

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Hướng dẫn:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Chuyển đúng số lượng: <strong>{paymentData.cryptoInfo.cryptoAmount} {paymentData.cryptoInfo.cryptoType}</strong></li>
                <li>• Đến địa chỉ: <strong className="break-all">{paymentData.cryptoInfo.paymentAddress}</strong></li>
                <li>• Giao dịch cần ít nhất 3 confirmations trên blockchain</li>
                <li>• Thời gian xử lý: 10-30 phút tùy network congestion</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status and Next Steps */}
      <Card>
        <CardContent className="pt-6">
          {currentStatus === 'pending' ? (
            <div className="text-center space-y-4">
              <Clock className="w-12 h-12 text-yellow-500 mx-auto" />
              <div>
                <h3 className="font-medium text-gray-900">Đang chờ thanh toán</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Chúng tôi sẽ tự động xác nhận khi nhận được thanh toán
                </p>
              </div>
              <Button onClick={checkPaymentStatus} variant="outline" disabled={isCheckingStatus}>
                {isCheckingStatus ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Kiểm tra ngay
                  </>
                )}
              </Button>
            </div>
          ) : currentStatus === 'completed' ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-medium text-green-700">Thanh toán thành công!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tài khoản đã được gửi về email của bạn
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className="font-medium text-red-700">Thanh toán thất bại</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Vui lòng liên hệ hỗ trợ để được trợ giúp
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentInstructions;