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

} from 'lucide-react';
import { Order } from '@/types/order.interface';


interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const [showAccountDetails, setShowAccountDetails] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!order) return null;

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
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      console.log("📋 Copied to clipboard:", { fieldName });
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{order.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-brand-blue">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Accounts */}
          {order.customerAccounts && order.customerAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Tài khoản đã giao</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.customerAccounts.map((account, index) => (
                    <Card key={index} className="border border-green-200 bg-green-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-green-900">{account.productType}</h4>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              {account.status}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAccountDetails(account.id)}
                            className="text-green-600 border-green-300 hover:bg-green-100"
                          >
                            {showAccountDetails[account.id] ? (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Ẩn
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Xem chi tiết
                              </>
                            )}
                          </Button>
                        </div>

                        {showAccountDetails[account.id] && (
                          <div className="space-y-3 mt-4 pt-4 border-t border-green-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-green-800">Email tài khoản:</label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={account.accountEmail}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopy(account.accountEmail, `email-${account.id}`)}
                                    className="text-green-600 border-green-300 hover:bg-green-100"
                                  >
                                    {copiedField === `email-${account.id}` ? '✓' : <Copy className="w-3 h-3" />}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-green-800">Mật khẩu:</label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="password"
                                    value={account.accountPassword}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopy(account.accountPassword, `password-${account.id}`)}
                                    className="text-green-600 border-green-300 hover:bg-green-100"
                                  >
                                    {copiedField === `password-${account.id}` ? '✓' : <Copy className="w-3 h-3" />}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {account.link && (
                              <div className="mt-3">
                                <Button
                                  onClick={() => window.open(account.link, '_blank')}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Truy cập {account.productType}
                                </Button>
                              </div>
                            )}

                            <Alert className="bg-green-50 border-green-200">
                              <Shield className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-800">
                                <strong>Lưu ý:</strong> Vui lòng bảo mật thông tin tài khoản. Không chia sẻ với người khác.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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