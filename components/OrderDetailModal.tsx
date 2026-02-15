"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  Calendar,
  CreditCard,
  User,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Shield,
  Gift,
  Copy,
  Eye,
  EyeOff,
  CalendarPlus,
  Loader2,
} from 'lucide-react';
import { Order } from '@/types/order.interface';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { renewAccount } from '@/lib/api';


interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRenewSuccess?: () => void;
}

export default function OrderDetailModal({ order, isOpen, onClose, onRenewSuccess }: OrderDetailModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, sessionId, setUser } = useAuth();
  const { balance, canAfford, formatCoins, syncBalanceFromServer } = useWallet();
  const [showAccountDetails, setShowAccountDetails] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [renewingAccountId, setRenewingAccountId] = useState<number | null>(null);

  if (!order) return null;

  const handleRenewAccount = async (account: { id: number; productId?: number | null; productPrice?: number | null }) => {
    if (typeof window === 'undefined' || !sessionId) return;
    const price = account.productPrice != null ? Number(account.productPrice) : null;
    if (price == null || price <= 0) {
      toast({
        title: 'Không xác định giá gia hạn',
        description: 'Vui lòng liên hệ hỗ trợ.',
        variant: 'destructive',
      });
      return;
    }
    if (!canAfford(price)) {
      toast({
        title: 'Số dư không đủ',
        description: `Cần thêm ${formatCoins(Math.max(0, price - balance))} để gia hạn. Chuyển đến trang nạp tiền.`,
        variant: 'destructive',
      });
      onClose();
      router.push('/wallet');
      return;
    }
    setRenewingAccountId(account.id);
    try {
      const data = await renewAccount(sessionId, account.id);
      if (data.new_coins != null) {
        syncBalanceFromServer(data.new_coins);
        if (user) {
          const updatedUser = { ...user, coins: data.new_coins };
          setUser(updatedUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('qai_user', JSON.stringify(updatedUser));
          }
        }
      }
      toast({
        title: 'Gia hạn thành công',
        description: data.expiry_date ? `Tài khoản gia hạn đến ${new Date(data.expiry_date).toLocaleDateString('vi-VN')}` : 'Đã gia hạn tài khoản.',
      });
      onRenewSuccess?.();
      onClose();
    } catch (e: any) {
      if (e?.status === 402) {
        toast({
          title: 'Số dư không đủ',
          description: 'Vui lòng nạp thêm tiền để gia hạn.',
          variant: 'destructive',
        });
        onClose();
        router.push('/wallet');
      } else {
        toast({
          title: 'Gia hạn thất bại',
          description: e?.message || 'Vui lòng thử lại sau.',
          variant: 'destructive',
        });
      }
    } finally {
      setRenewingAccountId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} border text-sm`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize font-medium">
          {status === 'completed' ? 'Hoàn thành' : status === 'processing' ? 'Đang xử lý' : status === 'pending' ? 'Chờ xử lý' : status}
        </span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Trì hoãn cập nhật state để tránh re-render làm dialog nháy/đóng
      setTimeout(() => {
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      }, 0);
    } catch (error) {
      console.error("❌ Failed to copy:", error);
    }
  };

  const toggleAccountDetails = (accountId: string) => {
    setShowAccountDetails(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onFocusOutside={(e) => {
          // Giữ dialog mở khi focus nhảy (vd. toast sau khi sao chép), tránh nháy/đóng
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Đơn hàng #{order.id}</span>
              <p className="text-sm text-gray-600 font-normal flex items-center mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="ml-auto">
              {getStatusBadge(order.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng giá trị đơn hàng</p>
                  <p className="text-3xl font-bold text-brand-blue">
                    {order.total.toLocaleString('vi-VN')}đ
                  </p>
                  {order.analytics?.discountPercentage && order.analytics.discountPercentage > 0 && (
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <Gift className="w-3 h-3 mr-1" />
                      Tiết kiệm {order.analytics.discountPercentage}%
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="font-semibold">{order.payment_method}</p>
                  <p className="text-sm text-green-600 mt-1">✓ Đã thanh toán</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-brand-blue" />
                <span>Sản phẩm đã mua ({order.order_products?.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_products?.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{product.image || '📦'}</div>
                      <div>
                        <p className="font-medium text-gray-900">{product.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {product.quantity || 1}x • {product.duration || 'N/A'} • {(product.price || 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {((product.price || 0) * (product.quantity || 1)).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Pricing Details */}
              <div className="space-y-2">
                {order.original_total && order.original_total > order.total && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="line-through">{order.original_total.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {/* {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{order.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )} */}
                <div className="flex justify-between font-bold text-lg ">
                  <span>Tổng cộng:</span>
                  <span className="text-brand-blue">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Tài khoản đã giao</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customerAccounts && order.customerAccounts.length > 0 ? (
                <div className="space-y-4" data-dialog-credentials>
                  {order.customerAccounts.map((account, index) => (
                    <Card key={index} className="border border-green-200 bg-green-50/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-green-900">{account.productType}</h4>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              {account.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Tài khoản */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-green-800">Tài khoản / Email:</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={account.accountEmail}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCopy(account.accountEmail, `email-${account.id}`);
                                }}
                                className="text-green-600 border-green-300 hover:bg-green-100"
                              >
                                {copiedField === `email-${account.id}` ? '✓' : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>

                          {/* Mật khẩu hiển thị rõ */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-green-800">Mật khẩu:</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={account.accountPassword}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCopy(account.accountPassword, `password-${account.id}`);
                                }}
                                className="text-green-600 border-green-300 hover:bg-green-100"
                              >
                                {copiedField === `password-${account.id}` ? '✓' : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>

                          {/* Mã bảo mật */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-green-800">Mã bảo mật:</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={account.securityCode}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCopy(account.securityCode, `security-${account.id}`);
                                }}
                                className="text-green-600 border-green-300 hover:bg-green-100"
                              >
                                {copiedField === `security-${account.id}` ? '✓' : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>

                          {/* Thời hạn sử dụng */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-green-800">Thời hạn sử dụng:</label>
                            <input
                              type="text"
                              value={account.duration ? `${account.duration} tháng` : 'Không giới hạn'}
                              readOnly
                              className="w-full px-3 py-2 bg-white border border-green-200 rounded text-sm"
                            />
                          </div>
                        </div>

                        {/* Hướng dẫn */}
                        <div className="space-y-2 mt-2">
                          <label className="text-sm font-medium text-green-800">Hướng dẫn sử dụng:</label>
                          <div className="flex items-start space-x-2">
                            <textarea
                              value={account.instructions}
                              readOnly
                              rows={3}
                              className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm resize-none"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCopy(account.instructions, `guide-${account.id}`);
                              }}
                              className="mt-0.5 text-green-600 border-green-300 hover:bg-green-100"
                            >
                              {copiedField === `guide-${account.id}` ? '✓' : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-green-200">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRenewAccount(account);
                            }}
                            disabled={renewingAccountId === account.id}
                          >
                            {renewingAccountId === account.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <CalendarPlus className="w-3 h-3 mr-1" />
                            )}
                            Gia hạn
                          </Button>
                        </div>

                        <Alert className="bg-green-50 border-green-200 mt-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>Lưu ý:</strong> Vui lòng bảo mật thông tin tài khoản. Không chia sẻ với người khác.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Đơn hàng này hiện chưa có tài khoản nào được giao. Vui lòng chờ trong giây lát hoặc liên hệ hỗ trợ nếu bạn cần kiểm tra thêm.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-brand-blue" />
                  <span>Thông tin khách hàng</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tên khách hàng</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.user_email}</p>
                  </div>
                </div>

                {order.customer_phone && (
                  <div className="flex items-start space-x-3">
                    <Package className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{order.customer_phone}</p>
                    </div>
                  </div>
                )}

                {order.shipping_address && (
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Zalo - Social</p>
                      <p className="font-medium">{order.shipping_address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-brand-blue" />
                  <span>Thông tin thanh toán</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                    <p className="font-medium">{order.payment_method}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                    <p className="font-medium text-green-600">{order.payment_status || 'Đã thanh toán'}</p>
                  </div>
                </div>

                {order.completed_at && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Hoàn thành lúc</p>
                      <p className="font-medium">{formatDate(order.completed_at)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}