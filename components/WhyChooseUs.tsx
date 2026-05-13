"use client";

import { Clock, Shield, Headphones, CreditCard, Users, Zap, Award, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Clock,
      title: 'Nhận gói theo quy trình',
      description: 'Nhiều gói được xử lý tự động sau khi thanh toán thành công; gói cần xác minh sẽ có hướng dẫn rõ ràng.',
      highlight: 'Rõ ràng',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Shield,
      title: 'Hỗ trợ theo chính sách',
      description: 'Bảo hành, đổi hoặc hoàn tiền (nếu có) được mô tả theo từng sản phẩm và điều khoản đăng ký.',
      highlight: 'Minh bạch',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Headphones,
      title: 'Kênh liên hệ chính thức',
      description: 'Thông tin liên hệ và khung giờ phản hồi được công bố trên website; thời gian xử lý phụ thuộc loại yêu cầu.',
      highlight: 'Tận tâm',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: CreditCard,
      title: 'Thanh toán linh hoạt',
      description: 'Hỗ trợ các phương thức phổ biến (ví điện tử, chuyển khoản, thẻ…) tùy từng gói; chi tiết hiển thị trước khi thanh toán.',
      highlight: 'Tiện lợi',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: Users,
      title: 'Cộng đồng đồng hành',
      description: 'Khách hàng quay lại và góp ý giúp chúng tôi cải thiện; đánh giá (nếu có) hiển thị công khai theo từng sản phẩm.',
      highlight: 'Tích cực',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      icon: Zap,
      title: 'Bảng giá công khai',
      description: 'Giá niêm yết theo gói và thời hạn; ưu đãi (nếu có) được ghi rõ điều kiện áp dụng.',
      highlight: 'Công bằng',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  const stats = [
    { number: 'Đa dạng', label: 'Danh mục & gói', icon: Award },
    { number: 'Rõ ràng', label: 'Quy trình mua', icon: Users },
    { number: 'Tận tâm', label: 'Ưu tiên hỗ trợ', icon: RefreshCw },
    { number: 'Từng bước', label: 'Hướng dẫn chi tiết', icon: Clock }
  ];

  return (
    <section className="section-spacing-home bg-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16 animate-fade-in">
          <Badge className="bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 mb-3 sm:mb-4 text-xs sm:text-sm">
            Vì sao chọn QAI STORE?
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 sm:mb-4 px-2">
            Lý do khách hàng 
            <span className="gradient-text"> tin tưởng chúng tôi</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 text-balance px-2">
            Chúng tôi ưu tiên trải nghiệm rõ ràng: quy trình, chính sách và hỗ trợ được mô tả trước khi bạn quyết định mua.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-14 lg:mb-16">
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
        <div className="bg-gradient-brand rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 animate-fade-in animation-delay-600">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
              Giá trị chúng tôi hướng tới
            </h3>
            <p className="text-sm sm:text-base text-white/85">
              Định hướng phục vụ: minh bạch, có thể kiểm chứng trên từng sản phẩm.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center space-y-2 sm:space-y-3 animate-scale-in animation-delay-${700 + index * 100}`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white/85 text-xs sm:text-sm font-medium leading-tight">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 sm:mt-14 lg:mt-16 text-center animate-fade-in animation-delay-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Ưu tiên bảo mật thông tin</p>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Theo mô tả từng gói</p>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Đổi hoàn theo chính sách</p>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Giao nhận theo từng loại gói</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}