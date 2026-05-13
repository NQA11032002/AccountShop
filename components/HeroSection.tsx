"use client";

import { ArrowRight, Play, Star, Shield, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HeroSection() {
  const handleExploreClick = () => {
    console.log("Explore button clicked");
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    console.log("Watch demo clicked");
    // Future: Open demo video modal
  };

  const stats = [
    { label: 'Gói & danh mục', value: 'Đa dạng' },
    { label: 'Quy trình', value: 'Rõ ràng' },
    { label: 'Hỗ trợ', value: 'Tận tâm' },
  ];

  const features = [
    { icon: Shield, text: 'Cam kết hỗ trợ theo gói' },
    { icon: Zap, text: 'Ưu tiên tự động hóa khi có thể' },
    { icon: Star, text: 'Phản hồi trong khung giờ làm việc' },
  ];

  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-[85dvh] sm:min-h-[90dvh] lg:min-h-screen flex items-center bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.16),transparent_45%),radial-gradient(900px_circle_at_85%_35%,rgba(255,255,255,0.12),transparent_40%),linear-gradient(135deg,#1e40af_0%,#6d28d9_45%,#0284c7_100%)]"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-[28rem] sm:h-[28rem] bg-white/12 rounded-full blur-3xl animate-float [animation-duration:5s]" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 sm:w-[32rem] sm:h-[32rem] bg-white/9 rounded-full blur-3xl animate-float animation-delay-400 [animation-duration:6s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[640px] sm:h-[640px] lg:w-[860px] lg:h-[860px] bg-white/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.6)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      <div className="container-max section-padding relative z-10 py-12 sm:py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-0 lg:min-h-[80vh]">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <Badge className="bg-white/15 text-white border-white/25 hover:bg-white/22 transition-colors backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Được nhiều khách hàng tin chọn
            </Badge>

            {/* Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight">
                Cung cấp giải pháp
                <br />
                <span className="gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent">
                  Uy tín & nhanh chóng
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-xl mx-auto lg:mx-0 text-balance leading-relaxed">
                Cung cấp các gói giải pháp phù hợp nhu cầu, hỗ trợ tận tình, xử lý tự động 24/7. Quy trình rõ ràng, cam kết minh bạch và tối ưu chi phí cho bạn.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleExploreClick}
                size="lg"
                className="bg-white text-brand-blue hover:bg-white/95 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-[0_18px_50px_rgba(0,0,0,0.22)] hover:shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition-all duration-200 active:scale-[0.98] w-full xs:w-auto"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border border-white/30 text-white bg-white/10 hover:bg-white/18 hover:border-white/45 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg backdrop-blur-md shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-200 active:scale-[0.98] w-full xs:w-auto"
              >
                <a href="/how-to-buy" className="flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
                  Hướng dẫn
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
              {/* Card 1 */}
              <div className="product-card relative overflow-hidden bg-white/10 text-white p-4 sm:p-6 animate-float [animation-duration:4s] rounded-2xl border border-white/22 shadow-[0_16px_60px_rgba(0,0,0,0.26)] hover:shadow-[0_26px_90px_rgba(0,0,0,0.34)] transition-all duration-200 hover:-translate-y-1 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 to-orange-500/55" aria-hidden />
                <div className="space-y-2 sm:space-y-3">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-red-600 font-bold text-xs sm:text-sm">C</span>
                  </div>
                  <h3 className="relative font-bold text-sm sm:text-lg">Gói thiết kế Website</h3>
                  <p className="relative text-white/85 text-xs sm:text-sm">Tối ưu trải nghiệm</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">&nbsp;</span>
                    <Badge className="relative bg-white/95 text-red-600 text-[10px] sm:text-xs">Bán chạy</Badge>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="product-card relative overflow-hidden bg-white/10 text-white p-4 sm:p-6 animate-float animation-delay-200 [animation-duration:4.5s] mt-4 sm:mt-8 rounded-2xl border border-white/22 shadow-[0_16px_60px_rgba(0,0,0,0.26)] hover:shadow-[0_26px_90px_rgba(0,0,0,0.34)] transition-all duration-200 hover:-translate-y-1 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/88 to-teal-400/55" aria-hidden />
                <div className="space-y-2 sm:space-y-3">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-emerald-600 font-bold text-xs sm:text-sm">♪</span>
                  </div>
                  <h3 className="relative font-bold text-sm sm:text-lg">Gói hỗ trợ AI</h3>
                  <p className="relative text-white/85 text-xs sm:text-sm">Mượt mà, tiện lợi</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">&nbsp;</span>
                    <Badge className="relative bg-white/95 text-emerald-600 text-[10px] sm:text-xs">Hot</Badge>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="product-card relative overflow-hidden bg-white/10 text-white p-4 sm:p-6 animate-float animation-delay-400 [animation-duration:5s] -mt-2 sm:-mt-4 rounded-2xl border border-white/22 shadow-[0_16px_60px_rgba(0,0,0,0.26)] hover:shadow-[0_26px_90px_rgba(0,0,0,0.34)] transition-all duration-200 hover:-translate-y-1 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/88 to-fuchsia-500/55" aria-hidden />
                <div className="space-y-2 sm:space-y-3">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-violet-600 font-bold text-xs sm:text-sm">AI</span>
                  </div>
                  <h3 className="relative font-bold text-sm sm:text-lg">Gói làm Video AI</h3>
                  <p className="relative text-white/85 text-xs sm:text-sm">Tăng năng suất</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">&nbsp;</span>
                    <Badge className="relative bg-white/95 text-violet-600 text-[10px] sm:text-xs">Mới</Badge>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="product-card relative overflow-hidden bg-white/10 text-white p-4 sm:p-6 animate-float animation-delay-600 [animation-duration:4.5s] rounded-2xl border border-white/22 shadow-[0_16px_60px_rgba(0,0,0,0.26)] hover:shadow-[0_26px_90px_rgba(0,0,0,0.34)] transition-all duration-200 hover:-translate-y-1 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/88 to-orange-500/52" aria-hidden />
                <div className="space-y-2 sm:space-y-3">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-rose-600 font-bold text-xs sm:text-sm">▶</span>
                  </div>
                  <h3 className="relative font-bold text-sm sm:text-lg">Gói khóa học AI</h3>
                  <p className="relative text-white/85 text-xs sm:text-sm">Xem & học tập</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl font-bold">&nbsp;</span>
                    <Badge className="relative bg-white/95 text-rose-600 text-[10px] sm:text-xs">Ưu đãi</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="mt-4 sm:mt-6 lg:mt-0 lg:absolute lg:-bottom-10 xl:-bottom-14 lg:left-0 lg:translate-x-0 z-20">
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/80 ring-1 ring-black/5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] animate-scale-in lg:animation-delay-800">
                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center divide-x divide-gray-200">
                  {stats.map((stat) => (
                    <div key={stat.label} className="space-y-0.5 sm:space-y-1 px-2 first:pl-0 last:pr-0">
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-brand-charcoal whitespace-nowrap">{stat.value}</div>
                      <div className="text-[10px] xs:text-[11px] sm:text-xs text-gray-500 leading-tight whitespace-nowrap">{stat.label}</div>
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