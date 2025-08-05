"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, Shield, Zap, Users, Award, TrendingUp, CheckCircle, Globe, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  console.log("AboutPage rendered");

  const stats = [
    { label: 'Khách hàng tin tưởng', value: '10,000+', icon: Users },
    { label: 'Tài khoản đã bán', value: '50,000+', icon: Award },
    { label: 'Tỷ lệ hài lòng', value: '98%', icon: Heart },
    { label: 'Năm hoạt động', value: '5+', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Bảo mật tuyệt đối',
      description: 'Tất cả tài khoản được kiểm tra kỹ lưỡng, đảm bảo an toàn cho khách hàng',
      color: 'bg-blue-500'
    },
    {
      icon: Zap,
      title: 'Giao hàng tức thì',
      description: 'Hệ thống tự động 24/7, nhận tài khoản ngay sau khi thanh toán',
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
      description: 'Cam kết hoàn tiền 100% nếu tài khoản không hoạt động',
      color: 'bg-purple-500'
    },
    {
      icon: Globe,
      title: 'Đa dạng dịch vụ',
      description: 'Hơn 100+ loại tài khoản premium từ các nền tảng hàng đầu',
      color: 'bg-red-500'
    },
    {
      icon: Clock,
      title: 'Bảo hành dài hạn',
      description: 'Bảo hành từ 30-365 ngày tùy theo từng loại tài khoản',
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
      description: 'Chỉ cung cấp các tài khoản premium chính hãng',
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
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Về chúng tôi
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              QAI STORE - Nơi mua tài khoản
              <span className="block bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent p-1">
                Premium uy tín nhất
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Với hơn 5 năm kinh nghiệm trong lĩnh vực cung cấp tài khoản premium,
              chúng tôi tự hào là đối tác tin cậy của hàng chục nghìn khách hàng trên toàn quốc.
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

      {/* Stats Section */}
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

      {/* Story Section */}
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
                  Khởi đầu từ năm 2019, 5K Shop được thành lập với mục tiêu giúp người dùng Việt Nam
                  có thể truy cập các dịch vụ premium với chi phí hợp lý nhất.
                </p>
                <p>
                  Chúng tôi hiểu rằng không phải ai cũng có điều kiện trả phí đầy đủ cho các dịch vụ
                  như Netflix, Spotify, Adobe Creative Suite... Vì vậy, chúng tôi đã tìm ra giải pháp
                  chia sẻ tài khoản hợp pháp và an toàn.
                </p>
                <p>
                  Đến nay, với hơn 10,000 khách hàng tin tưởng và 50,000+ tài khoản đã bán thành công,
                  5K Shop đã trở thành thương hiệu hàng đầu trong lĩnh vực này.
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
                  Trở thành nền tảng số 1 Việt Nam trong việc cung cấp tài khoản premium,
                  mang đến trải nghiệm công nghệ tốt nhất với chi phí tối ưu.
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

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-600 mb-4 hover:text-white">
              Tại sao chọn chúng tôi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Những điều đặc biệt tại 5K Shop
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi không chỉ bán tài khoản, mà còn mang đến trải nghiệm mua sắm tuyệt vời nhất
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

      {/* Values Section */}
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng trải nghiệm dịch vụ tốt nhất?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Hãy để chúng tôi giúp bạn tiết kiệm chi phí và tận hưởng những dịch vụ premium tuyệt vời nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleProductsClick}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Mua ngay
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

      <Footer />
    </div>
  );
}