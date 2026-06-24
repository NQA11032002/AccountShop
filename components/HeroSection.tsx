"use client";

import { ArrowRight, Play, Star, Shield, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HeroSection() {
  const handleExploreClick = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: Shield, text: 'Cam kết hỗ trợ theo gói' },
    { icon: Zap, text: 'Ưu tiên tự động hóa khi có thể' },
    { icon: Star, text: 'Phản hồi trong khung giờ làm việc' },
  ];

  const heroCards = [
    {
      icon: 'C',
      iconClass: 'text-red-600',
      title: 'Gói thiết kế Website',
      desc: 'Tối ưu trải nghiệm',
      badge: 'Bán chạy',
      badgeClass: 'text-red-600',
      overlay: 'from-red-500/90 via-orange-500/75 to-orange-400/60',
      delay: '',
      offset: '',
    },
    {
      icon: '♪',
      iconClass: 'text-emerald-600',
      title: 'Gói hỗ trợ AI',
      desc: 'Mượt mà, tiện lợi',
      badge: 'Hot',
      badgeClass: 'text-emerald-600',
      overlay: 'from-emerald-500/90 via-teal-500/75 to-cyan-400/60',
      delay: 'animation-delay-200',
      offset: 'mt-4 sm:mt-8',
    },
    {
      icon: 'AI',
      iconClass: 'text-violet-600',
      title: 'Gói làm Video AI',
      desc: 'Tăng năng suất',
      badge: 'Mới',
      badgeClass: 'text-violet-600',
      overlay: 'from-violet-600/90 via-fuchsia-500/75 to-purple-400/60',
      delay: 'animation-delay-400',
      offset: '-mt-2 sm:-mt-4',
    },
    {
      icon: '▶',
      iconClass: 'text-rose-600',
      title: 'Gói khóa học AI',
      desc: 'Xem & học tập',
      badge: 'Ưu đãi',
      badgeClass: 'text-rose-600',
      overlay: 'from-rose-600/90 via-orange-500/75 to-amber-400/60',
      delay: 'animation-delay-600',
      offset: '',
    },
  ];

  return (
    <section
      id="home"
      className="relative flex min-h-[85dvh] items-center overflow-hidden sm:min-h-[90dvh] lg:min-h-[88vh]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-brand-emerald/10 blur-3xl [animation-duration:4s] animate-float" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <div className="container-max section-padding relative z-10 py-12 sm:py-16 lg:py-0">
        <div className="grid min-h-0 items-center gap-8 sm:gap-12 lg:min-h-[80vh] lg:grid-cols-2">
          <div className="animate-fade-in space-y-8 text-center lg:text-left">
            <Badge className="border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Được nhiều khách hàng tin chọn
            </Badge>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-bold leading-snug tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl lg:text-6xl">
                Cung cấp giải pháp
                <br />
                <span className="gradient-text">Uy tín & nhanh chóng</span>
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-brand-gray/80 sm:text-lg md:text-xl lg:mx-0">
                Cung cấp các gói giải pháp phù hợp nhu cầu, hỗ trợ tận tình, xử lý tự động 24/7. Quy trình rõ ràng, cam kết minh bạch và tối ưu chi phí cho bạn.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Button
                onClick={handleExploreClick}
                size="lg"
                className="w-full bg-brand-blue px-6 py-3 text-base font-semibold text-white shadow-md shadow-brand-blue/25 hover:bg-brand-blue/90 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                Khám phá ngay
                <ArrowRight className="ml-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-violet-200/90 bg-white px-6 py-3 text-base font-semibold text-violet-950 shadow-sm hover:bg-violet-50 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                <a href="/how-to-buy" className="flex items-center justify-center">
                  <Play className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  Hướng dẫn
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-6 xs:grid-cols-3 sm:gap-4 sm:pt-8">
              {features.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center justify-center gap-2 text-sm text-brand-gray/80 sm:text-base lg:justify-start"
                >
                  <feature.icon className="h-4 w-4 shrink-0 text-brand-blue sm:h-5 sm:w-5" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="animation-delay-600 order-first mt-4 animate-fade-in sm:mt-8 lg:order-none lg:mt-0">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-4 lg:max-w-none lg:gap-6">
              {heroCards.map((card) => (
                <div
                  key={card.title}
                  className={`product-card relative overflow-hidden rounded-2xl border-0 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.12)] ring-1 ring-violet-200/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(79,70,229,0.22)] sm:p-6 animate-float [animation-duration:4.5s] ${card.delay} ${card.offset}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.overlay}`} aria-hidden />
                  <div className="relative space-y-2 text-white sm:space-y-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm sm:h-8 sm:w-8">
                      <span className={`text-xs font-bold sm:text-sm ${card.iconClass}`}>{card.icon}</span>
                    </div>
                    <h3 className="text-sm font-bold sm:text-lg">{card.title}</h3>
                    <p className="text-xs text-white/90 sm:text-sm">{card.desc}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-lg font-bold sm:text-2xl">&nbsp;</span>
                      <Badge className={`bg-white/95 text-[10px] sm:text-xs ${card.badgeClass}`}>{card.badge}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
