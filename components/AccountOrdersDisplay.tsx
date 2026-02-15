"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Order, OrdersData, OrdersMeta } from '@/types/order.interface';
import { toast } from '@/hooks/use-toast';
import { fetchOrders, FetchUserOrdersResponse } from '@/lib/api';

const PER_PAGE = 5;


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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginationMeta, setPaginationMeta] = useState<OrdersMeta | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }

    try {
      const response: FetchUserOrdersResponse = await fetchOrders(sessionId, currentPage, PER_PAGE);

      setOrders(response.orders);
      setPaginationMeta(response.meta);

      setOrdersData({
        orders: response.orders,
        statistics: {
          totalOrders: response.statistics.totalOrders ?? response.meta.total,
          totalSpent: response.statistics.totalSpent,
          totalOrderCompledted: response.statistics.totalOrderCompleted,
          averageOrderValue: response.statistics.averageOrderValue,
          lastOrderDate: response.statistics.lastOrderDate,
          totalOrderProducts: response.statistics.totalOrderProducts,
        },
        meta: response.meta,
      });
    } catch (err) {
      console.error('❌ Lỗi tải đơn hàng:', err);
      setError('Không thể tải dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [user, sessionId, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} border text-xs sm:text-sm`}>
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

  // Tính số ngày từ ngày tạo đơn (tránh sai do timezone từ API)
  const getDaysSinceOrder = (createdAt: string): number => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    orderDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - orderDate.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const formatDaysAgo = (createdAt: string): string => {
    const days = getDaysSinceOrder(createdAt);
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
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
        onRenewSuccess={loadOrders}
      />

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-blue-100 text-xs sm:text-sm">Tổng đơn hàng</p>
                <p className="text-xl sm:text-3xl font-bold truncate">
                  {ordersData?.statistics.totalOrders ?? orders.length}
                </p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-green-100 text-xs sm:text-sm">Tổng chi tiêu</p>
                <p className="text-lg sm:text-3xl font-bold truncate">{ordersData.statistics.totalSpent.toLocaleString('vi-VN')}đ</p>
              </div>
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-green-200 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-purple-100 text-xs sm:text-sm">Tổng đơn hoàn thành</p>
                <p className="text-xl sm:text-3xl font-bold">{ordersData.statistics.totalOrderCompledted}</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-orange-100 text-xs sm:text-sm">Tài khoản</p>
                <p className="text-xl sm:text-3xl font-bold">{ordersData.statistics.totalOrderProducts || 0}</p>
              </div>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Lịch sử đơn hàng</CardTitle>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto h-auto flex flex-wrap gap-1 p-1.5 sm:p-1">
                <TabsTrigger value="all" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5">Tất cả</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5">Hoàn thành</TabsTrigger>
                <TabsTrigger value="processing" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5">Đang xử lý</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5">Chờ xử lý</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                          {getDaysSinceOrder(order.created_at) <= 1 && (
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
                    <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                      {getStatusBadge(order.status)}
                      <p className="text-base sm:text-lg font-bold text-gray-900">
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
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Sản phẩm đã mua:</h4>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {order.order_products?.map((product, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg min-w-0">
                          <div className="text-xl sm:text-2xl shrink-0">{product.image || '📦'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.product_name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {product.quantity || 1}x • {product.duration || 'N/A'} • {(product.price || 0).toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Accounts */}
                  {order.customerAccounts && order.customerAccounts.length > 0 && (
                    <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Tài khoản đã giao:</h4>
                      <div className="space-y-2">
                        {order.customerAccounts.map((account, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                              <span className="text-green-800 font-medium">{account.productType}</span>
                              <span className="text-xs text-green-700">
                                Thời hạn sử dụng: {account.duration ? `${account.duration} tháng` : 'Không giới hạn'}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              {account.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Analytics */}
                  {order.analytics && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
                      <span>{order.analytics.totalItems} sản phẩm</span>
                      {order.analytics.discountPercentage > 0 && (
                        <span className="text-green-600">Tiết kiệm {order.analytics.discountPercentage}%</span>
                      )}
                      <span>{formatDaysAgo(order.created_at)}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>Đơn hàng #{order.id}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 hover:bg-brand-blue hover:text-white transition-all"
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

          {paginationMeta && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Hiển thị{" "}
                {Math.min(
                  (paginationMeta.current_page - 1) * paginationMeta.per_page + 1,
                  paginationMeta.total
                )}
                {" - "}
                {Math.min(
                  paginationMeta.current_page * paginationMeta.per_page,
                  paginationMeta.total
                )}{" "}
                trong tổng {paginationMeta.total} đơn hàng
              </p>
              <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  disabled={paginationMeta.current_page <= 1}
                  onClick={() =>
                    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                  }
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-700">
                  Trang {paginationMeta.current_page}/{paginationMeta.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  disabled={paginationMeta.current_page >= paginationMeta.last_page}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < paginationMeta.last_page ? prev + 1 : prev
                    )
                  }
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}