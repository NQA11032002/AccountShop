"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import DiscoveryHero from "@/components/discovery/DiscoveryHero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bot,
  ExternalLink,
  Search,
  ArrowRight,
} from "lucide-react";
import {
  AI_TOOL_CATEGORIES,
  AI_TOOLS,
  getCategoryById,
  filterAiTools,
  NEW_AI_TOOL_IDS,
} from "@/data/ai-tools";
import AiToolLogo from "@/components/AiToolLogo";
import SectionReveal from "@/components/SectionReveal";

export default function CongCuAiPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newOnly, setNewOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const filteredTools = useMemo(() => filterAiTools(categoryFilter, search, newOnly), [categoryFilter, search, newOnly]);
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleTools = useMemo(() => filteredTools.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredTools, currentPage]);

  const groupedByCategory = useMemo(() => {
    if (categoryFilter !== "all") {
      const cat = getCategoryById(categoryFilter);
      if (!cat) return [];
      return [{ category: cat, tools: visibleTools }];
    }
    return AI_TOOL_CATEGORIES.map((category) => ({
      category,
      tools: visibleTools.filter((t) => t.categoryId === category.id),
    })).filter((g) => g.tools.length > 0);
  }, [categoryFilter, visibleTools]);

  return (
    <DiscoveryShell>
      <Header />

      <main>
        <DiscoveryHero theme="tools" badge="Bản đồ công cụ AI" title={<>Tìm đúng công cụ.<span className="discovery-gradient">Mở thêm khả năng.</span></>} description="Từ viết nội dung đến thiết kế, lập trình và nghiên cứu. Khám phá công cụ phù hợp với điều bạn muốn làm.">
          <span className="rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-semibold text-violet-700">{AI_TOOLS.length} công cụ</span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600">{AI_TOOL_CATEGORIES.length} nhóm nhu cầu</span>
        </DiscoveryHero>

        <section className="section-spacing-home pb-16">
          <div className="container-max section-padding">
            <SectionReveal delayMs={60}>
              <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="discovery-eyebrow">KHÁM PHÁ THEO CÁCH CỦA BẠN</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Bạn đang cần trợ giúp việc gì?</h2></div><div className="w-full sm:max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Tìm theo tên AI, lĩnh vực hoặc công việc..."
                    aria-label="Tìm công cụ AI theo tên hoặc nhu cầu"
                    className="discovery-search pl-10"
                  />
                </div>
              </div></div>
            </SectionReveal>

            <SectionReveal delayMs={100}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" className="discovery-pill" aria-pressed={newOnly} onClick={() => { setNewOnly(!newOnly); setPage(1); }}>
                  Mới bổ sung ({NEW_AI_TOOL_IDS.size})
                </Button>
                <p className="text-xs text-slate-500">Thử tìm: “noi that”, “excel”, “tao game”, “luyen tieng Anh”.</p>
              </div>
              <div className="mb-6 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  className="discovery-pill"
                  aria-pressed={categoryFilter === "all"}
                  onClick={() => { setCategoryFilter("all"); setPage(1); }}
                >
                  Tất cả ({AI_TOOLS.length})
                </Button>
                {AI_TOOL_CATEGORIES.map((cat) => {
                  const count = AI_TOOLS.filter((t) => t.categoryId === cat.id).length;
                  const active = categoryFilter === cat.id;
                  return (
                    <Button
                      key={cat.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="discovery-pill"
                      aria-pressed={active}
                      onClick={() => { setCategoryFilter(cat.id); setPage(1); }}
                    >
                      {cat.name} ({count})
                    </Button>
                  );
                })}
              </div>
            </SectionReveal>

            <p className="mb-8 text-xs text-slate-500" role="status">{filteredTools.length} công cụ phù hợp{search.trim() ? ` với “${search.trim()}”` : ""}</p>
            {filteredTools.length === 0 ? (
              <SectionReveal delayMs={80}>
                <Card className="mx-auto max-w-lg border-0 bg-white shadow-lg ring-1 ring-violet-200/80">
                  <CardContent className="p-8 text-center">
                    <Bot className="mx-auto mb-3 h-10 w-10 text-brand-blue" />
                    <p className="font-medium text-brand-charcoal">Không tìm thấy AI phù hợp</p>
                    <p className="mt-1 text-sm text-brand-gray/70">
                      Thử từ khóa khác hoặc chọn &quot;Tất cả&quot;.
                    </p>
                    <button type="button" className="discovery-secondary mt-5" onClick={() => { setSearch(""); setCategoryFilter("all"); setNewOnly(false); setPage(1); }}>Xóa bộ lọc</button>
                  </CardContent>
                </Card>
              </SectionReveal>
            ) : (
              <div className="space-y-12">
                {groupedByCategory.map(({ category, tools }, groupIdx) => (
                  <SectionReveal key={category.id} delayMs={Math.min(groupIdx * 40, 160)}>
                    <div>
                      <div className="mb-5">
                        <h2 className="text-xl font-bold text-brand-charcoal sm:text-2xl">
                          {category.name}
                        </h2>
                        <p className="mt-1 text-sm text-brand-gray/70">{category.description}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                        {tools.map((tool, idx) => (
                          <SectionReveal key={tool.id} delayMs={Math.min(idx * 55, 330)}>
                            <Card className="discovery-card group relative flex h-full flex-col overflow-hidden">
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-violet-50/50" />
                              <CardHeader className="relative pb-2">
                                <div className="flex items-start gap-3">
                                  <AiToolLogo tool={tool} className="h-12 w-12" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <CardTitle className="text-lg text-brand-charcoal">
                                        {tool.name}
                                      </CardTitle>
                                      {NEW_AI_TOOL_IDS.has(tool.id) && <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Mới</Badge>}
                                      {tool.note ? (
                                        <Badge
                                          variant="secondary"
                                          className="max-w-full whitespace-normal break-words border-violet-200/60 bg-violet-50 text-violet-700 hover:bg-violet-50"
                                        >
                                          {tool.note}
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="relative flex flex-1 flex-col gap-4 pt-0">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-600/90">
                                    Phù hợp cho
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-brand-gray/80">
                                    {tool.useCase}
                                  </p>
                                </div>
                                <a
                                  href={tool.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="discovery-secondary mt-auto w-full"
                                >
                                  Trang chính thức
                                  <ExternalLink className="h-4 w-4 shrink-0" />
                                </a>
                              </CardContent>
                            </Card>
                          </SectionReveal>
                        ))}
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            )}

            {totalPages > 1 && <nav aria-label="Phân trang công cụ AI" className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trang trước</Button>
              <span className="text-sm text-slate-600" aria-live="polite">Trang {currentPage}/{totalPages} · {visibleTools.length} công cụ</span>
              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Trang sau</Button>
            </nav>}

            <SectionReveal delayMs={120}>
              <Card className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border-0 bg-white shadow-lg ring-1 ring-violet-200/90">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
                  <div className="flex-1">
                    <p className="font-semibold text-brand-charcoal">
                      Cần mẫu prompt để dùng với các AI trên?
                    </p>
                    <p className="mt-1 text-sm text-brand-gray/70">
                      Xem thư viện prompt ảnh, video và văn bản do cửa hàng tổng hợp.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="shrink-0 bg-brand-blue text-white hover:bg-brand-blue/90"
                  >
                    <Link href="/prompt">
                      Thư viện Prompt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </SectionReveal>
          </div>
        </section>
      </main>

      <Footer />
    </DiscoveryShell>
  );
}
