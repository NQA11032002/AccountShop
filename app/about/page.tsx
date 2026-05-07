"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, Shield, Zap, Users, Award, TrendingUp, CheckCircle, Globe, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SectionReveal from '@/components/SectionReveal';

export default function AboutPage() {
  console.log("AboutPage rendered");

  const stats = [
    { label: 'Khách hàng tin tưởng', value: '10,000+', icon: Users },
    { label: 'Đơn hàng đã xử lý', value: '50,000+', icon: Award },
    { label: 'Tỷ lệ hài lòng', value: '98%', icon: Heart },
    { label: 'Năm hoạt động', value: '5+', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Bảo mật tuyệt đối',
      description: 'Quy trình rõ ràng, ưu tiên an toàn và quyền riêng tư cho khách hàng',
      color: 'bg-blue-500'
    },
    {
      icon: Zap,
      title: 'Giao hàng tức thì',
      description: 'Hệ thống tự động 24/7, nhận hướng dẫn/thông tin sử dụng ngay sau khi thanh toán',
      color: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: 'Hỗ trợ tận tâm',
      description: 'Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc',
      color: 'bg-green-500'
    },
    {
      icon: Award,
      title: 'Chất lượng đảm bảo',
      description: 'Cam kết hoàn tiền 100% nếu dịch vụ không đúng mô tả hoặc không hoạt động',
      color: 'bg-purple-500'
    },
    {
      icon: Globe,
      title: 'Đa dạng dịch vụ',
      description: 'Nhiều nhóm dịch vụ số phù hợp học tập, công việc, giải trí và sáng tạo',
      color: 'bg-red-500'
    },
    {
      icon: Clock,
      title: 'Bảo hành dài hạn',
      description: 'Bảo hành theo từng gói dịch vụ, thời hạn và điều kiện minh bạch',
      color: 'bg-indigo-500'
    }
  ];

  const values = [
    {
      title: 'Uy tín',
      description: 'Xây dựng lòng tin với khách hàng qua từng giao dịch',
      icon: '🤝'
    },
    {
      title: 'Chất lượng',
      description: 'Ưu tiên trải nghiệm ổn định và nội dung đúng mô tả',
      icon: '⭐'
    },
    {
      title: 'Tiện lợi',
      description: 'Mua sắm dễ dàng, thanh toán nhanh chóng',
      icon: '🚀'
    },
    {
      title: 'Hỗ trợ',
      description: 'Luôn đồng hành cùng khách hàng 24/7',
      icon: '💬'
    }
  ];

  const handleContactClick = () => {
    console.log("Contact button clicked");
    window.location.href = '/contact';
  };

  const handleProductsClick = () => {
    console.log("Products button clicked");
    window.location.href = '/products';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <SectionReveal>
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Về chúng tôi
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              QAI STORE - Nền tảng dịch vụ số
              <span className="block bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent p-1">
                Uy tín & minh bạch
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Với hơn 5 năm kinh nghiệm vận hành dịch vụ số,
              chúng tôi tự hào được hàng chục nghìn khách hàng trên toàn quốc tin tưởng lựa chọn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleProductsClick}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Khám phá sản phẩm
              </Button>
              <Button
                onClick={handleContactClick}
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white hover:text-blue-600 font-semibold px-8 py-4"
              >
                Liên hệ ngay
              </Button>
            </div>
          </div>
        </div>
      </section>
      </SectionReveal>

      {/* Stats Section */}
      <SectionReveal delayMs={60}>
      <section className="py-16 bg-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </SectionReveal>

      {/* Story Section */}
      <SectionReveal delayMs={100}>
      <section className="py-16 bg-gray-50">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-100 text-blue-600 mb-4">
                Câu chuyện của chúng tôi
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Từ ý tưởng nhỏ đến nền tảng lớn
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Khởi đầu từ năm 2019, QAI STORE được thành lập với mục tiêu giúp người dùng Việt Nam
                  tiếp cận các dịch vụ số với chi phí hợp lý và trải nghiệm ổn định.
                </p>
                <p>
                  Chúng tôi hiểu rằng không phải ai cũng muốn mất thời gian tìm hiểu, so sánh, hay xử lý rắc rối kỹ thuật.
                  Vì vậy, chúng tôi xây dựng quy trình gọn gàng, hướng dẫn rõ ràng và hỗ trợ nhanh khi bạn cần.
                </p>
                <p>
                  Đến nay, với hơn 10,000 khách hàng tin tưởng và 50,000+ đơn hàng đã xử lý,
                  QAI STORE đang ngày càng hoàn thiện chất lượng dịch vụ và trải nghiệm mua hàng.
                </p>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Uy tín đã được khẳng định</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Cam kết chất lượng</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Tầm nhìn của chúng tôi</h3>
                <p className="text-white/90 mb-6">
                  Trở thành nền tảng dịch vụ số được tin dùng tại Việt Nam,
                  mang đến trải nghiệm tốt với quy trình minh bạch và chi phí tối ưu.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-white/80">Hỗ trợ</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-sm text-white/80">Dịch vụ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </SectionReveal>

      {/* Features Section */}
      <SectionReveal delayMs={140}>
      <section className="py-16 bg-white">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-600 mb-4 hover:text-white">
              Tại sao chọn chúng tôi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Những điều đặc biệt tại QAI STORE
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi tập trung vào trải nghiệm: nhanh, rõ ràng, và được hỗ trợ kịp thời
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      </SectionReveal>

      {/* Values Section */}
      <SectionReveal delayMs={180}>
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <Badge className="bg-white text-blue-600 mb-4 hover:text-white">
              Giá trị cốt lõi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Những giá trị chúng tôi theo đuổi
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={value.title} className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </SectionReveal>

      {/* CTA Section */}
      <SectionReveal delayMs={220}>
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng trải nghiệm dịch vụ tốt nhất?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Hãy để chúng tôi giúp bạn tiết kiệm thời gian và trải nghiệm dịch vụ số một cách đơn giản, rõ ràng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleProductsClick}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Xem danh sách gói
              </Button>
              <Button
                onClick={handleContactClick}
                variant="outline"
                size="lg"
                className="border-white text-violet-500 hover:bg-white hover:text-blue-600 font-semibold px-8 py-4"
              >
                Tư vấn miễn phí
              </Button>
            </div>
          </div>
        </div>
      </section>
      </SectionReveal>

      <Footer />
    </div>
  );
}