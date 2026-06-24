"use client";

import { ArrowRight, ArrowUpRight, Bot, Check, Globe, GraduationCap, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FeaturedCategories() {
  const cards = [
    {
      icon: Globe,
      title: 'Gói thiết kế Website',
      tag: 'Bán chạy',
      desc: 'Thiết kế website chuyên nghiệp – chuẩn SEO, tối ưu trải nghiệm, phù hợp mọi mục đích kinh doanh.',
      features: ['Chuẩn SEO', 'Tối ưu UX/UI', 'Bảo hành minh bạch'],
      gradient: 'from-sky-500 via-blue-500 to-indigo-500',
      softGradient: 'from-sky-50 via-blue-50/60 to-indigo-50/40',
      glow: 'hover:shadow-sky-500/20',
      hoverRing: 'hover:ring-sky-300',
      accent: 'text-sky-600',
      ring: 'ring-sky-200/60',
    },
    {
      icon: Bot,
      title: 'Gói hỗ trợ AI',
      tag: 'Mới',
      desc: 'Trợ lý AI tăng tốc học tập & công việc – tối ưu quy trình, tiết kiệm thời gian mỗi ngày.',
      features: ['Quy trình rõ ràng', 'Hỗ trợ 24/7', 'Cập nhật liên tục'],
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      softGradient: 'from-emerald-50 via-teal-50/60 to-cyan-50/40',
      glow: 'hover:shadow-emerald-500/20',
      hoverRing: 'hover:ring-emerald-300',
      accent: 'text-emerald-600',
      ring: 'ring-emerald-200/60',
    },
    {
      icon: Video,
      title: 'Gói làm Video AI',
      tag: 'Hot',
      desc: 'Tạo video chuyên nghiệp nhanh chóng với AI – từ kịch bản tới hậu kỳ chỉ trong vài phút.',
      features: ['Kịch bản AI', 'Hậu kỳ tự động', 'Xuất đa nền tảng'],
      gradient: 'from-rose-500 via-fuchsia-500 to-orange-500',
      softGradient: 'from-rose-50 via-fuchsia-50/60 to-orange-50/40',
      glow: 'hover:shadow-fuchsia-500/20',
      hoverRing: 'hover:ring-fuchsia-300',
      accent: 'text-fuchsia-600',
      ring: 'ring-fuchsia-200/60',
    },
    {
      icon: GraduationCap,
      title: 'Gói khóa học AI',
      tag: 'Khuyên dùng',
      desc: 'Khóa học AI từ cơ bản đến nâng cao – tài liệu rõ ràng, lộ trình bài bản, học là hiểu ngay.',
      features: ['Lộ trình bài bản', 'Tài liệu đầy đủ', 'Mentor đồng hành'],
      gradient: 'from-indigo-500 via-violet-500 to-purple-500',
      softGradient: 'from-indigo-50 via-violet-50/60 to-purple-50/40',
      glow: 'hover:shadow-violet-500/20',
      hoverRing: 'hover:ring-violet-300',
      accent: 'text-violet-600',
      ring: 'ring-violet-200/60',
    },
  ];

  return (
    <section id="categories" className="section-spacing-home">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 animate-fade-in">
          <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 mb-3 sm:mb-4 text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Danh mục nổi bật
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 px-2 tracking-tight">
            Gói giải pháp
            <span className="gradient-text"> nổi bật</span>
          </h2>
          <p className="text-base sm:text-lg text-brand-gray/80 text-balance leading-relaxed px-2">
            Chọn nhanh nhóm giải pháp phù hợp nhu cầu. Mỗi gói đều có mô tả rõ ràng, thời hạn minh bạch và kênh hỗ trợ sẵn sàng.
          </p>
        </div>

        {/* Bento-style category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-10 sm:mb-12">
          {cards.map((c, idx) => (
            <div
              key={c.title}
              className={`group relative overflow-hidden rounded-2xl bg-white ring-1 ${c.ring} ${c.hoverRing} shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-xl ${c.glow} transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer`}
              style={{ animationDelay: `${idx * 80}ms` }}
              onClick={() => window.location.href = '/products'}
            >
              {/* Soft pastel background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${c.softGradient}`} />

              {/* Decorative blurred orbs */}
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${c.gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-300`} />
              <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-white/50 blur-2xl" />

              {/* Content */}
              <div className="relative p-5 sm:p-6 lg:p-7 flex flex-col h-full">
                {/* Top row: Icon + Tag */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="relative">
                    {/* Glow under icon */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-40 blur-lg rounded-xl scale-110`} />
                    <div
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-md shadow-black/5 ring-1 ring-white/40 group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300`}
                    >
                      <c.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" strokeWidth={2.25} />
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${c.accent} bg-white/80 backdrop-blur-sm border border-white/80 rounded-full px-2 py-1 shadow-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${c.gradient}`} />
                    {c.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 tracking-tight">
                  {c.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                  {c.desc}
                </p>

                {/* Features list */}
                <ul className="space-y-1.5 mb-4">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br ${c.gradient} shadow-sm shrink-0`}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA row */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200/60">
                  <span className={`text-xs sm:text-sm font-semibold ${c.accent} group-hover:tracking-wide transition-all duration-300`}>
                    Khám phá gói này
                  </span>
                  <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm ring-1 ring-gray-200/70 group-hover:ring-transparent group-hover:shadow-md group-hover:scale-110 transition-all duration-300 overflow-hidden">
                    {/* Base white background */}
                    <span className="absolute inset-0 bg-white/90" />
                    {/* Gradient hover overlay */}
                    <span className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <ArrowUpRight className={`relative w-4 h-4 ${c.accent} group-hover:text-white group-hover:rotate-12 transition-all duration-300`} strokeWidth={2.25} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center animate-fade-in animation-delay-600">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/products'}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-7 sm:px-9 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none mx-auto rounded-full"
          >
            Xem tất cả danh mục
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
