"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, CreditCard, Download, MessageCircle, Shield, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HowToBuyPage() {
  const steps = [
    {
      step: 1,
      title: 'Chọn sản phẩm',
      description: 'Duyệt qua danh mục và chọn tài khoản premium bạn muốn mua',
      icon: CheckCircle,
      details: [
        'Xem thông tin chi tiết sản phẩm',
        'So sánh giá và tính năng',
        'Đọc đánh giá từ khách hàng',
        'Kiểm tra thời hạn bảo hành'
      ]
    },
    {
      step: 2,
      title: 'Thanh toán',
      description: 'Chọn phương thức thanh toán phù hợp và hoàn tất giao dịch',
      icon: CreditCard,
      details: [
        'Nạp coin vào tài khoản',
        'Banking - Chuyển khoản ngân hàng',
      ]
    },
    {
      step: 3,
      title: 'Nhận tài khoản',
      description: 'Nhận thông tin đăng nhập qua Email, Telegram, Zalo, Facebook trong 5 phút - 5 tiếng',
      icon: Download,
      details: [
        'Giao hàng tự động 24/7',
        'Thông tin được gửi qua email',
        'Liên hệ qua Telegram-Zalo-Facebook',
        'Hướng dẫn sử dụng chi tiết'
      ]
    },
    {
      step: 4,
      title: 'Hỗ trợ',
      description: 'Nhận hỗ trợ kỹ thuật và bảo hành trong suốt thời gian sử dụng',
      icon: MessageCircle,
      details: [
        'Hỗ trợ 24/7 qua Zalo - Facebook - Telegram',
        'Zalo: 038.966.0305',
        'Đổi tài khoản nếu có lỗi',
        'Bảo hành thời hạn theo gói mua'
      ]
    }
  ];

  const paymentMethods = [
    {
      name: 'Momo',
      logo: '💳',
      description: 'Chuyển khoản qua ví Momo, nhanh chóng và tiện lợi',
      fee: 'Miễn phí',
      time: 'Tức thì'
    },
    {
      name: 'Banking',
      logo: '🏦',
      description: 'Chuyển khoản qua ngân hàng (Vietcombank, Techcombank, BIDV)',
      fee: 'Theo ngân hàng',
      time: '1-5 phút'
    },
    {
      name: 'Thẻ cào',
      logo: '📱',
      description: 'Thanh toán bằng thẻ cào điện thoại các nhà mạng',
      fee: '5-10%',
      time: '5-10 phút'
    }
  ];

  const guarantees = [
    { icon: Shield, title: 'Bảo hành tài khoản', desc: 'Đổi tài khoản mới nếu có lỗi' },
    { icon: Clock, title: 'Giao hàng tức thì', desc: 'Nhận tài khoản trong 5 phút - 5 tiếng' },
    { icon: MessageCircle, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="container-max section-padding">
          <div className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Hướng dẫn mua hàng
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cách mua tài khoản
              <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text p-1">
                Đơn giản & Nhanh chóng
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Chỉ 4 bước đơn giản để sở hữu tài khoản premium với giá tốt nhất
            </p>
          </div>
        </div>
      </section>

      {/* Steps Process */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="space-y-12">
            {steps.map((stepItem, index) => (
              <div key={stepItem.step} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {stepItem.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-brand-charcoal">{stepItem.title}</h3>
                      <p className="text-gray-600">{stepItem.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {stepItem.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-brand-emerald rounded-full"></div>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <Card className="product-card">
                    <CardContent className="p-8 text-center">
                      <div className="w-24 h-24 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <stepItem.icon className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-brand-charcoal mb-2">
                        Bước {stepItem.step}
                      </h4>
                      <p className="text-gray-600">
                        {stepItem.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-charcoal mb-4">
              Phương thức thanh toán
            </h2>
            <p className="text-lg text-gray-600">
              Đa dạng hình thức thanh toán để bạn lựa chọn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {paymentMethods.map((method) => (
              <Card key={method.name} className="product-card">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">{method.logo}</div>
                  <CardTitle className="text-xl">{method.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{method.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phí giao dịch:</span>
                      <span className="font-medium text-brand-emerald">{method.fee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Thời gian xử lý:</span>
                      <span className="font-medium text-brand-blue">{method.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 bg-gradient-brand">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Cam kết của chúng tôi
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Mua hàng an tâm với những cam kết chất lượng từ QAI STORE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {guarantees.map((guarantee, index) => (
              <div key={index} className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <guarantee.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{guarantee.title}</h3>
                <p className="text-white/80">{guarantee.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding text-center">
          <h2 className="text-3xl font-bold text-brand-charcoal mb-4">
            Sẵn sàng mua tài khoản?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Hàng nghìn tài khoản premium đang chờ bạn khám phá với giá tốt nhất thị trường
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="btn-primary px-8 py-4 text-lg"
              onClick={() => window.location.href = '/products'}
            >
              Xem sản phẩm
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-8 py-4 text-lg"
              onClick={() => window.location.href = '/#contact'}
            >
              Liên hệ tư vấn
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}