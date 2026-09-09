import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Bot, HeartHandshake, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionReveal from '@/components/SectionReveal';
import DiscoveryShell from '@/components/discovery/DiscoveryShell';
import DiscoveryHero from '@/components/discovery/DiscoveryHero';
import { AI_TOOLS } from '@/data/ai-tools';

const values = [
  { icon: BookOpen, title: 'Dễ hiểu để bắt đầu', description: 'Hướng dẫn rõ ràng, ví dụ cụ thể để bạn làm quen và áp dụng AI vào việc mình cần.', color: 'bg-violet-50 text-violet-600' },
  { icon: ShieldCheck, title: 'Rõ ràng để tin tưởng', description: 'Thông tin, quyền lợi và chính sách hỗ trợ được mô tả theo từng nội dung và gói giải pháp.', color: 'bg-blue-50 text-blue-600' },
  { icon: HeartHandshake, title: 'Đồng hành khi bạn cần', description: 'Lắng nghe câu hỏi và góp ý để cải thiện trải nghiệm khám phá, học tập và sử dụng.', color: 'bg-emerald-50 text-emerald-600' },
];

export default function AboutPage() {
  return (
    <DiscoveryShell>
      <Header />
      <main>
        <DiscoveryHero theme="about" badge="Câu chuyện của QAI" title={<>Đưa công nghệ<span className="discovery-gradient">đến gần bạn hơn.</span></>} description="Một không gian để khám phá công cụ, chia sẻ kiến thức và tìm giải pháp phù hợp cho học tập, công việc, sáng tạo.">
          <Link href="/huong-dan" className="discovery-primary">Khám phá cùng QAI <ArrowRight className="h-4 w-4" /></Link>
          <span className="text-xs text-slate-500">Từ ý tưởng đến ứng dụng mỗi ngày</span>
        </DiscoveryHero>
        <SectionReveal>
          <section className="container-max section-padding py-12 sm:py-16">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <div>
                <p className="discovery-eyebrow">VÌ SAO CÓ QAI STORE?</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Một điểm bắt đầu.<br />Nhiều điều có thể làm.</h2>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                  <p>Không phải ai cũng có thời gian tìm hiểu từng công cụ hay tự giải quyết những bước thiết lập ban đầu. QAI STORE được xây dựng để hành trình đó đơn giản và dễ tiếp cận hơn.</p>
                  <p>Từ công cụ AI, câu lệnh mẫu đến hướng dẫn và khóa học, bạn có thể chọn điều phù hợp với nhu cầu rồi từng bước đưa vào thực tế.</p>
                </div>
              </div>
              <div className="discovery-banner p-7 sm:p-9">
                <Sparkles className="mb-6 h-8 w-8 text-violet-300" />
                <p className="text-2xl font-semibold leading-snug tracking-tight">Công nghệ hữu ích khi giúp bạn làm được điều mình muốn.</p>
                <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div><p className="text-3xl font-bold">{AI_TOOLS.length}</p><p className="mt-1 text-xs text-slate-400">Công cụ trong thư viện</p></div>
                  <div><p className="text-3xl font-bold">Từng bước</p><p className="mt-1 text-xs text-slate-400">Tiếp cận kiến thức AI</p></div>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>
        <SectionReveal>
          <section className="border-y border-slate-200/60 bg-[#f2f4fb] py-12 sm:py-16">
            <div className="container-max section-padding">
              <p className="discovery-eyebrow">NHỮNG ĐIỀU QAI THEO ĐUỔI</p>
              <h2 className="mb-8 mt-3 text-3xl font-bold tracking-tight">Trải nghiệm tốt bắt đầu từ sự rõ ràng.</h2>
              <div className="grid gap-4 md:grid-cols-3">{values.map(({ icon: Icon, ...value }) => <article key={value.title} className="discovery-card p-6 sm:p-7"><span className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${value.color}`}><Icon className="h-6 w-6" /></span><h3 className="text-lg font-bold">{value.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{value.description}</p></article>)}</div>
            </div>
          </section>
        </SectionReveal>
        <SectionReveal>
          <section className="container-max section-padding py-12 sm:py-16">
            <div className="discovery-panel grid overflow-hidden md:grid-cols-[280px_1fr]">
              <div className="relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100 p-8">
                <Image src="/images/founder.png" alt="Nguyễn Quốc Anh, người sáng lập QAI STORE" width={160} height={160} className="h-40 w-40 rounded-[2rem] border-4 border-white object-cover shadow-xl shadow-violet-950/10" />
                <span className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-violet-700">Người sáng lập</span>
              </div>
              <div className="p-6 sm:p-9">
                <p className="discovery-eyebrow">NGƯỜI ĐỒNG HÀNH CÙNG BẠN</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Xin chào, mình là Quốc Anh.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">Mình là Nguyễn Quốc Anh, người sáng lập QAI STORE. Mình phụ trách định hướng sản phẩm, tiêu chuẩn vận hành và trải nghiệm khách hàng.</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">Mục tiêu của mình là xây dựng một nền tảng rõ ràng, minh bạch và thuận tiện: bạn dễ lựa chọn, dễ sử dụng và có kênh hỗ trợ khi cần.</p>
                <a href="https://zalo.me/0389660305" target="_blank" rel="noopener noreferrer" className="discovery-secondary mt-6"><MessageCircle className="h-4 w-4" />Kết nối với mình</a>
              </div>
            </div>
          </section>
        </SectionReveal>
        <SectionReveal>
          <section className="container-max section-padding pb-16">
            <div className="discovery-banner flex flex-col items-start justify-between gap-6 p-7 sm:p-10 lg:flex-row lg:items-center"><div><p className="text-xs font-semibold tracking-widest text-violet-300">BƯỚC TIẾP THEO CỦA BẠN</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Bắt đầu từ điều khiến bạn tò mò.</h2></div><Link href="/cong-cu-ai" className="discovery-secondary shrink-0"><Bot className="h-4 w-4" />Khám phá công cụ AI<ArrowRight className="h-4 w-4" /></Link></div>
          </section>
        </SectionReveal>
      </main>
      <Footer />
    </DiscoveryShell>
  );
}
