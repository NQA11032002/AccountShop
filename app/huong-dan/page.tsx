"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers3, Search, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiToolLogo from "@/components/AiToolLogo";
import SectionReveal from "@/components/SectionReveal";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import DiscoveryHero from "@/components/discovery/DiscoveryHero";
import DiscoverySteps from "@/components/discovery/DiscoverySteps";
import { Input } from "@/components/ui/input";
import { AI_GUIDES, getAiGuideTool } from "@/data/ai-guides";
import { fetchAiGuides } from "@/lib/api";
import { mapApiGuidesToUi, mapFallbackGuideToUi } from "@/lib/ai-guide-mappers";
import type { AiGuide } from "@/types/ai-guide.interface";

const topics = [{ label: "Tất cả hướng dẫn", query: "" }, { label: "Viết nội dung", query: "viết" }, { label: "Tạo hình ảnh", query: "ảnh" }, { label: "Làm video", query: "video" }, { label: "Học tập", query: "học" }];
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

export default function AiGuidesPage() {
  const [guides, setGuides] = useState<AiGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAiGuides();
        if (!cancelled) setGuides(mapApiGuidesToUi(res.data));
      } catch {
        if (!cancelled) setGuides(AI_GUIDES.map(mapFallbackGuideToUi));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredGuides = useMemo(() => {
    const query = normalize(search.trim());
    if (!query) return guides;
    return guides.filter(guide => normalize([guide.name, getAiGuideTool(guide).name, guide.category, guide.subtitle, ...guide.audience, ...guide.features.map(feature => feature.title + " " + feature.summary)].join(" ")).includes(query));
  }, [guides, search]);

  return (
    <DiscoveryShell>
      <Header />
      <main>
        <DiscoveryHero theme="guides" badge="Bước đầu cùng AI" title={<>Bạn chưa cần giỏi AI<span className="discovery-gradient">để bắt đầu.</span></>} description="Chọn một việc bạn muốn làm. Khám phá công cụ và làm theo hướng dẫn để tự mình tạo ra kết quả đầu tiên.">
          <a href="#guide-library" className="discovery-primary">Tìm bài hướng dẫn <ArrowRight className="h-4 w-4" /></a>
          <Link href="/lo-trinh-ai" className="discovery-secondary">Khám phá khóa học</Link>
        </DiscoveryHero>
        <SectionReveal>
          <section className="container-max section-padding py-10">
            <DiscoverySteps steps={[{ title: "Chọn điều bạn muốn làm", description: "Viết nội dung, tạo ảnh, học tập và hơn thế." }, { title: "Làm theo từng bước", description: "Đọc hướng dẫn và xem phần minh họa." }, { title: "Thử với ý tưởng của bạn", description: "Áp dụng vào một việc nhỏ trong ngày." }]} />
          </section>
        </SectionReveal>
        <section id="guide-library" className="container-max section-padding scroll-mt-32 pb-14">
          <SectionReveal>
            <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="discovery-eyebrow">HỌC QUA NHỮNG ĐIỀU BẠN CẦN</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Hôm nay, bạn muốn thử gì?</h2></div>
              <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm công cụ hoặc việc muốn làm…" className="discovery-search pl-11" aria-label="Tìm hướng dẫn AI" /></div>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">{topics.map(topic => <button key={topic.label} type="button" className="discovery-pill" aria-pressed={search === topic.query} onClick={() => setSearch(topic.query)}>{topic.label}</button>)}</div>
            {!loading && <p role="status" className="mb-7 text-xs text-slate-500">{filteredGuides.length} hướng dẫn phù hợp</p>}
          </SectionReveal>
          {loading ? <div role="status"><p className="mb-4 text-sm text-slate-500">Đang tải hướng dẫn…</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="discovery-skeleton" aria-hidden="true" />)}</div></div> : filteredGuides.length === 0 ? <div className="discovery-empty"><BookOpen className="mx-auto mb-4 h-9 w-9 text-violet-400" /><p>{guides.length === 0 ? "Chưa có hướng dẫn AI nào." : "Chưa tìm thấy hướng dẫn phù hợp. Thử một nhu cầu khác nhé."}</p>{search && <button type="button" className="discovery-secondary mt-5" onClick={() => setSearch("")}>Xem tất cả hướng dẫn</button>}</div> : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredGuides.map((guide, index) => {
                const tool = getAiGuideTool(guide);
                const hasImages = guide.features.some(feature => feature.imageUrls.length > 0);
                return <SectionReveal key={guide.slug} delayMs={Math.min(index * 45, 180)}><Link href={`/huong-dan/${guide.slug}`} className="discovery-card group flex h-full flex-col overflow-hidden">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-white to-violet-50/80 p-6">
                    <div className="flex items-start justify-between gap-3"><AiToolLogo tool={tool} className="h-14 w-14 rounded-2xl" /><span className="max-w-[65%] rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-violet-600">{guide.category || "Khám phá AI"}</span></div>
                    <h3 className="mt-5 text-xl font-bold tracking-tight">{guide.name || tool.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{guide.subtitle}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-5 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-violet-500" />{guide.features.length} tính năng</span>{hasImages && <span className="flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5 text-blue-500" />Có hình minh họa</span>}</div>
                    <ul className="mb-6 space-y-2.5">{guide.features.slice(0, 3).map(feature => <li key={feature.id} className="flex items-start gap-2 text-xs leading-5 text-slate-600"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />{feature.title}</li>)}</ul>
                    <span className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-violet-700">Bắt đầu khám phá<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link></SectionReveal>;
              })}
            </div>
          )}
        </section>
        <SectionReveal>
          <section className="container-max section-padding pb-16"><div className="discovery-banner flex flex-col items-start justify-between gap-6 p-7 sm:p-10 lg:flex-row lg:items-center"><div><p className="text-xs font-semibold tracking-widest text-violet-300">HỌC XONG, THỬ NGAY</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Một câu lệnh tốt là một khởi đầu tốt.</h2><p className="mt-3 text-sm text-slate-400">Tìm mẫu, thêm bối cảnh và thử với công cụ bạn vừa học.</p></div><Link href="/prompt" className="discovery-secondary shrink-0">Mở kho câu lệnh<ArrowRight className="h-4 w-4" /></Link></div></section>
        </SectionReveal>
      </main>
      <Footer />
    </DiscoveryShell>
  );
}
