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
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="relative overflow-hidden bg-gradient-to-b from-violet-950 via-slate-900 to-slate-950">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl animate-float" />
        <div className="absolute top-48 -right-20 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-3xl [animation-duration:4s] animate-float" />

        <SectionReveal>
          <section className="relative z-10 container-max section-padding py-16 sm:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 border-white/20 bg-white/15 text-white shadow-lg">
                <Sparkles className="mr-1 h-3 w-3" />
                Bản đồ công cụ AI
              </Badge>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                Giới thiệu các AI
                <span className="mt-2 block bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  phù hợp từng lĩnh vực
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Tra cứu nhanh AI nào dùng cho việc gì — tên công cụ, mô tả phù hợp và link
                website chính thức để bạn truy cập ngay.
              </p>
            </div>
          </section>
        </SectionReveal>

        <section className="relative z-10 container-max section-padding pb-16">
          <SectionReveal delayMs={60}>
            <div className="mx-auto mb-8 max-w-3xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên AI, lĩnh vực hoặc công việc..."
                  className="h-11 border-white/20 bg-white/10 pl-10 text-white placeholder:text-slate-400 focus-visible:ring-violet-400"
                />
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delayMs={100}>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={categoryFilter === "all" ? "default" : "outline"}
              className={
                categoryFilter === "all"
                  ? "bg-white text-slate-900 hover:bg-white/90"
                  : "border-white/30 bg-transparent text-white hover:bg-white/10"
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
                      ? "bg-white text-slate-900 hover:bg-white/90"
                      : "border-white/30 bg-transparent text-white hover:bg-white/10"
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
              <Card className="mx-auto max-w-lg border-white/20 bg-white/10 text-white backdrop-blur">
              <CardContent className="p-8 text-center">
                <Bot className="mx-auto mb-3 h-10 w-10 text-violet-300" />
                <p className="font-medium">Không tìm thấy AI phù hợp</p>
                <p className="mt-1 text-sm text-slate-300">Thử từ khóa khác hoặc chọn &quot;Tất cả&quot;.</p>
              </CardContent>
              </Card>
            </SectionReveal>
          ) : (
            <div className="space-y-10">
              {groupedByCategory.map(({ category, tools }, groupIdx) => (
                <SectionReveal key={category.id} delayMs={groupIdx * 50}>
                  <div>
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-white sm:text-2xl">{category.name}</h2>
                      <p className="mt-1 text-sm text-slate-300">{category.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tools.map((tool, idx) => (
                        <SectionReveal
                          key={tool.id}
                          delayMs={Math.min(idx * 55, 330)}
                        >
                          <Card
                            className="flex h-full flex-col overflow-hidden rounded-2xl border border-violet-200/60 bg-[#ebe8f4] shadow-md shadow-violet-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-950/15"
                          >
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            <AiToolLogo tool={tool} className="h-12 w-12" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg text-violet-950">{tool.name}</CardTitle>
                                {tool.note ? (
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0 bg-violet-100 text-violet-800 hover:bg-violet-100"
                                  >
                                    {tool.note}
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700/80">
                              Phù hợp cho
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">{tool.useCase}</p>
                          </div>
                          <a
                            href={tool.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#ddd6f3] text-sm font-semibold text-violet-950 transition-colors hover:bg-[#cfc3ee]"
                          >
                            Mở website
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
            <Card className="mx-auto mt-12 max-w-3xl border-white/20 bg-white/10 text-white backdrop-blur">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <p className="font-semibold">Cần mẫu prompt để dùng với các AI trên?</p>
                <p className="mt-1 text-sm text-slate-300">
                  Xem thư viện prompt ảnh, video và văn bản do cửa hàng tổng hợp.
                </p>
              </div>
              <Button asChild className="shrink-0 bg-white text-slate-900 hover:bg-white/90">
                <Link href="/prompt">
                  Thư viện Prompt
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
            </Card>
          </SectionReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
