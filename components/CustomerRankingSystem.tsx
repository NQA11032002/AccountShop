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

export interface CustomerRank {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  backgroundColor: string;
  minSpent: number;
  minOrders: number;
  benefits: string[];
  gifts: {
    name: string;
    description: string;
    icon: string;
  }[];
  nextRankProgress?: number;
}

export const customerRanks: CustomerRank[] = [
  {
    id: 'bronze',
    name: 'Đồng',
    icon: Medal,
    color: '#CD7F32',
    backgroundColor: 'bg-gradient-to-r from-amber-600 to-orange-700',
    minSpent: 0,
    minOrders: 0,
    benefits: [
      'Hỗ trợ cơ bản 24/7',
      'Bảo hành tài khoản 30 ngày',
      'Ưu đãi 5% cho lần mua tiếp theo'
    ],
    gifts: [
      {
        name: 'Voucher giảm giá 10k',
        description: 'Áp dụng cho đơn hàng từ 50k',
        icon: '🎟️'
      }
    ]
  },
  {
    id: 'silver',
    name: 'Bạc',
    icon: Shield,
    color: '#C0C0C0',
    backgroundColor: 'bg-gradient-to-r from-gray-400 to-gray-600',
    minSpent: 500000,
    minOrders: 3,
    benefits: [
      'Hỗ trợ ưu tiên',
      'Bảo hành tài khoản 60 ngày',
      'Ưu đãi 10% cho lần mua tiếp theo',
      'Được tham gia các chương trình sale sớm'
    ],
    gifts: [
      {
        name: 'Voucher giảm giá 30k',
        description: 'Áp dụng cho đơn hàng từ 100k',
        icon: '🎫'
      },
      {
        name: 'Tài khoản Spotify 1 tháng',
        description: 'Miễn phí tài khoản Spotify Premium',
        icon: '🎵'
      }
    ]
  },
  {
    id: 'gold',
    name: 'Vàng',
    icon: Star,
    color: '#FFD700',
    backgroundColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    minSpent: 1500000,
    minOrders: 8,
    benefits: [
      'Hỗ trợ VIP 24/7',
      'Bảo hành tài khoản 90 ngày',
      'Ưu đãi 15% cho mọi đơn hàng',
      'Ưu tiên hàng đầu trong sale',
      'Tư vấn cá nhân hóa',
      'Miễn phí shipping'
    ],
    gifts: [
      {
        name: 'Voucher giảm giá 60k',
        description: 'Áp dụng cho đơn hàng từ 200k',
        icon: '💳'
      },
      {
        name: 'Netflix Premium 1 tháng',
        description: 'Miễn phí tài khoản Netflix Premium',
        icon: '🎬'
      },
      {
        name: 'Ưu đãi độc quyền',
        description: 'Truy cập các gói ưu đãi đặc biệt',
        icon: '🔥'
      }
    ]
  },
  {
    id: 'platinum',
    name: 'Bạch Kim',
    icon: Gem,
    color: '#E5E4E2',
    backgroundColor: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    minSpent: 5000000,
    minOrders: 20,
    benefits: [
      'Dedicated Account Manager',
      'Bảo hành tài khoản trọn đời',
      'Ưu đãi 25% cho mọi đơn hàng',
      'Truy cập trước 24h mọi sản phẩm mới',
      'Tư vấn & hỗ trợ cao cấp',
      'Miễn phí mọi dịch vụ thêm',
      'Tham gia cộng đồng VIP riêng'
    ],
    gifts: [
      {
        name: 'Voucher giảm giá 100k',
        description: 'Áp dụng cho mọi đơn hàng',
        icon: '💎'
      },
      {
        name: 'Bundle Premium 3 tháng',
        description: 'Netflix + Spotify + YouTube Premium',
        icon: '📦'
      },
      {
        name: 'Gói ChatGPT Plus',
        description: 'Miễn phí ChatGPT Plus 2 tháng',
        icon: '🤖'
      },
      {
        name: 'Quà tặng sinh nhật VIP',
        description: 'Quà tặng đặc biệt vào sinh nhật',
        icon: '🎁'
      }
    ]
  },
  {
    id: 'diamond',
    name: 'Kim Cương',
    icon: Crown,
    color: '#B9F2FF',
    backgroundColor: 'bg-gradient-to-r from-cyan-400 to-blue-600',
    minSpent: 15000000,
    minOrders: 50,
    benefits: [
      'CEO Support Line (hotline riêng)',
      'Bảo hành vô thời hạn mọi sản phẩm',
      'Ưu đãi 35% + các ưu đãi độc quyền',
      'Sản phẩm mới được test trước',
      'Dịch vụ concierge cá nhân',
      'Không giới hạn refund/exchange',
      'Tham gia phát triển sản phẩm mới',
      'Thu nhập thụ động từ referral'
    ],
    gifts: [
      {
        name: 'Voucher giảm giá 150k',
        description: 'Voucher cao cấp không giới hạn sử dụng',
        icon: '👑'
      },
      {
        name: 'All-Access Premium Bundle',
        description: 'Trọn bộ tài khoản premium mới nhất',
        icon: '🌟'
      },
      {
        name: 'Thiết bị công nghệ',
        description: 'iPhone/iPad hoặc laptop hàng năm',
        icon: '📱'
      },
      {
        name: 'Du lịch VIP',
        description: 'Chuyến du lịch hàng năm trị giá 50 triệu',
        icon: '✈️'
      },
      {
        name: 'Thu nhập thụ động',
        description: '5% hoa hồng từ người giới thiệu',
        icon: '💰'
      }
    ]
  }
];

export function calculateCustomerRank(totalSpent: number, totalOrders: number): CustomerRank {
  console.log('Calculating rank for:', { totalSpent, totalOrders });
  
  // Sort ranks by requirements (highest first)
  const sortedRanks = [...customerRanks].reverse();
  
  for (const rank of sortedRanks) {
    if (totalSpent >= rank.minSpent && totalOrders >= rank.minOrders) {
      console.log('Customer qualifies for rank:', rank.name);
      return rank;
    }
  }
  
  // Default to Bronze if no requirements met
  console.log('Customer defaults to Bronze rank');
  return customerRanks[0];
}

export function calculateNextRankProgress(
  currentRank: CustomerRank, 
  totalSpent: number, 
  totalOrders: number
): { nextRank: CustomerRank | null; progressPercentage: number; remainingSpent: number; remainingOrders: number } {
  console.log('Calculating next rank progress for:', currentRank.name);
  
  const currentIndex = customerRanks.findIndex(rank => rank.id === currentRank.id);
  const nextRank = currentIndex < customerRanks.length - 1 ? customerRanks[currentIndex + 1] : null;
  
  if (!nextRank) {
    console.log('Already at highest rank');
    return { nextRank: null, progressPercentage: 100, remainingSpent: 0, remainingOrders: 0 };
  }
  
  const remainingSpent = Math.max(0, nextRank.minSpent - totalSpent);
  const remainingOrders = Math.max(0, nextRank.minOrders - totalOrders);
  
  // Calculate progress based on both spent amount and order count
  const spentProgress = totalSpent / nextRank.minSpent;
  const orderProgress = totalOrders / nextRank.minOrders;
  const progressPercentage = Math.min(100, Math.min(spentProgress, orderProgress) * 100);
  
  console.log('Next rank progress:', {
    nextRank: nextRank.name,
    progressPercentage,
    remainingSpent,
    remainingOrders
  });
  
  return { nextRank, progressPercentage, remainingSpent, remainingOrders };
}

interface CustomerRankDisplayProps {
  customerEmail: string;
  totalSpent: number;
  totalOrders: number;
  className?: string;
}

export function CustomerRankDisplay({ 
  customerEmail, 
  totalSpent, 
  totalOrders, 
  className = '' 
}: CustomerRankDisplayProps) {
  const currentRank = calculateCustomerRank(totalSpent, totalOrders);
  const { nextRank, progressPercentage, remainingSpent, remainingOrders } = 
    calculateNextRankProgress(currentRank, totalSpent, totalOrders);
  
  const RankIcon = currentRank.icon;
  
  console.log('Rendering rank display for:', customerEmail, {
    currentRank: currentRank.name,
    totalSpent,
    totalOrders,
    progressPercentage
  });

  return (
    <Card className={`border-2 border-opacity-50 ${className}`} style={{ borderColor: currentRank.color }}>
      <CardHeader className={`${currentRank.backgroundColor} text-white`}>
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
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
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