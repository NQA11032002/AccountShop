'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Layers3, PenLine, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';
import { AI_TOOLS } from '@/data/ai-tools';

const inspirations = [
  { label: 'Sáng tạo', icon: PenLine, title: 'Biến ý tưởng thành nội dung.', prompt: 'Lên ý tưởng cho một tuần nội dung thật khác biệt.', steps: ['Tìm góc nhìn mới cho thương hiệu', 'Viết nội dung đúng giọng điệu', 'Hoàn thiện với bộ câu lệnh mẫu'], href: '/prompt', cta: 'Khám phá kho câu lệnh' },
  { label: 'Học tập', icon: BookOpen, title: 'Học điều mới, theo cách của bạn.', prompt: 'Bắt đầu học AI từ đâu để áp dụng ngay?', steps: ['Làm quen với các công cụ AI', 'Thực hành theo hướng dẫn từng bước', 'Xây dựng lộ trình học của riêng bạn'], href: '/lo-trinh-ai', cta: 'Tìm lộ trình phù hợp' },
  { label: 'Công việc', icon: Code2, title: 'Dành thời gian cho điều quan trọng.', prompt: 'Tìm công cụ phù hợp để làm việc hiệu quả hơn.', steps: ['Khám phá công cụ theo nhu cầu', 'Tham khảo các ứng dụng thực tế', 'Đưa AI vào công việc hằng ngày'], href: '/cong-cu-ai', cta: 'Tìm công cụ cho bạn' },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const current = inspirations[active];

  return (
    <section id="home" className="home-hero relative isolate overflow-hidden" aria-labelledby="home-title">
      <div className="home-hero-grid" aria-hidden="true" />
      <div className="home-glow home-glow-one" aria-hidden="true" />
      <div className="home-glow home-glow-two" aria-hidden="true" />
      <div className="container-max section-padding relative">
        <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24">
          <div className="home-enter min-w-0">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 py-2 pl-2 pr-4 text-[10px] font-semibold text-violet-700 shadow-sm sm:text-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /></span>
              KHÁM PHÁ THẾ GIỚI AI CÙNG QAI
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <h1 id="home-title" className="text-[2.5rem] font-extrabold leading-[1.16] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[4rem]">
              Ý tưởng của bạn.<br /><span className="home-gradient-text">Sức mạnh từ AI.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Khám phá công cụ, câu lệnh và kiến thức AI để sáng tạo hơn, làm việc thông minh hơn. Bắt đầu từ điều bạn muốn làm.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/cong-cu-ai" className="home-button-primary group">Khám phá công cụ AI <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              <Link href="/huong-dan" className="home-button-secondary"><BookOpen className="h-4 w-4" aria-hidden="true" /> Bắt đầu học AI</Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-200/80 pt-6 text-xs font-medium text-slate-600 sm:text-sm">
              <span className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-violet-600" aria-hidden="true" />{AI_TOOLS.length} công cụ để khám phá</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />Hướng dẫn từng bước</span>
            </div>
          </div>
          <div className="home-enter home-studio relative min-w-0" style={{ animationDelay: '140ms' }}>
            <div className="home-orbit" aria-hidden="true" />
            <div className="home-floating-badge absolute -top-6 right-5 z-20 flex items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-lg shadow-violet-950/5 sm:right-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>Một ý tưởng. Nhiều khả năng.
            </div>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white bg-white/90 shadow-[0_24px_80px_-24px_rgba(76,29,149,0.25)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white"><WandSparkles className="h-4 w-4" aria-hidden="true" /></span>Không gian ý tưởng</div>
                <span className="flex gap-1" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-violet-300" /><span className="h-1.5 w-1.5 rounded-full bg-violet-200" /><span className="h-1.5 w-1.5 rounded-full bg-violet-100" /></span>
              </div>
              <div className="p-5 sm:p-7">
                <p className="mb-3 text-xs font-medium text-slate-500">Hôm nay, bạn muốn làm gì?</p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Chọn nhu cầu khám phá AI">
                  {inspirations.map(({ label, icon: Icon }, index) => (
                    <button key={label} type="button" aria-pressed={active === index} onClick={() => setActive(index)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${active === index ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50'}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{label}
                    </button>
                  ))}
                </div>
                <div className="mt-5 min-h-[300px] sm:min-h-[270px]" aria-live="polite" aria-atomic="true">
                  <div key={active} className="home-preview-enter">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Gợi ý dành cho bạn</span>{current.prompt}</div>
                    <h2 className="mb-4 mt-5 text-lg font-bold tracking-tight text-slate-900">{current.title}</h2>
                    <ul className="space-y-3">
                      {current.steps.map((step, index) => <li key={step} className="home-preview-step flex items-center gap-2.5 text-sm text-slate-600" style={{ animationDelay: `${index * 90}ms` }}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3 w-3" aria-hidden="true" /></span>{step}</li>)}
                    </ul>
                  </div>
                </div>
                <Link href={current.href} className="group flex min-h-12 items-center justify-between gap-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700">{current.cta}<ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="home-floating-note absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-lg shadow-violet-950/5 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="text-xs font-bold text-slate-800">Từ khám phá đến thực hành</p><p className="mt-0.5 text-[11px] text-slate-500">Tìm cảm hứng cho bước tiếp theo</p></div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/70 py-5 text-xs font-medium text-slate-500">
          <p>CÔNG CỤ PHÙ HỢP. THÊM NHIỀU CẢM HỨNG.</p>
          <a href="#categories" className="group flex min-h-10 items-center gap-2 text-slate-600 hover:text-violet-700">Tìm điều bạn cần <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
