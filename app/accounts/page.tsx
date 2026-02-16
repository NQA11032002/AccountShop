"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Monitor,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  CalendarPlus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { fetchMyAccounts, renewAccount } from '@/lib/api';
import { useWallet } from '@/contexts/WalletContext';

interface AccountData {
  id: string;
  accountEmail: string;
  accountPassword: string;
  productName: string;
  productIcon: string;
  productColor: string;
  purchaseDate: Date;
  expiryDate: Date;
  platform: string;
  status: 'active' | 'expired' | 'suspended';
  duration: string;
  orderId: string;
  productId?: number | null;
  /** Giá (coin) tương ứng để gia hạn */
  productPrice?: number | null;
  profilePins?: string[];
  notes?: string;
  link?: string;
  hasPendingRenewal?: boolean;
}

export default function AccountsPage() {
  const { user, sessionId, setUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { balance, canAfford, formatCoins, syncBalanceFromServer } = useWallet();

  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [renewingAccountId, setRenewingAccountId] = useState<string | null>(null);

  // Load tài khoản đã mua từ API (chỉ chạy khi đăng nhập/đổi user, không chạy khi user chỉ cập nhật coins)
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !sessionId) {
      setLoading(false);
      setAccounts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchMyAccounts(sessionId)
      .then((res) => {
        if (cancelled) return;
        const list = (res.data ?? []).map((a: any) => {
          const purchaseDate = a.purchaseDate ? new Date(a.purchaseDate) : new Date();
          const expiryDate = a.expiryDate ? new Date(a.expiryDate) : new Date();
          const now = new Date();
          let status: 'active' | 'expired' | 'suspended' = (a.status === 'expired' || now > expiryDate) ? 'expired' : 'active';
          if (a.status === 'renew' || a.status === 'suspended') status = 'suspended';
          return {
            id: String(a.id),
            accountEmail: a.accountEmail ?? '',
            accountPassword: a.accountPassword ?? '',
            productName: a.productType ?? 'Tài khoản',
            productIcon: a.productIcon ?? '🔐',
            productColor: a.productColor ?? 'bg-gray-100',
            purchaseDate,
            expiryDate,
            platform: a.productType ?? 'Premium',
            status,
            duration: a.duration ? `${a.duration} tháng` : '—',
            orderId: String(a.orderId ?? ''),
            productId: a.productId != null ? Number(a.productId) : null,
            productPrice: a.productPrice != null ? Number(a.productPrice) : null,
            profilePins: a.securityCode ? [a.securityCode] : undefined,
            notes: a.instructions ?? undefined,
            link: a.link ?? undefined,
            hasPendingRenewal: !!a.hasPendingRenewal,
          } as AccountData;
        });
        setAccounts(list);
      })
      .catch(() => {
        if (!cancelled) setAccounts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId, sessionId]);

  useEffect(() => {
    let filtered = accounts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(account =>
        account.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.accountEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.platform.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => account.status === statusFilter);
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchQuery, statusFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Hoạt động</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white">Hết hạn</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500 text-white">Tạm ngưng</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCopyCredential = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép!",
      description: "Thông tin đã được sao chép vào clipboard.",
    });
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleRenewAccount = async (account: AccountData) => {
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
      router.push('/wallet');
      return;
    }
    setRenewingAccountId(account.id);
    try {
      const data = await renewAccount(sessionId, Number(account.id));
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
      const res = await fetchMyAccounts(sessionId);
      const list = (res.data ?? []).map((a: any) => {
        const purchaseDate = a.purchaseDate ? new Date(a.purchaseDate) : new Date();
        const expiryDate = a.expiryDate ? new Date(a.expiryDate) : new Date();
        const now = new Date();
        let status: 'active' | 'expired' | 'suspended' = (a.status === 'expired' || now > expiryDate) ? 'expired' : 'active';
        if (a.status === 'renew' || a.status === 'suspended') status = 'suspended';
        return {
          id: String(a.id),
          accountEmail: a.accountEmail ?? '',
          accountPassword: a.accountPassword ?? '',
          productName: a.productType ?? 'Tài khoản',
          productIcon: a.productIcon ?? '🔐',
          productColor: a.productColor ?? 'bg-gray-100',
          purchaseDate,
          expiryDate,
          platform: a.productType ?? 'Premium',
          status,
          duration: a.duration ? `${a.duration} tháng` : '—',
          orderId: String(a.orderId ?? ''),
          productId: a.productId != null ? Number(a.productId) : null,
          productPrice: a.productPrice != null ? Number(a.productPrice) : null,
          profilePins: a.securityCode ? [a.securityCode] : undefined,
          notes: a.instructions ?? undefined,
          link: a.link ?? undefined,
          hasPendingRenewal: !!a.hasPendingRenewal,
        } as AccountData;
      });
      setAccounts(list);
      toast({
        title: 'Gia hạn thành công',
        description: data.expiry_date ? `Tài khoản gia hạn đến ${new Date(data.expiry_date).toLocaleDateString('vi-VN')}` : 'Đã gia hạn tài khoản.',
      });
    } catch (e: any) {
      if (e?.status === 402) {
        toast({
          title: 'Số dư không đủ',
          description: 'Vui lòng nạp thêm tiền để gia hạn.',
          variant: 'destructive',
        });
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

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const accountStats = {
    total: accounts.length,
    active: accounts.filter(acc => acc.status === 'active').length,
    expired: accounts.filter(acc => acc.status === 'expired').length,
    expiringSoon: accounts.filter(acc => {
      const days = getDaysUntilExpiry(acc.expiryDate);
      return acc.status === 'active' && days <= 7 && days > 0;
    }).length
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem Tài khoản của tôi.</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/login')} className="w-full">
              Đăng nhập
            </Button>
            <Button variant="outline" onClick={() => router.push('/register')} className="w-full">
              Đăng ký tài khoản
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const AccountDetailDialog = ({
    account,
    onRenewAccount,
    renewingAccountId: renewingId,
  }: {
    account: AccountData;
    onRenewAccount?: (account: AccountData) => void;
    renewingAccountId?: string | null;
  }) => (
    <DialogContent
      className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col overflow-hidden"
      onFocusOutside={(e) => e.preventDefault()}
    >
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${account.productColor} rounded-lg flex items-center justify-center text-lg`}>
            {account.productIcon}
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate">{account.productName}</div>
            <div className="text-sm text-gray-600 font-normal">Chi tiết tài khoản</div>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 overflow-y-auto overflow-x-hidden pr-1 min-h-0 flex-1">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-blue/10 to-brand-emerald/10 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(account.status)}
            <div>
              <div className="font-semibold">Trạng thái tài khoản</div>
              <div className="text-sm text-gray-600">
                {account.status === 'active' && `Còn ${getDaysUntilExpiry(account.expiryDate)} ngày`}
                {account.status === 'expired' && `Hết hạn ${Math.abs(getDaysUntilExpiry(account.expiryDate))} ngày trước`}
              </div>
            </div>
          </div>
          {getStatusBadge(account.status)}
        </div>

        {/* Account Credentials */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Thông tin đăng nhập</h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border rounded-lg">
              <label className="text-sm font-medium text-gray-600">Email/Username</label>
              <div className="flex items-center justify-between mt-1">
                <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 mr-2">
                  {account.accountEmail}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(() => handleCopyCredential(account.accountEmail), 0);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <label className="text-sm font-medium text-gray-600">Mật khẩu</label>
              <div className="flex items-center justify-between mt-1">
                <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 mr-2">
                  {showPasswords[account.id] ? account.accountPassword : '•'.repeat(account.accountPassword.length)}
                </code>
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTimeout(() => togglePasswordVisibility(account.id), 0);
                    }}
                  >
                    {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTimeout(() => handleCopyCredential(account.accountPassword), 0);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile PINs */}
          {account.profilePins && account.profilePins.length > 0 && (
            <div className="p-4 border rounded-lg">
              <label className="text-sm font-medium text-gray-600">Profile PIN</label>
              <div className="flex items-center space-x-2 mt-2">
                {account.profilePins.map((pin, index) => (
                  <code key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {pin}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {account.notes && (
            <div className="p-4 border rounded-lg min-w-0">
              <label className="text-sm font-medium text-gray-600">Ghi chú</label>
              <p className="text-sm mt-1 break-words">{account.notes}</p>
            </div>
          )}

          {/* Direct Link */}
          {account.link && (
            <div className="p-4 border rounded-lg min-w-0">
              <label className="text-sm font-medium text-gray-600">Liên kết trực tiếp</label>
              <div className="flex items-center gap-2 mt-1 min-w-0">
                <a
                  href={account.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:underline text-sm break-all min-w-0"
                >
                  {account.link}
                </a>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(() => window.open(account.link, '_blank'), 0);
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Purchase Information */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium text-gray-600">Ngày mua</label>
            <p className="text-sm mt-1">{formatDate(account.purchaseDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Ngày hết hạn</label>
            <p className="text-sm mt-1">{formatDate(account.expiryDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Thời hạn</label>
            <p className="text-sm mt-1">{account.duration}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Mã đơn hàng</label>
            <p className="text-sm mt-1">{account.orderId}</p>
          </div>
        </div>

        {onRenewAccount && (
          <div className="pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
              disabled={renewingId === account.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRenewAccount(account);
              }}
            >
              {renewingId === account.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CalendarPlus className="w-4 h-4 mr-2" />
              )}
              Gia hạn
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5">
      <Header />

      <main className="pt-20 pb-16">
        {/* Page Header */}
        <section className="relative bg-gradient-to-r from-brand-blue via-brand-purple to-brand-emerald text-white py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 border border-white/20 rounded-lg rotate-45 animate-bounce"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/25 rounded-full animate-spin"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
                    <Shield className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">🔒</span>
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
                    Quản lý
                  </h1>
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-200 to-white bg-clip-text text-transparent leading-tight">
                    Tài khoản
                  </h1>
                </div>
              </div>

              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Theo dõi và quản lý tất cả tài khoản premium của bạn một cách <span className="text-yellow-300 font-semibold">an toàn</span> và <span className="text-emerald-300 font-semibold">hiệu quả</span>
              </p>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-white mb-1">{accountStats.total}</div>
                  <div className="text-sm text-blue-100 font-medium">Tổng tài khoản</div>
                  <div className="text-xs text-blue-200 mt-1">Đã mua</div>
                </div>
                <div className="bg-green-500/20 backdrop-blur-md rounded-2xl border border-green-300/30 p-6 hover:bg-green-500/25 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-green-200 mb-1">{accountStats.active}</div>
                  <div className="text-sm text-green-100 font-medium">Đang hoạt động</div>
                  <div className="text-xs text-green-200 mt-1">Sẵn sàng sử dụng</div>
                </div>
                <div className="bg-yellow-500/20 backdrop-blur-md rounded-2xl border border-yellow-300/30 p-6 hover:bg-yellow-500/25 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-yellow-200 mb-1">{accountStats.expiringSoon}</div>
                  <div className="text-sm text-yellow-100 font-medium">Sắp hết hạn</div>
                  <div className="text-xs text-yellow-200 mt-1">Cần gia hạn</div>
                </div>
                <div className="bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-300/30 p-6 hover:bg-red-500/25 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-red-200 mb-1">{accountStats.expired}</div>
                  <div className="text-sm text-red-100 font-medium">Hết hạn</div>
                  <div className="text-xs text-red-200 mt-1">Cần mua mới</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">

          {/* Enhanced Account Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="relative bg-gradient-to-br from-brand-blue via-brand-purple to-indigo-600 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">Tổng tài khoản</p>
                    <p className="text-4xl font-black">{accountStats.total}</p>
                    <p className="text-xs text-blue-200 mt-1">Đã sở hữu</p>
                  </div>
                  <div className="relative">
                    <Shield className="w-12 h-12 text-blue-200 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-2">Đang hoạt động</p>
                    <p className="text-4xl font-black">{accountStats.active}</p>
                    <p className="text-xs text-green-200 mt-1">Sẵn sàng dùng</p>
                  </div>
                  <div className="relative">
                    <CheckCircle className="w-12 h-12 text-green-200 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium mb-2">Sắp hết hạn</p>
                    <p className="text-4xl font-black">{accountStats.expiringSoon}</p>
                    <p className="text-xs text-yellow-200 mt-1">Cần gia hạn</p>
                  </div>
                  <div className="relative">
                    <Clock className="w-12 h-12 text-yellow-200 group-hover:rotate-45 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-2">Hết hạn</p>
                    <p className="text-4xl font-black">{accountStats.expired}</p>
                    <p className="text-xs text-red-200 mt-1">Cần mua mới</p>
                  </div>
                  <div className="relative">
                    <AlertCircle className="w-12 h-12 text-red-200 group-hover:shake transition-transform duration-300" />
                    <div className="absolute inset-0 bg-red-400/30 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters */}
          <Card className="mb-12 border-0 shadow-2xl bg-gradient-to-r from-white via-gray-50 to-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 max-w-lg">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-brand-blue" />
                  </div>
                  <Input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên sản phẩm, email hoặc nền tảng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all duration-300 bg-white shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-brand-purple" />
                    <span className="text-sm font-medium text-gray-600">Lọc:</span>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-56 h-12 border-2 border-gray-200 rounded-2xl hover:border-brand-purple transition-colors duration-300 bg-white shadow-sm">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200 rounded-2xl shadow-2xl">
                      <SelectItem value="all" className="text-base py-3">🔥 Tất cả trạng thái</SelectItem>
                      <SelectItem value="active" className="text-base py-3">✅ Đang hoạt động</SelectItem>
                      <SelectItem value="expired" className="text-base py-3">❌ Hết hạn</SelectItem>
                      <SelectItem value="suspended" className="text-base py-3">⏸️ Tạm ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Stats */}
              {(searchQuery || statusFilter !== 'all') && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Hiển thị {filteredAccounts.length} kết quả</span>
                    {searchQuery && <span> cho "{searchQuery}"</span>}
                    {statusFilter !== 'all' && <span> với trạng thái "{statusFilter}"</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Accounts Table */}
          {loading ? (
            <Card className="border-0 shadow-2xl bg-white overflow-hidden">
              <CardContent className="py-20 text-center">
                <RefreshCw className="w-12 h-12 mx-auto text-brand-blue animate-spin mb-4" />
                <p className="text-gray-600">Đang tải danh sách tài khoản của bạn...</p>
              </CardContent>
            </Card>
          ) : filteredAccounts.length > 0 ? (
            <Card className="border-0 shadow-2xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 border-b-0 pb-8">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-xl flex items-center justify-center shadow-lg">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent">
                        Danh sách tài khoản
                      </span>
                      <div className="text-sm text-gray-500 mt-1">{filteredAccounts.length} tài khoản được tìm thấy</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tổng giá trị</div>
                    <div className="text-lg font-bold text-brand-blue">
                      {new Intl.NumberFormat('vi-VN').format(filteredAccounts.length * 50000)}đ
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b-2 border-gray-100">
                        <TableHead className="w-16 py-4 font-semibold text-gray-700"></TableHead>
                        <TableHead className="py-4 font-semibold text-gray-700">Tài khoản</TableHead>
                        <TableHead className="py-4 font-semibold text-gray-700">Người dùng</TableHead>
                        <TableHead className="py-4 font-semibold text-gray-700">Ngày mua</TableHead>
                        <TableHead className="py-4 font-semibold text-gray-700">Ngày hết hạn</TableHead>
                        <TableHead className="py-4 font-semibold text-gray-700">Nền tảng</TableHead>
                        <TableHead className="py-4 font-semibold text-gray-700">Trạng thái</TableHead>
                        <TableHead className="text-right py-4 font-semibold text-gray-700">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account, index) => (
                        <TableRow
                          key={account.id}
                          className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 transition-all duration-200 border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                        >
                          <TableCell className="py-6">
                            <div className={`w-12 h-12 ${account.productColor} rounded-2xl flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform duration-200`}>
                              {account.productIcon}
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div>
                              <div className="font-semibold text-gray-800 text-base">{account.productName}</div>
                              <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg mt-1 inline-block">
                                {account.accountEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-4 h-4 text-brand-blue" />
                              <span className="text-sm font-medium">{formatDate(account.purchaseDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <div>
                                <div className="text-sm font-medium">{formatDate(account.expiryDate)}</div>
                                {account.status === 'active' && (
                                  <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full mt-1 inline-block">
                                    Còn {getDaysUntilExpiry(account.expiryDate)} ngày
                                  </div>
                                )}
                                {account.status === 'expired' && (
                                  <div className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full mt-1 inline-block">
                                    Hết hạn {Math.abs(getDaysUntilExpiry(account.expiryDate))} ngày
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge
                              variant="outline"
                              className="text-sm px-3 py-1 font-medium border-2 border-brand-purple/30 text-brand-purple bg-brand-purple/5 hover:bg-brand-purple/10 transition-colors"
                            >
                              {account.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(account.status)}
                              {getStatusBadge(account.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                disabled={renewingAccountId === account.id}
                                onClick={() => handleRenewAccount(account)}
                              >
                                {renewingAccountId === account.id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <CalendarPlus className="w-4 h-4 mr-1" />
                                )}
                                Gia hạn
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem chi tiết
                                  </Button>
                                </DialogTrigger>
                                <AccountDetailDialog
                                  account={account}
                                  onRenewAccount={handleRenewAccount}
                                  renewingAccountId={renewingAccountId}
                                />
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
              <CardContent className="py-20 text-center">
                <div className="relative mx-auto mb-8">
                  <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Shield className="w-20 h-20 text-gray-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-full flex items-center justify-center shadow-lg">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="max-w-lg mx-auto">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-4">
                    {searchQuery || statusFilter !== 'all' ? '🔍 Không tìm thấy tài khoản' : '🎯 Tài khoản của tôi'}
                  </h3>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy tài khoản bạn đang cần.'
                      : 'Chưa có tài khoản nào được giao. Sau khi đơn hàng hoàn thành và shop gửi tài khoản, danh sách sẽ hiển thị tại đây.'
                    }
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={() => router.push('/products')}
                      className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-emerald hover:from-brand-blue/90 hover:via-brand-purple/90 hover:to-brand-emerald/90 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg font-semibold rounded-2xl"
                    >
                      <Zap className="w-5 h-5 mr-3" />
                      Khám phá sản phẩm
                    </Button>

                    {(searchQuery || statusFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="border-2 border-gray-300 hover:border-brand-blue text-gray-700 hover:text-brand-blue px-6 py-4 text-lg rounded-2xl transition-all duration-300"
                      >
                        <RefreshCw className="w-5 h-5 mr-3" />
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>

                  {!searchQuery && statusFilter === 'all' && (
                    <div className="mt-12 p-6 bg-gradient-to-r from-blue-100/50 to-emerald-100/50 rounded-2xl border border-blue-200/50">
                      <h4 className="font-semibold text-gray-800 mb-2">💡 Gợi ý cho bạn</h4>
                      <p className="text-sm text-gray-600">
                        Mua tài khoản premium để truy cập vào hàng trăm dịch vụ chất lượng cao với giá ưu đãi!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}