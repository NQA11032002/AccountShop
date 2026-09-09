import Link from 'next/link';
import { ArrowUpRight, BookOpen, Bot, GraduationCap, Terminal } from 'lucide-react';

const categories = [
  { icon: Bot, number: '01', title: 'Tìm công cụ AI', description: 'Chọn trợ lý phù hợp cho sáng tạo, học tập và công việc.', href: '/cong-cu-ai', label: 'Khám phá công cụ', color: 'bg-violet-100 text-violet-700', background: 'hover:border-violet-300 hover:bg-violet-50/50' },
  { icon: Terminal, number: '02', title: 'Khơi nguồn sáng tạo', description: 'Tham khảo kho câu lệnh để biến ý tưởng thành kết quả.', href: '/prompt', label: 'Mở kho câu lệnh', color: 'bg-blue-100 text-blue-700', background: 'hover:border-blue-300 hover:bg-blue-50/50' },
  { icon: BookOpen, number: '03', title: 'Học từ thực tế', description: 'Làm quen và sử dụng AI qua hướng dẫn dễ áp dụng.', href: '/huong-dan', label: 'Xem hướng dẫn', color: 'bg-emerald-100 text-emerald-700', background: 'hover:border-emerald-300 hover:bg-emerald-50/50' },
  { icon: GraduationCap, number: '04', title: 'Tiến xa hơn với AI', description: 'Khám phá lộ trình học để phát triển kỹ năng từng bước.', href: '/lo-trinh-ai', label: 'Khám phá lộ trình', color: 'bg-orange-100 text-orange-700', background: 'hover:border-orange-300 hover:bg-orange-50/50' },
];

export default function FeaturedCategories() {
  return (
    <section id="categories" className="section-spacing-home scroll-mt-32" aria-labelledby="home-categories-title">
      <div className="container-max section-padding">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div><p className="home-eyebrow">BẮT ĐẦU TỪ ĐÂY</p><h2 id="home-categories-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Bạn muốn làm gì hôm nay?</h2></div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">Một nơi để tìm công cụ, học điều mới và mở rộng khả năng của bạn.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ icon: Icon, ...category }) => (
            <Link key={category.number} href={category.href} className={`home-category-card group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 ${category.background}`}>
              <div className="mb-7 flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 ${category.color}`}><Icon className="h-6 w-6" aria-hidden="true" /></span><span className="font-mono text-xs text-slate-400">/{category.number}</span></div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">{category.title}</h3>
              <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">{category.description}</p>
              <span className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">{category.label}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
