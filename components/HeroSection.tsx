"use client";

import { ArrowRight, Play, Star, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HeroSection() {
  console.log("HeroSection component rendered");

  const handleExploreClick = () => {
    console.log("Explore button clicked");
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    console.log("Watch demo clicked");
    // Future: Open demo video modal
  };

  const stats = [
    { label: 'Tài khoản đã bán', value: '10,000+' },
    { label: 'Khách hàng hài lòng', value: '5,000+' },
    { label: 'Đánh giá 5 sao', value: '98%' },
  ];

  const features = [
    { icon: Shield, text: 'Bảo hành tài khoản' },
    { icon: Zap, text: 'Giao hàng tự động 24/7' },
    { icon: Star, text: 'Hỗ trợ nhanh chóng' },
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-hero min-h-[85dvh] sm:min-h-[90dvh] lg:min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-40 h-40 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl animate-float animation-delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container-max section-padding relative z-10 py-12 sm:py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-0 lg:min-h-[80vh]">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
              <Star className="w-3 h-3 mr-1" />
              Tin cậy bởi 5,000+ khách hàng
            </Badge>

            {/* Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight">
                Tài khoản Premium
                <br />
                <span className="gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent">
                  Giá tốt nhất!
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-lg mx-auto lg:mx-0 text-balance leading-relaxed">
                Mua tài khoản Netflix, Spotify, ChatGPT Plus, YouTube Premium và nhiều dịch vụ premium khác với giá ưu đãi nhất thị trường.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleExploreClick}
                size="lg"
                className="bg-white text-brand-blue hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.98] w-full xs:w-auto"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 hover:border-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg backdrop-blur-sm shadow-lg transition-all duration-200 active:scale-[0.98] w-full xs:w-auto"
              >
                <a href="/products" className="flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                  Sản Phẩm
                </a>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8">
              {features.map((feature, index) => (
                <div
                  key={feature.text}
                  className={`flex items-center justify-center lg:justify-start gap-2 text-white/90 text-sm sm:text-base animate-fade-in animation-delay-${(index + 2) * 200}`}
                >
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 shrink-0" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative animate-fade-in animation-delay-600 order-first lg:order-none mt-4 sm:mt-8 lg:mt-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-md mx-auto lg:max-w-none">
              {/* Netflix Card */}
              <div className="product-card bg-red-600 text-white p-4 sm:p-6 animate-float rounded-xl shadow-xl hover:shadow-2xl">
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold text-xs sm:text-sm">C</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg">Capcut Pro</h3>
                  <p className="text-red-100 text-xs sm:text-sm">Mở khóa tính năng</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">10K</span>
                    <Badge className="bg-white text-red-600 text-[10px] sm:text-xs">Bán chạy</Badge>
                  </div>
                </div>
              </div>

              {/* Spotify Card */}
              <div className="product-card bg-green-500 text-white p-4 sm:p-6 animate-float animation-delay-200 mt-4 sm:mt-8 rounded-xl shadow-xl hover:shadow-2xl">
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shrink-0">
                    <span className="text-green-500 font-bold text-xs sm:text-sm">♪</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg">Spotify Premium</h3>
                  <p className="text-green-100 text-xs sm:text-sm">Không quảng cáo</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">350k</span>
                    <Badge className="bg-white text-green-500 text-[10px] sm:text-xs">Hot</Badge>
                  </div>
                </div>
              </div>

              {/* ChatGPT Card */}
              <div className="product-card bg-purple-600 text-white p-4 sm:p-6 animate-float animation-delay-400 -mt-2 sm:-mt-4 rounded-xl shadow-xl hover:shadow-2xl">
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded flex items-center justify-center shrink-0">
                    <span className="text-purple-600 font-bold text-xs sm:text-sm">AI</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg">ChatGPT Plus</h3>
                  <p className="text-purple-100 text-xs sm:text-sm">không giới hạn tin nhắn</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">69k</span>
                    <Badge className="bg-white text-purple-600 text-[10px] sm:text-xs">Mới</Badge>
                  </div>
                </div>
              </div>

              {/* YouTube Premium Card */}
              <div className="product-card bg-red-500 text-white p-4 sm:p-6 animate-float animation-delay-600 rounded-xl shadow-xl hover:shadow-2xl">
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded flex items-center justify-center shrink-0">
                    <span className="text-red-500 font-bold text-xs sm:text-sm">▶</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg">YouTube Premium</h3>
                  <p className="text-red-100 text-xs sm:text-sm">Không quảng cáo</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">70K</span>
                    <Badge className="bg-white text-red-500 text-[10px] sm:text-xs">Ưu đãi</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="mt-4 sm:mt-6 lg:mt-0 lg:absolute lg:-bottom-8 xl:-bottom-12 lg:left-0 lg:translate-x-0">
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 shadow-xl animate-scale-in lg:animation-delay-800">
                <div className="grid grid-cols-3 gap-2 sm:gap-6 text-center">
                  {stats.map((stat) => (
                    <div key={stat.label} className="space-y-0.5 sm:space-y-1">
                      <div className="text-base sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-[10px] xs:text-[11px] sm:text-xs text-white/75 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}