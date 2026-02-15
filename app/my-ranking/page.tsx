'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext';
import Header from '@/components/Header';
import {
  CustomerRankDisplay,
} from '@/components/CustomerRankingSystem';
import {
  Crown,
  Trophy,
  Gift,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
  Calendar,
  ShoppingBag,
  Coins,
  History,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import type { RankingData } from '@/types/RankingData.interface';
import { fetchUserRankingData, claimUserReward } from '@/lib/api';

export default function MyRankingPage() {
  const { user, sessionId } = useAuth();
  const { orders, getOrderStats } = usePayment();
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRankingData();
    }
  }, [user, orders]);


  const loadRankingData = async () => {
    if (!user || !sessionId) return;
    try {
      const data = await fetchUserRankingData(sessionId);
      setRankingData(data);
    } catch (error) {
      console.error("❌ Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  };


  const claimReward = async (rewardId: number) => {

    if (!rankingData || !user) return;

    const reward = rankingData.availableRewards.find(r => r.id === rewardId);
    if (!reward || reward.claimed || rankingData.rankingPoints < reward.pointsCost) {
      return;
    }

    try {
      const data = await claimUserReward(rewardId, sessionId as string);

      const newPointsTotal = (data as { remaining_points?: number }).remaining_points ?? rankingData.rankingPoints - reward.pointsCost;
      const voucherCode = (data as { voucher_code?: string }).voucher_code;

      const updatedRewards = rankingData.availableRewards.map(r =>
        r.id === rewardId ? { ...r, claimed: true } : r
      );

      setRankingData({
        ...rankingData,
        availableRewards: updatedRewards,
        rankingPoints: newPointsTotal,
      });

      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "🎉 Đổi thưởng thành công!",
        description: voucherCode
          ? `Bạn đã nhận ${reward.name}. Voucher đã thêm vào Kho voucher (mã: ${voucherCode}). Điểm còn lại: ${newPointsTotal.toLocaleString('vi-VN')}`
          : `Bạn đã nhận ${reward.name}. Điểm còn lại: ${newPointsTotal.toLocaleString('vi-VN')}`,
        duration: 6000,
      });
    } catch (error) {
      console.error("❌ Error claiming reward:", error);

      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "❌ Đổi thưởng thất bại",
        description: (error as Error).message || 'Có lỗi xảy ra, vui lòng thử lại',
        duration: 5000,
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Crown className="w-16 h-16 mx-auto mb-4 text-brand-blue" />
            <h2 className="text-2xl font-bold mb-2">Đăng nhập để xem hạng</h2>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin hạng khách hàng</p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-brand-blue to-brand-emerald text-white"
            >
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !rankingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin hạng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Crown className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Hạng Khách Hàng
              </h1>
              <p className="text-gray-600 mt-1">Theo dõi tiến độ và nhận thưởng</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Rank Display */}
          <div className="lg:col-span-1">
            <CustomerRankDisplay
              customerEmail={user.email}
              totalSpent={rankingData.totalSpent}
              totalOrders={rankingData.totalOrders}
              className="mb-6"
            />

            {/* Points Summary */}
            <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-100 to-amber-100 mb-6 shadow-lg shadow-yellow-200/50">
              <CardHeader className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 text-white shadow-inner">
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 drop-shadow-sm" />
                  <span>Điểm Tích Lũy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      {rankingData.rankingPoints.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-sm text-amber-700">Điểm hiện có</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
                      <Sparkles className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <div className="font-semibold text-yellow-600">+50</div>
                      <div className="text-xs text-amber-700">Mua 200k</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-amber-200">
                      <Sparkles className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <div className="font-semibold text-amber-600">+10</div>
                      <div className="text-xs text-amber-700">Mỗi sản phẩm</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="rewards">Phần thưởng</TabsTrigger>
                {/* <TabsTrigger value="history">Lịch sử</TabsTrigger> */}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Next Rank Progress */}
                {rankingData.nextRank && (
                  <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg shadow-amber-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-amber-600" />
                        <span>Tiến độ lên hạng {rankingData.nextRank.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress
                        value={rankingData.progressPercentage}
                        className="h-4"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        {rankingData.remainingSpent > 0 && (
                          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg border border-amber-200">
                            <div className="text-xl font-bold text-amber-600">
                              {rankingData.remainingSpent.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-sm text-amber-700">Còn cần chi tiêu</div>
                          </div>
                        )}
                        {rankingData.remainingOrders > 0 && (
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg border border-orange-200">
                            <div className="text-xl font-bold text-orange-600">
                              {rankingData.remainingOrders}
                            </div>
                            <div className="text-sm text-orange-700">Còn cần đơn hàng</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span>Hành động nhanh</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all duration-200"
                        onClick={() => window.location.href = '/products'}
                      >
                        <ShoppingBag className="w-6 h-6 text-amber-500" />
                        <span className="font-medium text-amber-700">Mua sắm ngay</span>
                        <span className="text-xs text-amber-600">Tích thêm điểm</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-200"
                        onClick={() => window.location.href = '/rankings'}
                      >
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="font-medium text-yellow-700">Xem bảng xếp hạng</span>
                        <span className="text-xs text-yellow-600">So sánh với khác</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <span>Phần thưởng có thể đổi</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rankingData?.availableRewards?.map((reward) => (
                        <Card key={reward.id} className="border-2 border-gradient-to-br from-amber-100 to-yellow-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                          <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-full flex items-center justify-center">
                                  <span className="text-2xl">{reward.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-amber-800">{reward.name}</h4>
                                  <p className="text-sm text-amber-600 mt-1">{reward.description}</p>
                                </div>
                              </div>

                              <div className="text-center py-2">
                                <Badge
                                  variant="outline"
                                  className="text-lg font-bold text-amber-700 border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2"
                                >
                                  {reward.pointsCost} điểm
                                </Badge>
                              </div>
                            </div>

                            <div className="mt-6">
                              <Button
                                className={`w-full h-12 font-semibold text-base transition-all duration-300 ${reward.claimed
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl'
                                  }`}
                                disabled={reward.claimed || rankingData.rankingPoints < reward.pointsCost}
                                onClick={() => claimReward(reward.id)}
                              >
                                {reward.claimed ? '✅ Đã nhận' : '🎁 Đổi thưởng'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="w-5 h-5 text-gray-600" />
                      <span>Lịch sử tích điểm</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rankingData?.recentPurchases?.map((purchase, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {new Date(purchase.date).toLocaleDateString('vi-VN')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {purchase.items.join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-amber-600">+{purchase.points} điểm</p>
                            <p className="text-sm text-amber-700">
                              {purchase.amount.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      ))}
                      {rankingData?.recentPurchases?.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Chưa có lịch sử mua hàng</p>
                          <Button
                            className="mt-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={() => window.location.href = '/products'}
                          >
                            Mua sắm ngay <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}