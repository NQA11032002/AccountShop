"use client";

import { ArrowRight, Bot, Sparkles, Music2, Palette, ShieldCheck, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FeaturedCategories() {
  const cards = [
    {
      icon: Bot,
      title: 'Gói AI',
      desc: 'Tăng tốc học tập & công việc với trợ lý AI, tối ưu quy trình và tiết kiệm thời gian.',
      gradient: 'from-emerald-500/15 via-sky-500/10 to-violet-500/10',
      ring: 'ring-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-700',
    },
    {
      icon: Music2,
      title: 'Gói Giải trí',
      desc: 'Trải nghiệm nội dung mượt mà, phù hợp học tập – giải trí – thư giãn mỗi ngày.',
      gradient: 'from-green-500/15 via-teal-500/10 to-blue-500/10',
      ring: 'ring-green-500/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-700',
    },
    {
      icon: Palette,
      title: 'Gói Thiết kế',
      desc: 'Dành cho sáng tạo: template, tài nguyên và công cụ giúp làm nhanh – làm đẹp – làm chuẩn.',
      gradient: 'from-pink-500/15 via-fuchsia-500/10 to-indigo-500/10',
      ring: 'ring-pink-500/20',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-700',
    },
    {
      icon: Sparkles,
      title: 'Gói Công cụ',
      desc: 'Nâng trải nghiệm sử dụng, tối ưu thao tác hằng ngày với các công cụ tiện lợi.',
      gradient: 'from-amber-500/15 via-orange-500/10 to-rose-500/10',
      ring: 'ring-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-700',
    },
    {
      icon: ShieldCheck,
      title: 'Gói Bảo mật',
      desc: 'Ưu tiên an toàn & riêng tư. Phù hợp nhu cầu bảo vệ thiết bị và dữ liệu cá nhân.',
      gradient: 'from-slate-500/15 via-blue-500/10 to-cyan-500/10',
      ring: 'ring-slate-500/20',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-700',
    },
    {
      icon: GraduationCap,
      title: 'Gói Học tập',
      desc: 'Học tập hiệu quả hơn với tài liệu, công cụ hỗ trợ và nội dung phù hợp nhiều cấp độ.',
      gradient: 'from-indigo-500/15 via-sky-500/10 to-emerald-500/10',
      ring: 'ring-indigo-500/20',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-700',
    },
  ];

  return (
    <section id="categories" className="section-spacing-home bg-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16 animate-fade-in">
          <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 mb-3 sm:mb-4 text-xs sm:text-sm">
            Danh mục nổi bật
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 sm:mb-4 px-2">
            Gói dịch vụ số
            <span className="gradient-text"> nổi bật</span>
          </h2>
          <p className="text-base sm:text-lg text-brand-gray/80 text-balance leading-relaxed px-2">
            Chọn nhanh nhóm dịch vụ phù hợp nhu cầu. Mỗi gói đều có mô tả rõ ràng, thời hạn minh bạch và kênh hỗ trợ sẵn sàng.
          </p>
        </div>

        {/* Pretty category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          {cards.map((c, idx) => (
            <div
              key={c.title}
              className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white ring-1 ${c.ring} shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
              <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-white/30 blur-2xl" />

              <div className="relative p-6">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${c.iconBg} border border-white/60 flex items-center justify-center shadow-sm`}>
                    <c.icon className={`w-6 h-6 ${c.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
                      <span className="text-xs font-semibold text-gray-600 bg-white/60 border border-white/70 rounded-full px-2.5 py-1">
                        Chi tiết
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                      {c.desc}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full bg-white/70 border border-white/80 px-2.5 py-1 text-gray-700">
                        Quy trình rõ ràng
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/70 border border-white/80 px-2.5 py-1 text-gray-700">
                        Hỗ trợ nhanh
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/70 border border-white/80 px-2.5 py-1 text-gray-700">
                        Bảo hành minh bạch
                      </span>
                    </div>
                  </div>
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
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
          >
            Xem tất cả danh mục
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  );
}