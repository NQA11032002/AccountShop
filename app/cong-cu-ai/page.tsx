"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  AI_TOOL_CATEGORIES,
  AI_TOOLS,
  getCategoryById,
} from "@/data/ai-tools";
import AiToolLogo from "@/components/AiToolLogo";
import SectionReveal from "@/components/SectionReveal";

export default function CongCuAiPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AI_TOOLS.filter((tool) => {
      if (categoryFilter !== "all" && tool.categoryId !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      const category = getCategoryById(tool.categoryId);
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.useCase.toLowerCase().includes(q) ||
        (tool.note?.toLowerCase().includes(q) ?? false) ||
        (category?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [categoryFilter, search]);

  const groupedByCategory = useMemo(() => {
    if (categoryFilter !== "all") {
      const cat = getCategoryById(categoryFilter);
      if (!cat) return [];
      return [{ category: cat, tools: filteredTools }];
    }
    return AI_TOOL_CATEGORIES.map((category) => ({
      category,
      tools: filteredTools.filter((t) => t.categoryId === category.id),
    })).filter((g) => g.tools.length > 0);
  }, [categoryFilter, filteredTools]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100/90">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-72 -right-20 h-80 w-80 rounded-full bg-brand-emerald/15 blur-3xl [animation-duration:4s] animate-float"
      />

      <Header />

      <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90">
        <SectionReveal>
          <section className="section-spacing-home pb-0">
            <div className="container-max section-padding">
              <div className="mx-auto max-w-4xl text-center">
                <Badge className="mb-4 border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Bản đồ công cụ AI
                </Badge>
                <h1 className="text-3xl font-bold leading-snug tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl">
                  Giới thiệu các AI
                  <span className="mt-2 block pb-1.5 gradient-text">phù hợp từng lĩnh vực</span>
                </h1>
                <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-brand-gray/80 sm:text-lg">
                  Tra cứu nhanh AI nào dùng cho việc gì — tên công cụ, mô tả phù hợp và link
                  website chính thức để bạn truy cập ngay.
                </p>
              </div>
            </div>
          </section>
        </SectionReveal>

        <section className="section-spacing-home pb-16 pt-6">
          <div className="container-max section-padding">
            <SectionReveal delayMs={60}>
              <div className="mx-auto mb-8 max-w-3xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên AI, lĩnh vực hoặc công việc..."
                    className="h-11 border-violet-200/80 bg-white pl-10 shadow-md shadow-violet-950/5 ring-1 ring-violet-100 focus-visible:ring-brand-blue"
                  />
                </div>
              </div>
            </SectionReveal>

            <SectionReveal delayMs={100}>
              <div className="mb-10 flex flex-wrap justify-center gap-2 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-violet-200/70 backdrop-blur-sm sm:p-4">
                <Button
                  type="button"
                  size="sm"
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  className={
                    categoryFilter === "all"
                      ? "rounded-full bg-brand-blue text-white shadow-md shadow-brand-blue/25 hover:bg-brand-blue/90"
                      : "rounded-full border-violet-200/90 bg-violet-50/90 text-violet-950 shadow-sm hover:border-violet-300 hover:bg-violet-100"
                  }
                  onClick={() => setCategoryFilter("all")}
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
                      className={
                        active
                          ? "rounded-full bg-brand-blue text-white shadow-md shadow-brand-blue/25 hover:bg-brand-blue/90"
                          : "rounded-full border-violet-200/90 bg-violet-50/90 text-violet-950 shadow-sm hover:border-violet-300 hover:bg-violet-100"
                      }
                      onClick={() => setCategoryFilter(cat.id)}
                    >
                      {cat.name} ({count})
                    </Button>
                  );
                })}
              </div>
            </SectionReveal>

            {filteredTools.length === 0 ? (
              <SectionReveal delayMs={80}>
                <Card className="mx-auto max-w-lg border-0 bg-white shadow-lg ring-1 ring-violet-200/80">
                  <CardContent className="p-8 text-center">
                    <Bot className="mx-auto mb-3 h-10 w-10 text-brand-blue" />
                    <p className="font-medium text-brand-charcoal">Không tìm thấy AI phù hợp</p>
                    <p className="mt-1 text-sm text-brand-gray/70">
                      Thử từ khóa khác hoặc chọn &quot;Tất cả&quot;.
                    </p>
                  </CardContent>
                </Card>
              </SectionReveal>
            ) : (
              <div className="space-y-12">
                {groupedByCategory.map(({ category, tools }, groupIdx) => (
                  <SectionReveal key={category.id} delayMs={groupIdx * 50}>
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
                            <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.12)] ring-1 ring-violet-200/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(79,70,229,0.22)] hover:ring-violet-300">
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-violet-50/50 to-white" />
                              <CardHeader className="relative pb-2">
                                <div className="flex items-start gap-3">
                                  <AiToolLogo tool={tool} className="h-12 w-12" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <CardTitle className="text-lg text-brand-charcoal">
                                        {tool.name}
                                      </CardTitle>
                                      {tool.note ? (
                                        <Badge
                                          variant="secondary"
                                          className="shrink-0 border-violet-200/60 bg-violet-50 text-violet-700 hover:bg-violet-50"
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
                                  className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
                                >
                                  Dùng thử
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
    </div>
  );
}
