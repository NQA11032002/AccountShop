import type { ReactNode } from 'react';
import { ArrowUpRight, BookOpen, Bot, Check, Code2, Gift, GraduationCap, Layers3, Sparkles, WandSparkles } from 'lucide-react';

const themes = {
  about: { icon: Sparkles, label: 'QAI STORE', title: 'Công nghệ gần gũi hơn.', items: ['Khám phá công cụ', 'Học qua thực hành', 'Kết nối & chia sẻ'], note: 'Cùng bạn khám phá AI' },
  guides: { icon: BookOpen, label: 'BƯỚC ĐẦU CÙNG AI', title: 'Từ tò mò đến biết làm.', items: ['Chọn điều muốn học', 'Làm theo từng bước', 'Áp dụng vào thực tế'], note: 'Bắt đầu từ một việc nhỏ' },
  tools: { icon: Bot, label: 'KHÔNG GIAN CÔNG CỤ', title: 'Ý tưởng nào cũng có điểm bắt đầu.', items: ['Tìm theo nhu cầu', 'Khám phá khả năng', 'Mở công cụ phù hợp'], note: 'Thêm công cụ, thêm cảm hứng' },
  courses: { icon: GraduationCap, label: 'HÀNH TRÌNH HỌC AI', title: 'Mỗi bài học, một bước tiến.', items: ['Chọn khóa phù hợp', 'Theo dõi từng bài học', 'Thực hành kỹ năng mới'], note: 'Học theo nhịp của bạn' },
  prompts: { icon: Code2, label: 'KHÔNG GIAN SÁNG TẠO', title: 'Câu lệnh nhỏ. Ý tưởng lớn.', items: ['Chọn mẫu câu lệnh', 'Thêm bối cảnh của bạn', 'Sao chép & sáng tạo'], note: 'Từ câu chữ đến khả năng' },
  gifts: { icon: Gift, label: 'QUÀ TẶNG CỘNG ĐỒNG', title: 'Niềm vui khi cùng kết nối.', items: ['Đăng nhập tài khoản', 'Tham gia chương trình', 'Theo dõi kết quả'], note: 'Một lời cảm ơn từ QAI' },
};

type Props = { badge: string; title: ReactNode; description: string; theme: keyof typeof themes; children?: ReactNode };

export default function DiscoveryHero({ badge, title, description, theme, children }: Props) {
  const visual = themes[theme];
  const Icon = visual.icon;
  return (
    <section className="discovery-hero relative isolate overflow-hidden">
      <div className="discovery-grid" aria-hidden="true" />
      <div className="discovery-glow" aria-hidden="true" />
      <div className="container-max section-padding relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-20">
        <div className="discovery-enter min-w-0">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-3 py-2 text-xs font-semibold text-violet-700"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{badge}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></p>
          <h1 className="text-balance text-[2.4rem] font-extrabold leading-[1.17] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.4rem]">{title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{description}</p>
          {children && <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
        <div className="discovery-visual discovery-enter relative mx-auto hidden w-full max-w-sm sm:block" aria-hidden="true">
          <div className="discovery-ring" />
          <div className="relative rounded-[1.75rem] border border-white bg-white/90 p-6 shadow-[0_24px_70px_-25px_#5b21b64d] backdrop-blur-sm">
            <div className="mb-7 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200"><Icon className="h-6 w-6" /></span><span className="text-[9px] font-bold tracking-widest text-slate-400">{visual.label}</span></div>
            <p className="max-w-[260px] text-2xl font-bold leading-snug tracking-tight text-slate-900">{visual.title}</p>
            <div className="mt-6 space-y-3">{visual.items.map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-xs font-medium text-slate-600"><span className="font-mono text-[10px] text-violet-500">0{index + 1}</span>{item}<Check className="ml-auto h-3.5 w-3.5 text-emerald-500" /></div>)}</div>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500"><Layers3 className="h-3.5 w-3.5 text-violet-500" />{visual.note}</div>
          </div>
          <span className="discovery-float absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-violet-100 text-violet-600 shadow-lg shadow-violet-950/5"><WandSparkles className="h-5 w-5" /></span>
        </div>
      </div>
    </section>
  );
}
