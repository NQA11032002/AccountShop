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
import { CustomerAccount } from '@/types/CustomerAccount';
import { useAuth } from '@/contexts/AuthContext';
import { getListChatgpts } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

import { createAccount, updateAccount, fetchCategories } from '@/lib/api';
interface EditCustomerAccountDialogProps {
  account: CustomerAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: CustomerAccount) => void;
}


export function EditCustomerAccountDialog({
  account,
  open,
  onOpenChange,
  onSave
}: EditCustomerAccountDialogProps) {
  // formData theo đúng interface CustomerAccount (snake_case)
  const [formData, setFormData] = useState<CustomerAccount>({
    id: 0,
    account_email: '',
    account_password: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    product_type: '',
    product_icon: '',
    product_color: '',
    purchase_date: null,
    expiry_date: null,
    status: 'active',
    link: '',
    order_id: account?.order_id ?? 0,
    duration: account?.duration ?? 0,
    purchase_price: 0,
    chatgpt_id: null

  });


  // State Date riêng cho Calendar
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sessionId } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);  // lưu danh mục
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);  // trạng thái tải danh mục
  const [chatgptOptions, setChatgptOptions] = useState<any[]>([]);
  const [loadingChatgpt, setLoadingChatgpt] = useState<boolean>(false);
  const STATUS_STYLE: Record<number, { label: string; color: string }> = {
    0: { label: "Hết hạn", color: "bg-red-100 text-red-700 border-red-300" },
    1: { label: "Hoạt động", color: "bg-green-100 text-green-700 border-green-300" },
    2: { label: "Gia hạn", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.data);  // Lưu danh mục vào state
      } catch (error) {
        setError('Không thể tải danh mục');
      } finally {
        setLoadingCategories(false);  // Hoàn thành việc tải danh mục
      }
    };

    fetchData();
  }, []);  // Chỉ gọi 1 lần khi component mou

  useEffect(() => {
    if (account) {
      setFormData(account);
      setPurchaseDate(account.purchase_date ? new Date(account.purchase_date) : new Date());
      setExpiryDate(account.expiry_date ? new Date(account.expiry_date) : new Date());
    } else {
      const now = new Date();
      setFormData({
        id: Date.now(),
        account_email: '',
        account_password: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        product_type: '',
        product_icon: '',
        product_color: '',
        purchase_date: now.toISOString().slice(0, 10),
        expiry_date: now.toISOString().slice(0, 10),
        status: 'active',
        link: '',
        order_id: 0,
        duration: 0,
        purchase_price: 0,
        chatgpt_id: null
      });
      setPurchaseDate(now);
      setExpiryDate(now);
    }
  }, [account]);

  const loadChatGPTList = async () => {
    if (!sessionId) return;
    try {
      setLoadingChatgpt(true);
      const res = await getListChatgpts(sessionId); // không filter category / status


      // Laravel paginate → real data nằm trong res.data.data
      setChatgptOptions(res.data || []);

    } catch (err) {
      console.error("Không thể tải danh sách ChatGPT:", err);
    } finally {
      setLoadingChatgpt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const pDate = purchaseDate ?? new Date();
    const eDate = expiryDate ?? new Date();

    const updatedAccount: CustomerAccount = {
      ...formData,
      purchase_date: pDate.toISOString().slice(0, 10),
      expiry_date: eDate.toISOString().slice(0, 10)
    };

    try {
      if (sessionId) {
        if (account) {
          // Update existing account
          await updateAccount(sessionId, account.id.toString(), updatedAccount);
        } else {
          // Create a new account
          await createAccount(sessionId, updatedAccount);
        }
      }

      onSave(updatedAccount);
      onOpenChange(false);
    } catch (err: any) {
      setError('There was an error saving the account');
    } finally {
      setLoading(false);
    }
  };
  const getStatusLabel = (status: number | string) => {
    const s = Number(status);
    switch (s) {
      case 0:
        return "Hết hạn";
      case 1:
        return "Hoạt động";
      case 2:
        return "Gia hạn";
      default:
        return "Không xác định";
    }
  };


  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, account_password: password }));
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
                  value={formData.customer_name || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, customer_name: e.target.value }))
                  }
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email khách hàng *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customer_email || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, customer_email: e.target.value }))
                  }
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Số điện thoại *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customer_phone || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, customer_phone: e.target.value }))
                  }
                  placeholder="0901234567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="link">Link dịch vụ</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="https://service.com"
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
                  value={formData.account_email || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, account_email: e.target.value }))
                  }
                  placeholder="account@service.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accountPassword">Mật khẩu tài khoản *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accountPassword"
                    value={formData.account_password || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, account_password: e.target.value }))
                    }
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

              {/* Chọn danh mục */}
              <div>
                <Label>Danh mục *</Label>
                <Select
                  value={formData.product_type || ''}
                  onValueChange={async (value) => {
                    setFormData(prev => ({
                      ...prev,
                      product_type: value,
                      // nếu không phải Chat GPT thì clear luôn chatgpt_id
                      chatgpt_id: value === "Chat GPT" ? prev.chatgpt_id : null,
                    }));

                    if (value === "Chat GPT") {
                      await loadChatGPTList();
                    }
                  }}
                >

                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCategories ? (
                      <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                    ) : error ? (
                      <SelectItem value="error" disabled>{error}</SelectItem>
                    ) : (
                      categories.map(parent =>
                        parent.categories?.map((child: any) => (
                          <SelectItem key={child.id} value={child.name}>
                            {child.name}
                          </SelectItem>
                        ))
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              {formData.product_type === "Chat GPT" && (
                <div className="mt-4">
                  <Label>Chọn tài khoản ChatGPT *</Label>

                  <Select
                    value={formData.chatgpt_id ? String(formData.chatgpt_id) : ""}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, chatgpt_id: Number(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tài khoản" />
                    </SelectTrigger>

                    <SelectContent>
                      {loadingChatgpt ? (
                        <SelectItem value="loading" disabled>
                          Đang tải danh sách...
                        </SelectItem>
                      ) : chatgptOptions.length > 0 ? (
                        chatgptOptions.map((item: any) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            <div className="flex items-center justify-between w-full">
                              <span>{item.email} — {item.category}</span>

                              <Badge
                                variant="outline"
                                className={`${STATUS_STYLE[item.status].color} ml-2`}
                              >
                                {STATUS_STYLE[item.status].label}
                              </Badge>
                            </div>
                          </SelectItem>

                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          Không có tài khoản ChatGPT nào
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                    {purchaseDate
                      ? format(purchaseDate, 'dd/MM/yyyy', { locale: vi })
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={(date) => {
                      setPurchaseDate(date);
                      setFormData(prev => ({
                        ...prev,
                        purchase_date: date
                          ? date.toISOString().slice(0, 10)
                          : null
                      }));
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
                    {expiryDate
                      ? format(expiryDate, 'dd/MM/yyyy', { locale: vi })
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={(date) => {
                      setExpiryDate(date);
                      setFormData(prev => ({
                        ...prev,
                        expiry_date: date
                          ? date.toISOString().slice(0, 10)
                          : null
                      }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="duration">Thời hạn (tháng)</Label>
              <Select
                value={formData.duration ? String(formData.duration) : ''}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    duration: value ? Number(value) : null
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thời hạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 tháng</SelectItem>
                  <SelectItem value="3">3 tháng</SelectItem>
                  <SelectItem value="6">6 tháng</SelectItem>
                  <SelectItem value="12">12 tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái *</Label>
              <Select
                value={(formData.status as 'active' | 'expired' | 'suspended') || 'active'}
                onValueChange={(value: 'active' | 'expired' | 'suspended') =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
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
                value={formData.order_id ?? 0}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    order_id: e.target.value
                      ? Number(e.target.value)
                      : 0
                  }))
                }
                placeholder="1001"
                disabled={!!account}
              />
            </div>

            <div>
              <Label htmlFor="purchasePrice">Giá mua *</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={formData.purchase_price ?? ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    purchase_price: e.target.value
                      ? Number(e.target.value)
                      : null
                  }))
                }
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
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                // Show a loading spinner when the form is being submitted
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" />
                    <path d="M4 12a8 8 0 1 0 16 0" stroke="currentColor" />
                  </svg>
                  {account ? 'Cập nhật' : 'Tạo mới'} {/* Show the label */}
                </span>
              ) : (
                // Display the normal button label
                <span>{account ? 'Cập nhật' : 'Tạo mới'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
