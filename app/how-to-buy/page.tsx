"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiToolLogo from "@/components/AiToolLogo";
import SectionReveal from "@/components/SectionReveal";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, Layers3, Search, Sparkles } from "lucide-react";
import { AI_GUIDES, getAiGuideTool } from "@/data/ai-guides";
import { fetchAiGuides } from "@/lib/api";
import { mapApiGuidesToUi } from "@/lib/ai-guide-mappers";
import type { AiGuide } from "@/types/ai-guide.interface";

export default function HowToBuyPage() {
  const [guides, setGuides] = useState<AiGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchAiGuides();
        if (!cancelled) {
          setGuides(mapApiGuidesToUi(res.data));
        }
      } catch {
        if (!cancelled) {
          setGuides(AI_GUIDES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGuides = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guides;

    return guides.filter((guide) => {
      const tool = getAiGuideTool(guide);
      const name = (guide.name || tool.name || "").toLowerCase();
      const toolId = (guide.toolId || "").toLowerCase();
      const category = (guide.category || "").toLowerCase();
      return name.includes(q) || toolId.includes(q) || category.includes(q);
    });
  }, [guides, search]);

  return (
    <PageShell>
      <Header />

      <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90">
        <SectionReveal>
          <PageHero
            badge="Kho hướng dẫn AI"
            title={
              <>
                Khám phá cách dùng
                <span className="gradient-text">các AI phổ biến</span>
              </>
            }
            description="Chọn một AI để xem danh sách tính năng nổi bật, rồi mở từng mục để đọc hướng dẫn chi tiết và phần minh họa trực quan."
          />
        </SectionReveal>

        <SectionReveal delayMs={80}>
          <section className="pb-8">
            <div className="container-max section-padding">
              {!loading && guides.length > 0 ? (
                <div className="mx-auto mb-8 max-w-xl">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm AI theo tên…"
                      className="h-12 rounded-xl border-slate-200/80 bg-white/90 pl-10 shadow-sm"
                      aria-label="Tìm kiếm hướng dẫn AI theo tên"
                    />
                  </div>
                </div>
              ) : null}

              {loading ? (
                <p className="py-16 text-center text-sm text-brand-gray/70">Đang tải hướng dẫn…</p>
              ) : guides.length === 0 ? (
                <p className="py-16 text-center text-sm text-brand-gray/70">
                  Chưa có hướng dẫn AI nào.
                </p>
              ) : filteredGuides.length === 0 ? (
                <p className="py-16 text-center text-sm text-brand-gray/70">
                  Không tìm thấy AI nào khớp với &ldquo;{search.trim()}&rdquo;.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {filteredGuides.map((guide) => {
                    const tool = getAiGuideTool(guide);

                    return (
                      <Link key={guide.slug} href={`/how-to-buy/${guide.slug}`} className="group flex h-full">
                        <Card className="flex h-full w-full flex-col overflow-hidden rounded-3xl border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/25 hover:shadow-xl">
                          <CardContent className="flex flex-1 flex-col p-0">
                            <div className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-violet-100 p-6">
                              <div
                                aria-hidden="true"
                                className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-blue/10 blur-2xl"
                              />
                              <div className="relative">
                                <AiToolLogo
                                  tool={tool}
                                  className="h-16 w-16 rounded-2xl bg-white p-2 ring-1 ring-slate-200"
                                  imgClassName="h-full w-full object-contain"
                                />
                              </div>
                              <h2 className="mt-5 text-2xl font-bold text-brand-charcoal">
                                {guide.name || tool.name}
                              </h2>
                              <p className="mt-2 text-sm leading-relaxed text-brand-gray/80">
                                {guide.subtitle}
                              </p>
                            </div>

                            <div className="flex flex-1 flex-col space-y-4 p-6">
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                  <BookOpen className="h-3 w-3" />
                                  {guide.features.length} tính năng
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                  <Layers3 className="h-3 w-3" />
                                  Có hình minh họa
                                </span>
                              </div>

                              <ul className="space-y-2">
                                {guide.features.slice(0, 3).map((feature) => (
                                  <li
                                    key={feature.id}
                                    className="flex items-start gap-2 text-sm text-brand-gray/75"
                                  >
                                    <Sparkles className="mt-0.5 h-3.5 w-3.5 text-brand-emerald" />
                                    <span>{feature.title}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand-blue">
                                Mở hướng dẫn
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </SectionReveal>

        <SectionReveal delayMs={140}>
          <section className="pb-20">
            <div className="container-max section-padding">
              <div className="rounded-3xl bg-gradient-brand px-6 py-8 text-white shadow-2xl sm:px-8">
                <h2 className="text-2xl font-bold sm:text-3xl">Cách dùng nhanh hơn, đúng hơn</h2>
                <p className="mt-3 max-w-3xl text-white/85">
                  Mỗi trang AI sẽ có danh sách tính năng cụ thể. Chỉ cần chọn một mục trong
                  danh sách, bạn sẽ thấy phần mô tả chi tiết, mẹo triển khai và khung minh họa
                  để áp dụng ngay vào công việc.
                </p>
              </div>
            </div>
          </section>
        </SectionReveal>

        <Footer />
      </main>
    </PageShell>
  );
}
