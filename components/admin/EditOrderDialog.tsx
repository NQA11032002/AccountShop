"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: Order) => void;
}

export function EditOrderDialog({ order, open, onOpenChange, onSave }: EditOrderDialogProps) {
  const [formData, setFormData] = useState<Order>(
    order || {
      id: `ORD-${Date.now()}`,
      userId: '',
      userEmail: '',
      products: [],
      total: 0,
      status: 'pending',
      paymentMethod: 'momo',
      createdAt: new Date().toISOString()
    }
  );

  console.log("EditOrderDialog rendered", { orderId: order?.id, open });

  // Reset form data when order prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(
        order || {
          id: `ORD-${Date.now()}`,
          userId: '',
          userEmail: '',
          products: [],
          total: 0,
          status: 'pending',
          paymentMethod: 'momo',
          createdAt: new Date().toISOString()
        }
      );
      console.log("Form data reset for order", order?.id);
    }
  }, [order, open]);

  const handleSave = () => {
    console.log("Saving order", formData);
    onSave(formData);
    onOpenChange(false);
  };

  const paymentMethods = [
    'momo', 'banking', 'zalopay', 'vnpay', 'paypal', 'credit_card'
  ];

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      momo: 'MoMo',
      banking: 'Chuyển khoản ngân hàng',
      zalopay: 'ZaloPay',
      vnpay: 'VNPay',
      paypal: 'PayPal',
      credit_card: 'Thẻ tín dụng'
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
          </DialogTitle>
          <DialogDescription>
            {order ? `Cập nhật thông tin đơn hàng #${order.id}` : 'Nhập thông tin để tạo đơn hàng mới'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Order ID */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderId" className="text-right">Mã đơn hàng</Label>
            <Input
              id="orderId"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              className="col-span-3"
              placeholder="ORD-123456"
              disabled={!!order}
            />
          </div>

          {/* Customer Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userEmail" className="text-right">Email khách hàng</Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
              className="col-span-3"
              placeholder="customer@example.com"
            />
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Phương thức thanh toán</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {getPaymentMethodLabel(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trạng thái</Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Select 
                value={formData.status} 
                onValueChange={(value: 'pending' | 'processing' | 'completed' | 'cancelled') => 
                  setFormData({...formData, status: value})
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              {getStatusBadge(formData.status)}
            </div>
          </div>

          {/* Total Amount */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">Tổng tiền (VNĐ)</Label>
            <Input
              id="total"
              type="number"
              value={formData.total}
              onChange={(e) => setFormData({...formData, total: parseInt(e.target.value) || 0})}
              className="col-span-3"
              placeholder="89000"
            />
          </div>

          {/* Products */}
          {order && formData.products.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Sản phẩm trong đơn hàng</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded">
                {formData.products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-600">
                      {product.quantity}x {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ngày tạo</Label>
            <div className="col-span-3 text-sm text-gray-600">
              {new Date(formData.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            {order ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}