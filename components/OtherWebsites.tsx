import { ArrowUpRight, Instagram, Music2, Phone } from 'lucide-react';

const websites = [
  {
    name: 'TikTok',
    description: 'Video AI ngắn, mẹo nhanh',
    href: 'https://www.tiktok.com/@phuthuychatgpt',
    icon: Music2,
    label: 'Mở TikTok',
  },
  {
    name: 'Instagram',
    description: '@baotangprompt',
    href: 'https://www.instagram.com/baotangprompt',
    icon: Instagram,
    label: 'Mở Instagram',
  },
  {
    name: 'Zalo',
    description: '038.966.0305',
    href: 'https://zalo.me/0389660305',
    icon: Phone,
    label: 'Mở Zalo',
  },
];

export default function OtherWebsites() {
  return (
    <section className="section-padding py-14 sm:py-20" aria-labelledby="other-websites-title">
      <div className="container-max">
        <div className="mx-auto max-w-2xl text-center">
          <p className="home-eyebrow mb-3">KẾT NỐI & CÙNG KHÁM PHÁ</p>
          <h2 id="other-websites-title" className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">
            Cảm hứng không dừng ở đây.
          </h2>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            Theo dõi mình trên các nền tảng khác để không bỏ lỡ nội dung mới.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map(({ name, description, href, icon: Icon, label }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="home-category-card group relative rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-white shadow-md transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-brand-charcoal">{name}</h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
              <ArrowUpRight className="absolute right-6 top-6 h-5 w-5 text-slate-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-600" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
