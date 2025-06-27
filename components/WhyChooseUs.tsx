"use client";

import { Clock, Shield, Headphones, CreditCard, Users, Zap, Award, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WhyChooseUs() {
  console.log("WhyChooseUs component rendered");

  const features = [
    {
      icon: Clock,
      title: 'Giao hàng tự động 24/7',
      description: 'Nhận tài khoản ngay lập tức sau khi thanh toán thành công, không cần chờ đợi.',
      highlight: 'Tức thì',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Shield,
      title: 'Bảo hành tài khoản',
      description: 'Cam kết bảo hành và hỗ trợ đổi tài khoản mới nếu có vấn đề trong thời gian sử dụng.',
      highlight: 'Bảo hành',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Headphones,
      title: 'Hỗ trợ nhanh chóng',
      description: 'Đội ngũ hỗ trợ khách hàng trực tuyến qua Telegram và Zalo, phản hồi trong 5 phút.',
      highlight: '5 phút',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: CreditCard,
      title: 'Đa dạng thanh toán',
      description: 'Chấp nhận nhiều hình thức thanh toán: Momo, chuyển khoản ngân hàng, thẻ cào.',
      highlight: 'Tiện lợi',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: Users,
      title: 'Cộng đồng tin cậy',
      description: 'Được tin tướng bởi hơn 5,000+ khách hàng với hàng nghìn đánh giá tích cực.',
      highlight: '5,000+',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      icon: Zap,
      title: 'Giá cả cạnh tranh',
      description: 'Cam kết mang đến giá tốt nhất thị trường với chất lượng dịch vụ vượt trội.',
      highlight: 'Tốt nhất',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Tài khoản đã bán', icon: Award },
    { number: '5,000+', label: 'Khách hàng hài lòng', icon: Users },
    { number: '98%', label: 'Đánh giá tích cực', icon: RefreshCw },
    { number: '24/7', label: 'Hỗ trợ không ngừng', icon: Clock }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <Badge className="bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 mb-4">
            Vì sao chọn QAI STORE?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
            Lý do khách hàng 
            <span className="gradient-text"> tin tưởng chúng tôi</span>
          </h2>
          <p className="text-lg text-gray-600 text-balance">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tài khoản premium tốt nhất với dịch vụ chuyên nghiệp và uy tín
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`border-2 ${feature.borderColor} hover:shadow-lg transition-all duration-300 group animate-fade-in animation-delay-${index * 100}`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <Badge className={`${feature.color.replace('text-', 'bg-').replace('600', '100')} ${feature.color} border-current`}>
                      {feature.highlight}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className={`text-lg font-bold ${feature.color} group-hover:scale-105 transition-transform duration-200`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-brand rounded-3xl p-8 md:p-12 animate-fade-in animation-delay-600">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Những con số ấn tượng
            </h3>
            <p className="text-white/80">
              Minh chứng cho chất lượng dịch vụ của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center space-y-3 animate-scale-in animation-delay-${700 + index * 100}`}
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center animate-fade-in animation-delay-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Bảo mật tuyệt đối</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Chất lượng đảm bảo</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Hoàn tiền 100%</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Giao hàng tức thì</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}