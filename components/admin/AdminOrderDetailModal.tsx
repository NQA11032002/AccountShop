"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  Edit,
  Save,
  X,
  RefreshCw,
  BarChart3,
  TrendingUp,
  DollarSign,
  Phone,
  MapPin,
  Tag,
  History,
  Settings,
  Download,
  FileText,
  Contact
} from 'lucide-react';

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerName?: string;
  products: any[];
  total: number;
  originalTotal?: number;
  discount?: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: string;
  completedAt?: string;
  shippingAddress?: string;
  customerPhone?: string;
  notes?: string;
  customerAccounts?: any[];
  analytics?: {
    totalItems: number;
    avgItemPrice: number;
    discountPercentage: number;
    daysSinceOrder: number;
  };
}

interface AdminOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedOrder: Order) => void;
  onStatusChange?: (orderId: string, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => void;
}

export default function AdminOrderDetailModal({
  order,
  isOpen,
  onClose,
  onSave,
  onStatusChange
}: AdminOrderDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState<{ [key: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<Array<{ status: string; timestamp: string; by: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      setEditedOrder({ ...order });
      // Simulate status history
      setStatusHistory([
        { status: 'pending', timestamp: order.createdAt, by: 'Hệ thống' },
        { status: 'processing', timestamp: order.createdAt, by: 'Admin' },
        { status: order.status, timestamp: order.completedAt || order.createdAt, by: 'Admin' }
      ]);
    }
  }, [order]);

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
      toast({
        title: "Đã sao chép!",
        description: "Thông tin đã được sao chép vào clipboard."
      });
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

  const handleSaveOrder = () => {
    if (editedOrder && onSave) {
      onSave(editedOrder);
      setIsEditing(false);
      toast({
        title: "Cập nhật thành công",
        description: `Đơn hàng #${editedOrder.id} đã được cập nhật.`
      });
    }
  };

  const handleStatusChange = (newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    if (editedOrder) {
      const updatedOrder = { ...editedOrder, status: newStatus };
      setEditedOrder(updatedOrder);

      if (onStatusChange) {
        onStatusChange(order.id, newStatus);
      }

      // Add to status history
      setStatusHistory(prev => [...prev, {
        status: newStatus,
        timestamp: new Date().toISOString(),
        by: 'Admin'
      }]);

      toast({
        title: "Trạng thái đã cập nhật",
        description: `Đơn hàng #${order.id} đã chuyển sang trạng thái: ${newStatus}`
      });
    }
  };

  const getOrderAnalytics = () => {
    const analytics = order.analytics || {
      totalItems: order.products.length,
      avgItemPrice: order.total / order.products.length,
      discountPercentage: order.originalTotal ? Math.round(((order.originalTotal - order.total) / order.originalTotal) * 100) : 0,
      daysSinceOrder: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    };

    return {
      ...analytics,
      profitMargin: Math.round(Math.random() * 30 + 15), // Simulated
      customerLifetimeValue: Math.floor(Math.random() * 5000000 + 1000000), // Simulated
      reorderProbability: Math.round(Math.random() * 50 + 30) // Simulated
    };
  };

  const analytics = getOrderAnalytics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Chi tiết đơn hàng #{order.id}</span>
                <p className="text-sm text-gray-600 font-normal flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(editedOrder?.status || order.status)}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-red-50 text-red-600 hover:bg-red-100" : ""}
              >
                {isEditing ? <X className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                {isEditing ? "Hủy" : "Chỉnh sửa"}
              </Button> */}
              {/* {isEditing && (
                <Button size="sm" onClick={handleSaveOrder} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-1" />
                  Lưu
                </Button>
              )} */}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Chi tiết</span>
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Khách hàng</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Thanh toán</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Tài khoản</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Thống kê</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Lịch sử</span>
            </TabsTrigger>
          </TabsList>

          {/* Order Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tổng giá trị</p>
                    <p className="text-3xl font-bold text-brand-blue">
                      {(editedOrder?.total || order.total).toLocaleString('vi-VN')}đ
                    </p>
                    {order.analytics?.discountPercentage && order.analytics.discountPercentage > 0 && (
                      <p className="text-sm text-green-600 flex items-center justify-center mt-1">
                        <Gift className="w-3 h-3 mr-1" />
                        Tiết kiệm {order.analytics.discountPercentage}%
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-semibold text-lg">{order.paymentMethod}</p>
                    <p className="text-sm text-green-600 mt-1">✓ Đã thanh toán</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    {isEditing ? (
                      <Select value={editedOrder?.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ xử lý</SelectItem>
                          <SelectItem value="processing">Đang xử lý</SelectItem>
                          <SelectItem value="completed">Hoàn thành</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-2">
                        {getStatusBadge(editedOrder?.status || order.status)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-brand-blue" />
                  <span>Sản phẩm ({order.products.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{product.image || '📦'}</div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.quantity || 1}x • {product.duration || 'N/A'}
                          </p>
                          {product.category && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {((product.price || 0) * (product.quantity || 1)).toLocaleString('vi-VN')}đ
                        </span>
                        <p className="text-xs text-gray-500">
                          {(product.price || 0).toLocaleString('vi-VN')}đ/cái
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  {order.originalTotal && order.originalTotal > order.total && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tạm tính:</span>
                      <span className="line-through">{order.originalTotal.toLocaleString('vi-VN')}đ</span>
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

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-brand-blue" />
                  <span>Ghi chú quản lý</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedOrder?.notes || ''}
                    onChange={(e) => setEditedOrder(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="Thêm ghi chú cho đơn hàng..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-600">
                    {order.notes || 'Chưa có ghi chú nào cho đơn hàng này.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Tab */}
          <TabsContent value="customer" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-brand-blue" />
                    <span>Thông tin cơ bản</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Tên khách hàng</p>
                      <p className="font-medium">{order.customerName || order.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <div className='flex items-center'>
                        <p className="font-medium">{order.userEmail}</p>
                        <Button variant="ghost" className='bg-blue-400 hover:bg-blue-500 ml-3' size="sm" onClick={() => handleCopy(order.userEmail, 'email')}>
                          {copiedField === 'email' ? '✓ Đã sao chép' : 'Sao chép'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Link</p>
                        <p className="font-medium">{order.shippingAddress}</p>
                      </div>
                    </div>
                  )}

                  {order.customerPhone && (
                    <div className="flex items-start space-x-3">
                      <Contact className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Contact/Zalo</p>
                        <p className="font-medium">{order.customerPhone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-brand-blue" />
                    <span>Thống kê khách hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{analytics.daysSinceOrder}</p>
                      <p className="text-sm text-blue-700">Ngày từ đặt hàng</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{analytics.reorderProbability}%</p>
                      <p className="text-sm text-green-700">Khả năng mua lại</p>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-semibold text-purple-700">
                      {analytics.customerLifetimeValue.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-purple-600">Giá trị khách hàng dự kiến</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-800">
                    <CreditCard className="w-5 h-5" />
                    <span>Thông tin thanh toán</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Phương thức:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      {order.paymentMethod}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Trạng thái thanh toán:</span>
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Đã thanh toán
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Số tiền:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {order.total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Thời gian thanh toán:</span>
                    <span className="text-sm font-medium">
                      {formatDate(order.completedAt || order.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-800">
                    <BarChart3 className="w-5 h-5" />
                    <span>Thông tin giao dịch</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      {/* <p className="text-2xl font-bold text-blue-600">#{order.id.slice(-6)}</p> */}
                      <p className="text-sm text-blue-700">Mã giao dịch</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600">{order.products.length}</p>
                      <p className="text-sm text-blue-700">Sản phẩm</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Phí xử lý:</span>
                      <span className="text-sm text-gray-600">0đ</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Thuế VAT:</span>
                      <span className="text-sm text-gray-600">Đã bao gồm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Chiết khấu:</span>
                      <span className="text-sm text-green-600">
                        {order.discount ? `-${order.discount.toLocaleString('vi-VN')}đ` : '0đ'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-brand-blue" />
                  <span>Timeline thanh toán</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">Thanh toán thành công</p>
                      <p className="text-sm text-green-700">{formatDate(order.completedAt || order.createdAt)}</p>
                    </div>
                    <Badge className="bg-green-500 text-white">Hoàn tất</Badge>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Xử lý thanh toán</p>
                      <p className="text-sm text-blue-700">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className="bg-blue-500 text-white">Hoàn tất</Badge>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Tạo đơn hàng</p>
                      <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className="bg-gray-500 text-white">Hoàn tất</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            {order.customerAccounts && order.customerAccounts.length > 0 ? (
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
                              Ẩn chi tiết
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
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tài khoản nào</h3>
                  <p className="text-gray-600">Đơn hàng này chưa có tài khoản khách hàng được giao.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <p className="text-2xl font-bold">{analytics.totalItems}</p>
                    <p className="text-sm text-blue-200">Tổng sản phẩm</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-200" />
                    <p className="text-2xl font-bold">{analytics.profitMargin}%</p>
                    <p className="text-sm text-green-200">Tỷ suất lợi nhuận</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                    <p className="text-2xl font-bold">{analytics.discountPercentage}%</p>
                    <p className="text-sm text-purple-200">Giảm giá</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-200" />
                    <p className="text-2xl font-bold">{analytics.daysSinceOrder}</p>
                    <p className="text-sm text-orange-200">Ngày từ đặt hàng</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Phân tích chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Giá trung bình/sản phẩm:</span>
                    <span className="font-semibold">{analytics.avgItemPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Khả năng mua lại:</span>
                    <span className="font-semibold text-green-600">{analytics.reorderProbability}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Giá trị khách hàng dự kiến:</span>
                    <span className="font-semibold text-purple-600">{analytics.customerLifetimeValue.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-brand-blue" />
                  <span>Lịch sử trạng thái</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusHistory.map((status, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(status.status)}
                      <div className="flex-1">
                        <p className="font-medium capitalize">{status.status}</p>
                        <p className="text-sm text-gray-600">{formatDate(status.timestamp)}</p>
                      </div>
                      <Badge variant="outline">{status.by}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-brand-blue" />
                  <span>Hành động quản lý</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Đồng bộ dữ liệu</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Gửi email KH</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Tạo hóa đơn</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}