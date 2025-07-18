"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Package,
  CreditCard,
  Star,
  TrendingUp,
  Eye,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import { Order, OrdersData } from '@/types/order.interface';
import { toast } from '@/hooks/use-toast';
import { fetchOrders } from '@/lib/api';


export default function AccountOrdersDisplay() {
  const { user } = useAuth();
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { sessionId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchOrders(sessionId); // API trả về { orders, statistics }

        setOrders(response.orders); // danh sách đơn hàng
        setOrdersData({
          orders: response.orders,
          statistics: {
            totalOrders: response.statistics.totalOrders,
            totalSpent: response.statistics.totalSpent,
            totalOrderCompledted: response.statistics.totalOrderCompleted,
            averageOrderValue: response.statistics.averageOrderValue,
            lastOrderDate: response.statistics.lastOrderDate,
            totalOrderProducts: response.statistics.totalOrderProducts,
          },
        });
      } catch (err) {
        console.error('❌ Lỗi tải đơn hàng:', err);
        setError('Không thể tải dữ liệu đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, sessionId]);

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
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} border`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = ordersData?.orders.filter(order =>
    selectedStatus === 'all' || order.status === selectedStatus
  ) || [];

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập để xem đơn hàng</h3>
          <p className="text-gray-600">Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!ordersData || ordersData.orders.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h3>
          <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</p>
          <Button onClick={() => window.location.href = '/products'}>
            Mua sắm ngay
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCloseDetailModal = () => {
    console.log("❌ Closing order detail modal");
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Tổng đơn hàng</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Tổng chi tiêu</p>
                <p className="text-3xl font-bold">{ordersData.statistics.totalSpent.toLocaleString('vi-VN')}đ</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Tổng đơn hoàn thành</p>
                <p className="text-3xl font-bold">{ordersData.statistics.totalOrderCompledted}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Tài khoản</p>
                <p className="text-3xl font-bold">{ordersData.statistics.totalOrderProducts || 0}</p>
              </div>
              <Star className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</CardTitle>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
                <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
                <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                          {(order.analytics?.daysSinceOrder || 0) <= 1 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm">
                              ✨ Mới
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.created_at)}
                        </p>
                        {order.payment_method && (
                          <p className="text-xs text-gray-500">
                            💳 {order.payment_method}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {order.total.toLocaleString('vi-VN')}đ
                      </p>
                      {(order.analytics?.discountPercentage || 0) > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Tiết kiệm {order.analytics?.discountPercentage || 0}%
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Products */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Sản phẩm đã mua:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.order_products?.map((product, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl">{product.image || '📦'}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {product.quantity || 1}x • {product.duration || 'N/A'} • {(product.price || 0).toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Accounts */}
                  {order.customerAccounts && order.customerAccounts.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Tài khoản đã giao:</h4>
                      <div className="space-y-2">
                        {order.customerAccounts.map((account, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-green-800">{account.productType}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                {account.status}
                              </Badge>
                              {account.link && (
                                <Button size="sm" variant="ghost" onClick={() => window.open(account.link, '_blank')}>
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Analytics */}
                  {order.analytics && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>{order.analytics.totalItems} sản phẩm</span>
                      {order.analytics.discountPercentage > 0 && (
                        <span className="text-green-600">Tiết kiệm {order.analytics.discountPercentage}%</span>
                      )}
                      <span>{order.analytics.daysSinceOrder} ngày trước</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>Đơn hàng #{order.id}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 hover:bg-brand-blue hover:text-white transition-all"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Xem chi tiết</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}