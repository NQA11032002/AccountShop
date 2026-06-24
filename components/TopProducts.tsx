"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, ShieldCheck, Zap, Headphones, ClipboardList, ArrowRight, Globe } from 'lucide-react';

export default function TopProducts() {
  const highlights = [
    {
      icon: Zap,
      title: 'Xử lý nhanh 24/7',
      desc: 'Tự động hóa tối đa để bạn nhận thông tin sử dụng nhanh chóng.',
    },
    {
      icon: ShieldCheck,
      title: 'Bảo hành minh bạch',
      desc: 'Chính sách rõ ràng, hỗ trợ xử lý khi phát sinh sự cố trong thời hạn.',
    },
    {
      icon: Headphones,
      title: 'Hỗ trợ tận tình',
      desc: 'Kênh hỗ trợ luôn sẵn sàng, phản hồi nhanh qua Zalo/Telegram.',
    },
  ];

  const steps = [
    {
      icon: ClipboardList,
      title: 'Chọn gói phù hợp',
      desc: 'Xem mô tả, thời hạn và chính sách hỗ trợ trước khi đặt.',
    },
    {
      icon: Globe,
      title: 'Thanh toán & nhận hướng dẫn',
      desc: 'Hoàn tất thanh toán, hệ thống gửi hướng dẫn/thông tin sử dụng.',
    },
    {
      icon: Info,
      title: 'Dùng ngay & được hỗ trợ',
      desc: 'Nếu cần trợ giúp, liên hệ để được xử lý nhanh theo chính sách.',
    },
  ];

  return (
    <>
      {/* Khối 1: Giới thiệu website */}
      <section className="section-spacing-home">
        <div className="container-max section-padding">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-green-50 text-green-700 border border-green-200 mb-3 sm:mb-4 text-xs sm:text-sm">
              Giới thiệu
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Vì sao chọn QAI STORE?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Nền tảng cung cấp giải pháp với quy trình rõ ràng, hỗ trợ nhanh và chính sách minh bạch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối 2: Quy trình sử dụng */}
      <section className="section-spacing-home">
        <div className="container-max section-padding">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 mb-3 sm:mb-4 text-xs sm:text-sm">
              Hướng dẫn nhanh
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Quy trình sử dụng đơn giản
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              3 bước gọn gàng để bạn bắt đầu nhanh và được hỗ trợ kịp thời.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{s.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link href="/products">
              <Button className="bg-white border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
                Xem danh sách gói giải pháp
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}