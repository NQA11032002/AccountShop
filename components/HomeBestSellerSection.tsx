"use client";

import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeBestSellerSection() {
  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-50">
      <div className="container-max section-padding">
        <div className="grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
          {/* Left content */}
          <div className="space-y-5 sm:space-y-6">
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase tracking-wide">
              Nâng cấp ChatGPT Plus chính chủ
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
              ChatGPT Plus – công cụ AI{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                mạnh mẽ nhất hiện nay
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
              Trả lời nhanh hơn, chính xác hơn, luôn sẵn sàng kể cả giờ cao điểm. Hỗ
              trợ học tập, làm việc, sáng tạo nội dung và kinh doanh mỗi ngày.
            </p>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                    Chính chủ, bảo hành
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-600">
                    Tài khoản an toàn, hỗ trợ tận tâm trong suốt thời gian sử dụng.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-sky-100 p-1.5 text-sky-600">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                    Kích hoạt siêu nhanh
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-600">
                    Tự động hoặc hỗ trợ nâng cấp trong vài phút, không phải chờ lâu.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-violet-100 p-1.5 text-violet-600">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                    Phù hợp mọi nhu cầu
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-600">
                    Học tập, viết content, code, marketing, nghiên cứu và hơn thế nữa.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/products?search=Chat%20GPT">
                <Button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all">
                  Mua tài khoản ChatGPT Plus ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right illustration card */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-sky-500 text-white shadow-2xl p-6 sm:p-7 lg:p-8">
              {/* Floating decoration */}
              <div className="pointer-events-none absolute -right-10 top-[-40px] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-12 bottom-[-40px] h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm border border-white/20 self-start">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 text-xs font-bold">
                    C
                  </span>
                  ChatGPT Plus chính chủ
                </div>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-snug">
                  Làm việc thông minh hơn với sức mạnh của AI mỗi ngày
                </h3>

                <p className="text-xs sm:text-sm text-emerald-50/90">
                  Truy cập GPT-4, tốc độ trả lời nhanh, ưu tiên server vào giờ cao điểm.
                  Tối ưu công việc, tiết kiệm hàng giờ mỗi tuần.
                </p>

                <div className="mt-2 grid grid-cols-3 gap-3 text-center text-xs sm:text-sm">
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15">
                    <p className="text-[10px] sm:text-xs text-emerald-100">
                      Thời gian hoạt động
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-semibold">99.9%</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15">
                    <p className="text-[10px] sm:text-xs text-emerald-100">
                      Khách hàng hài lòng
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-semibold">5,000+</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15">
                    <p className="text-[10px] sm:text-xs text-emerald-100">
                      Hỗ trợ nhanh
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-semibold">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

