'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Ticket, Copy, Check, Gift, Calendar, RefreshCw } from 'lucide-react';
import { getMyVouchers, type CustomerVoucherItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

function formatDiscount(v: CustomerVoucherItem): string {
  return `Giảm ${v.value.toLocaleString('vi-VN')}đ`;
}

function VoucherCard({ v, onCopy }: { v: CustomerVoucherItem; onCopy: (code: string) => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(v.code);
    setCopied(true);
    onCopy(v.code);
    setTimeout(() => setCopied(false), 2000);
  };
  const isAvailable = v.is_valid && !v.is_used;

  return (
    <Card className={`overflow-hidden ${!isAvailable ? 'opacity-75 bg-gray-50' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {v.title && <span className="font-medium text-gray-900">{v.title}</span>}
              <Badge variant={v.source === 'mission' ? 'secondary' : v.source === 'rank_reward' ? 'default' : v.source === 'reward_exchange' ? 'default' : 'secondary'} className="text-xs">
                {v.source === 'reward_exchange' ? 'Đổi điểm' : v.source === 'rank_reward' ? 'Phần thưởng hạng' : v.source === 'mission' ? 'Nhiệm vụ' : 'Tặng'}
              </Badge>
              {!isAvailable && (
                <Badge variant="outline">{v.is_used ? 'Đã dùng' : 'Hết hạn'}</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{formatDiscount(v)}</p>
            {v.min_amount > 0 && (
              <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu: {v.min_amount.toLocaleString('vi-VN')}đ</p>
            )}
            {v.expires_at && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> HSD: {new Date(v.expires_at).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
          <div className="sm:w-32 border-t sm:border-t-0 sm:border-l border-gray-200 flex flex-col items-center justify-center p-4 gap-2 bg-gray-50/50">
            <code className="text-sm font-mono font-semibold text-gray-800">{v.code}</code>
            {isAvailable && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã copy' : 'Sao chép'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyVouchersPage() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<CustomerVoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'used' | 'expired' | 'all'>('available');

  const load = async () => {
    if (!sessionId) return;
    try {
      // Luôn tải toàn bộ voucher (all) rồi lọc theo tab ở client → đảm bảo voucher đổi điểm hiển thị đúng
      const res = await getMyVouchers(sessionId, { status: 'all' });
      setVouchers(res.data || []);
    } catch (e) {
      console.error('Load vouchers error:', e);
      toast({ title: 'Lỗi', description: 'Không tải được danh sách voucher', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load();
  }, [user, sessionId]);

  // Refetch khi quay lại trang (sau khi đổi thưởng ở trang khác)
  useEffect(() => {
    if (!sessionId) return;
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [sessionId]);

  const onCopy = (code: string) => {
    toast({ title: 'Đã copy mã', description: `Mã ${code} đã được sao chép. Dán tại trang thanh toán.` });
  };

  // Lọc theo tab từ danh sách đầy đủ (đã luôn gọi API status=all)
  const availableList = vouchers.filter((v) => v.is_valid && !v.is_used);
  const usedList = vouchers.filter((v) => v.is_used);
  const expiredList = vouchers.filter((v) => !v.is_used && !v.is_valid);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kho voucher của tôi</h1>
              <p className="text-gray-600 text-sm">Voucher từ đổi điểm, nhiệm vụ, phần thưởng hạng hoặc được tặng. Dùng mã tại bước thanh toán.</p>
            </div>
          </div>
          {user && (
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); load(); }} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          )}
        </div>

        {!user ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Vui lòng đăng nhập để xem voucher của bạn.
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="available">Có thể dùng</TabsTrigger>
              <TabsTrigger value="used">Đã dùng</TabsTrigger>
              <TabsTrigger value="expired">Hết hạn</TabsTrigger>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
            </TabsList>
            <TabsContent value="available" className="mt-4">
              {availableList.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Chưa có voucher nào có thể dùng.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {availableList.map((v) => (
                    <VoucherCard key={v.id} v={v} onCopy={onCopy} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="used" className="mt-4">
              {usedList.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Chưa có voucher đã dùng.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {usedList.map((v) => (
                    <VoucherCard key={v.id} v={v} onCopy={onCopy} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="expired" className="mt-4">
              {expiredList.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Chưa có voucher hết hạn.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {expiredList.map((v) => (
                    <VoucherCard key={v.id} v={v} onCopy={onCopy} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              {vouchers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Chưa có voucher nào.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {vouchers.map((v) => (
                    <VoucherCard key={v.id} v={v} onCopy={onCopy} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
