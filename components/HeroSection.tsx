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
    <section id="home" className="relative overflow-hidden bg-gradient-hero min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float animation-delay-400"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
              <Star className="w-3 h-3 mr-1" />
              Tin cậy bởi 5,000+ khách hàng
            </Badge>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Tài khoản Premium
                <br />
                <span className="gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent">
                  Giá tốt nhất!
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-lg mx-auto lg:mx-0 text-balance">
                Mua tài khoản Netflix, Spotify, ChatGPT Plus, YouTube Premium và nhiều dịch vụ premium khác với giá ưu đãi nhất thị trường.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleExploreClick}
                size="lg"
                className="bg-white text-brand-blue hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Khám phá ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={handleWatchDemo}
                variant="outline"
                size="lg"
                className="border-gradient-to-r from-yellow-300 to-emerald-300 border-2 text-white bg-gradient-to-r from-yellow-400/20 to-emerald-400/20 hover:from-yellow-300 hover:to-emerald-300 hover:text-gray-900 font-semibold px-8 py-4 text-lg backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <a href="/products" className='flex items-center' >
                  <Play className="w-5 h-5 mr-2" />
                  Sản Phẩm</a>

              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {features.map((feature, index) => (
                <div
                  key={feature.text}
                  className={`flex items-center justify-center lg:justify-start space-x-2 text-white/90 animate-fade-in animation-delay-${(index + 2) * 200}`}
                >
                  <feature.icon className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="relative animate-fade-in animation-delay-600">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {/* Netflix Card */}
              <div className="product-card bg-red-600 text-white p-6 animate-float">
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">N</span>
                  </div>
                  <h3 className="font-bold text-lg">Netflix Premium</h3>
                  <p className="text-red-100 text-sm">4K Ultra HD</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">50K</span>
                    <Badge className="bg-white text-red-600">Bán chạy</Badge>
                  </div>
                </div>
              </div>

              {/* Spotify Card */}
              <div className="product-card bg-green-500 text-white p-6 animate-float animation-delay-200 mt-8">
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-green-500 font-bold text-sm">♪</span>
                  </div>
                  <h3 className="font-bold text-lg">Spotify Premium</h3>
                  <p className="text-green-100 text-sm">Không quảng cáo</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">30K</span>
                    <Badge className="bg-white text-green-500">Hot</Badge>
                  </div>
                </div>
              </div>

              {/* ChatGPT Card */}
              <div className="product-card bg-purple-600 text-white p-6 animate-float animation-delay-400 -mt-4">
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">AI</span>
                  </div>
                  <h3 className="font-bold text-lg">ChatGPT Plus</h3>
                  <p className="text-purple-100 text-sm">GPT-4 Unlimited</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">120K</span>
                    <Badge className="bg-white text-purple-600">Mới</Badge>
                  </div>
                </div>
              </div>

              {/* YouTube Premium Card */}
              <div className="product-card bg-red-500 text-white p-6 animate-float animation-delay-600">
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-red-500 font-bold text-sm">▶</span>
                  </div>
                  <h3 className="font-bold text-lg">YouTube Premium</h3>
                  <p className="text-red-100 text-sm">Không quảng cáo</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">40K</span>
                    <Badge className="bg-white text-red-500">Ưu đãi</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 lg:left-0 lg:transform-none">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl animate-scale-in animation-delay-800">
                <div className="grid grid-cols-3 gap-6 text-center">
                  {stats.map((stat, index) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
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