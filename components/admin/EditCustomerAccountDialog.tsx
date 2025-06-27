"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CustomerAccount {
  id: string;
  accountEmail: string;
  accountPassword: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productType: string;
  productIcon: string;
  productColor: string;
  purchaseDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended';
  link?: string;
  orderId: string;
  duration: string;
  purchasePrice: number;
}

interface EditCustomerAccountDialogProps {
  account: CustomerAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: CustomerAccount) => void;
}

const productTypes = [
  { value: 'Netflix Premium', icon: '🎬', color: 'bg-red-500' },
  { value: 'Spotify Premium', icon: '🎵', color: 'bg-green-500' },
  { value: 'ChatGPT Plus', icon: '🤖', color: 'bg-purple-500' },
  { value: 'YouTube Premium', icon: '📺', color: 'bg-red-600' },
  { value: 'Adobe Creative Cloud', icon: '🎨', color: 'bg-orange-500' },
  { value: 'Microsoft Office 365', icon: '📊', color: 'bg-blue-500' },
  { value: 'Canva Pro', icon: '✨', color: 'bg-purple-600' },
  { value: 'Figma Pro', icon: '🎯', color: 'bg-indigo-500' }
];

export function EditCustomerAccountDialog({ account, open, onOpenChange, onSave }: EditCustomerAccountDialogProps) {
  const [formData, setFormData] = useState<CustomerAccount>({
    id: '',
    accountEmail: '',
    accountPassword: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    productType: '',
    productIcon: '',
    productColor: '',
    purchaseDate: new Date(),
    expiryDate: new Date(),
    status: 'active',
    link: '',
    orderId: '',
    duration: '',
    purchasePrice: 0
  });

  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();

  useEffect(() => {
    if (account) {
      setFormData(account);
      setPurchaseDate(new Date(account.purchaseDate));
      setExpiryDate(new Date(account.expiryDate));
    } else {
      // Reset form for new account
      const newId = Date.now().toString();
      setFormData({
        id: newId,
        accountEmail: '',
        accountPassword: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        productType: '',
        productIcon: '',
        productColor: '',
        purchaseDate: new Date(),
        expiryDate: new Date(),
        status: 'active',
        link: '',
        orderId: `ORD_${newId}`,
        duration: '',
        purchasePrice: 0
      });
      setPurchaseDate(new Date());
      setExpiryDate(new Date());
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedAccount = {
      ...formData,
      purchaseDate: purchaseDate || new Date(),
      expiryDate: expiryDate || new Date()
    };

    onSave(updatedAccount);
    onOpenChange(false);
  };

  const handleProductTypeChange = (value: string) => {
    const selectedProduct = productTypes.find(p => p.value === value);
    setFormData(prev => ({
      ...prev,
      productType: value,
      productIcon: selectedProduct?.icon || '',
      productColor: selectedProduct?.color || ''
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, accountPassword: password }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {account ? 'Chỉnh sửa tài khoản khách hàng' : 'Thêm tài khoản khách hàng mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin khách hàng</h3>
              
              <div>
                <Label htmlFor="customerName">Tên khách hàng *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email khách hàng *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Số điện thoại *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="0901234567"
                  required
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin tài khoản</h3>
              
              <div>
                <Label htmlFor="accountEmail">Email tài khoản *</Label>
                <Input
                  id="accountEmail"
                  type="email"
                  value={formData.accountEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountEmail: e.target.value }))}
                  placeholder="account@service.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accountPassword">Mật khẩu tài khoản *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accountPassword"
                    value={formData.accountPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountPassword: e.target.value }))}
                    placeholder="Password123!"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomPassword}
                    className="whitespace-nowrap"
                  >
                    Tạo ngẫu nhiên
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="productType">Loại sản phẩm *</Label>
                <Select value={formData.productType} onValueChange={handleProductTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        <div className="flex items-center space-x-2">
                          <span>{product.icon}</span>
                          <span>{product.value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="link">Link dịch vụ</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://service.com"
                />
              </div>
            </div>
          </div>

          {/* Dates and Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Ngày mua *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {purchaseDate ? format(purchaseDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={(date) => {
                      setPurchaseDate(date);
                      setFormData(prev => ({ ...prev, purchaseDate: date || new Date() }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Ngày hết hạn *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={(date) => {
                      setExpiryDate(date);
                      setFormData(prev => ({ ...prev, expiryDate: date || new Date() }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="duration">Thời hạn</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thời hạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 tháng">1 tháng</SelectItem>
                  <SelectItem value="3 tháng">3 tháng</SelectItem>
                  <SelectItem value="6 tháng">6 tháng</SelectItem>
                  <SelectItem value="12 tháng">12 tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái *</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'expired' | 'suspended') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderId">Mã đơn hàng</Label>
              <Input
                id="orderId"
                value={formData.orderId}
                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="ORD_001"
                disabled={!!account}
              />
            </div>
            
            <div>
              <Label htmlFor="purchasePrice">Giá mua *</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                placeholder="89000"
                required
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white"
            >
              {account ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}