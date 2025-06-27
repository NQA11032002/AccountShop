"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Globe, Crown, Check, Star, Heart, Download, Smartphone, Monitor, Tablet } from 'lucide-react';

interface ProductFeaturesProps {
  productId: number;
  features: string[];
}

export default function ProductFeatures({ productId, features }: ProductFeaturesProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getDetailedFeatures = (productId: number) => {
    const productFeatures: { [key: number]: any } = {
      1: { // Netflix
        compatibility: ['Windows', 'macOS', 'iOS', 'Android', 'Smart TV', 'Gaming Console'],
        quality: ['4K Ultra HD', 'HDR10', 'Dolby Atmos', 'Dolby Vision'],
        languages: ['Hơn 30 ngôn ngữ', 'Phụ đề đa ngôn ngữ', 'Audio descriptions'],
        exclusive: ['Netflix Originals', 'Early access content', 'Behind-the-scenes', 'Director cuts']
      },
      2: { // Spotify
        compatibility: ['Web Player', 'Desktop App', 'Mobile App', 'Smart Speakers'],
        quality: ['320kbps High Quality', 'Lossless Audio', 'Spatial Audio', 'Equalizer'],
        languages: ['60+ quốc gia', 'Local content', 'Podcast đa ngôn ngữ'],
        exclusive: ['Spotify Wrapped', 'Discover Weekly', 'Release Radar', 'DJ Mix']
      },
      3: { // ChatGPT Plus
        compatibility: ['Web Browser', 'Mobile App', 'API Access', 'Plugin Support'],
        quality: ['GPT-4 Model', 'Faster response', 'Priority access', 'Advanced reasoning'],
        languages: ['100+ ngôn ngữ', 'Code generation', 'Translation', 'Writing assistant'],
        exclusive: ['DALL-E 3', 'Advanced Data Analysis', 'Web browsing', 'Custom GPTs']
      },
      4: { // YouTube Premium
        compatibility: ['Web', 'Mobile', 'TV App', 'Gaming Console'],
        quality: ['4K Video', 'Enhanced bitrate', 'Background play', 'Picture-in-picture'],
        languages: ['Auto-translate', 'Captions', 'Multi-language audio'],
        exclusive: ['YouTube Music', 'YouTube Originals', 'Offline downloads', 'No ads']
      },
      5: { // Canva Pro
        compatibility: ['Web Browser', 'Desktop App', 'Mobile App', 'Team collaboration'],
        quality: ['Professional templates', 'High-res exports', 'Brand consistency', 'Magic tools'],
        languages: ['100+ ngôn ngữ interface', 'Global fonts', 'Cultural templates'],
        exclusive: ['Background remover', 'Magic resize', 'Brand kit', 'Content planner']
      },
      6: { // Adobe Creative
        compatibility: ['Windows', 'macOS', 'Cloud sync', 'Mobile companion'],
        quality: ['Professional grade', 'Industry standard', '8K support', 'RAW processing'],
        languages: ['Multi-language interface', 'Global fonts', 'Typography tools'],
        exclusive: ['All CC apps', 'Cloud storage', 'Adobe Stock', 'Portfolio website']
      }
    };

    return productFeatures[productId] || {
      compatibility: ['Multi-platform'],
      quality: ['High quality'],
      languages: ['Multi-language'],
      exclusive: ['Premium features']
    };
  };

  const detailedFeatures = getDetailedFeatures(productId);

  const featureTabs = [
    { id: 'overview', name: 'Tổng quan', icon: Globe },
    { id: 'compatibility', name: 'Tương thích', icon: Smartphone },
    { id: 'quality', name: 'Chất lượng', icon: Crown },
    { id: 'exclusive', name: 'Độc quyền', icon: Star }
  ];

  return (
    <div className="space-y-6">
      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
        {featureTabs.map(({ id, name, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-0 ${
              activeTab === id 
                ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white' 
                : 'hover:bg-white'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{name}</span>
          </Button>
        ))}
      </div>

      {/* Feature Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-charcoal mb-4">🎯 Tính năng chính</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-emerald to-brand-blue rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{feature}</div>
                      <div className="text-sm text-gray-600">Tính năng premium chất lượng cao</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compatibility' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-charcoal mb-4">📱 Tương thích thiết bị</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {detailedFeatures.compatibility.map((device: string, index: number) => (
                  <div key={index} className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-blue to-brand-purple rounded-full flex items-center justify-center mx-auto mb-2">
                      {device.includes('Mobile') || device.includes('iOS') || device.includes('Android') ? (
                        <Smartphone className="w-6 h-6 text-white" />
                      ) : device.includes('TV') || device.includes('Desktop') ? (
                        <Monitor className="w-6 h-6 text-white" />
                      ) : (
                        <Tablet className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="font-medium text-gray-800">{device}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-charcoal mb-4">👑 Chất lượng Premium</h3>
              <div className="space-y-3">
                {detailedFeatures.quality.map((quality: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-800">{quality}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Premium
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exclusive' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-charcoal mb-4">⭐ Tính năng độc quyền</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailedFeatures.exclusive.map((exclusive: string, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-lg transition-all">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 mb-1">{exclusive}</div>
                        <div className="text-sm text-gray-600">Chỉ có trong phiên bản Premium</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-brand-emerald" />
            <span>📊 Hiệu suất & Thống kê</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Hỗ trợ</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">SSL</div>
              <div className="text-sm text-gray-600">Bảo mật</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">30d</div>
              <div className="text-sm text-gray-600">Bảo hành</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}