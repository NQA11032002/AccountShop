'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Award,
  Star,
  Gem,
  Trophy,
  Gift,
  TrendingUp,
  Medal,
  Shield,
  Zap
} from 'lucide-react';
import { CustomerRank } from '@/types/RankingData.interface';
import { fetchRanks } from '@/lib/api';
import { useEffect, useState } from 'react';
import clsx from 'clsx';


interface CustomerRankDisplayProps {
  customerEmail: string;
  totalSpent: number;
  totalOrders: number;
  className?: string;
}

const backgroundColorMap: Record<string, string> = {
  'bg-yellow-800': 'bg-yellow-800',
  'bg-slate-300': 'bg-slate-300',
  'bg-yellow-300': 'bg-yellow-300',
  'bg-purple-300': 'bg-purple-300',
  'bg-cyan-300': 'bg-cyan-300',
  'bg-rose-600': 'bg-rose-600',
  // fallback:
  default: 'bg-gray-400',
};

export function CustomerRankDisplay({
  customerEmail,
  totalSpent,
  totalOrders,
  className = ''
}: CustomerRankDisplayProps) {
  const [ranks, setRanks] = useState<CustomerRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRank, setCurrentRank] = useState<CustomerRank | null>(null);
  const [nextRank, setNextRank] = useState<CustomerRank | null>(null);
  const [progress, setProgress] = useState(0);
  const [remainingSpent, setRemainingSpent] = useState(0);
  const [remainingOrders, setRemainingOrders] = useState(0);

  useEffect(() => {
    const loadRanks = async () => {
      try {
        const sessionId = localStorage.getItem('session_id') || '';
        const data = await fetchRanks(totalSpent, totalOrders, sessionId);
        setRanks(data);

        const eligible = data.filter((r: CustomerRank) =>
          totalSpent >= r.minSpent && totalOrders >= r.minOrders
        );

        const current = eligible.at(-1) || data[0];
        setCurrentRank(current);

        const index = data.findIndex((r: CustomerRank) => r.id === current.id);
        const next = index < data.length - 1 ? data[index + 1] : null;
        setNextRank(next);

        if (next) {
          const spentPct = totalSpent / next.minSpent;
          const orderPct = totalOrders / next.minOrders;
          const progress = Math.min(100, ((spentPct + orderPct) / 2) * 100);

          setProgress(progress);
          setRemainingSpent(Math.max(0, next.minSpent - totalSpent));
          setRemainingOrders(Math.max(0, next.minOrders - totalOrders));
        } else {
          setProgress(100);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading ranks:', error);
      }
    };

    loadRanks();
  }, [totalSpent, totalOrders]);


  if (loading || !currentRank) return <p>Đang tải thông tin hạng...</p>;

  const RankIcon = currentRank.icon;


  return (
    <Card className={`border-2 border-opacity-50 overflow-hidden ${className}`} style={{ borderColor: currentRank.color }}>
      <CardHeader className={clsx(
        backgroundColorMap[currentRank.backgroundColor as keyof typeof backgroundColorMap] || backgroundColorMap.default,
        'text-white'
      )}>
        <CardTitle className="flex items-center space-x-3">
          <RankIcon className="w-6 h-6" />
          <span>Hạng {currentRank.name}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {customerEmail}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">
                {totalSpent.toLocaleString('vi-VN')}đ
              </div>
              <div className="text-sm text-gray-600">Tổng chi tiêu</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{totalOrders}</div>
              <div className="text-sm text-gray-600">Tổng đơn hàng</div>
            </div>
          </div>

          {/* Next Rank Progress */}
          {nextRank && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Tiến độ lên hạng {nextRank.name}
                </span>
                <span className="text-sm font-bold" style={{ color: nextRank.color }}>
                  {progress.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-3"
                style={{
                  background: `linear-gradient(to right, ${currentRank.color}30, ${nextRank.color}30)`
                }}
              />
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {remainingSpent > 0 && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Còn {remainingSpent.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {remainingOrders > 0 && (
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-3 h-3" />
                    <span>Còn {remainingOrders} đơn hàng</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
              <Award className="w-4 h-4" style={{ color: currentRank.color }} />
              <span>Quyền lợi hiện tại</span>
            </h4>
            <div className="space-y-2">
              {currentRank.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Zap className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gifts */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
              <Gift className="w-4 h-4" style={{ color: currentRank.color }} />
              <span>Phần thưởng đặc biệt</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {currentRank.gifts.map((gift, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{gift.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800">{gift.name}</div>
                    <div className="text-xs text-gray-600">{gift.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerRankDisplay;