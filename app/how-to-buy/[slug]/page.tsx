"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageShell from "@/components/PageShell";
import AiToolLogo from "@/components/AiToolLogo";
import SectionReveal from "@/components/SectionReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { AI_GUIDES, getAiGuideBySlug, getAiGuideTool } from "@/data/ai-guides";
import { fetchAiGuideBySlug, fetchAiGuides, resolveApiAssetUrl } from "@/lib/api";
import { mapApiGuideToUi, mapApiGuidesToUi } from "@/lib/ai-guide-mappers";
import type { AiGuide } from "@/types/ai-guide.interface";
import { cn } from "@/lib/utils";
import { RichText } from "@/lib/rich-text";

export default function AiGuideDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [guide, setGuide] = useState<AiGuide | null>(null);
  const [allGuides, setAllGuides] = useState<AiGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState("");

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const [detailRes, listRes] = await Promise.all([
          fetchAiGuideBySlug(slug),
          fetchAiGuides(),
        ]);
        if (cancelled) return;
        const mapped = mapApiGuideToUi(detailRes.data);
        setGuide(mapped);
        setAllGuides(mapApiGuidesToUi(listRes.data));
        setActiveFeatureId(mapped.features[0]?.id ?? "");
      } catch {
        if (cancelled) return;
        const fallback = getAiGuideBySlug(slug);
        if (fallback) {
          setGuide(fallback);
          setAllGuides(AI_GUIDES);
          setActiveFeatureId(fallback.features[0]?.id ?? "");
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const activeFeature = useMemo(
    () => guide?.features.find((feature) => feature.id === activeFeatureId) ?? guide?.features[0],
    [guide, activeFeatureId]
  );

  const relatedGuides = useMemo(
    () => (guide ? allGuides.filter((item) => item.slug !== guide.slug).slice(0, 3) : []),
    [allGuides, guide]
  );

  if (loading) {
    return (
      <PageShell>
        <Header />
        <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90">
          <div className="container-max section-padding py-20">
            <p className="text-center text-sm text-brand-gray/70">Đang tải hướng dẫn…</p>
          </div>
          <Footer />
        </main>
      </PageShell>
    );
  }

  if (notFound || !guide) {
    return (
      <PageShell>
        <Header />
        <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90">
          <div className="container-max section-padding py-20">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-brand-charcoal">Không tìm thấy hướng dẫn</h1>
              <p className="mt-3 text-brand-gray/75">
                AI bạn chọn chưa có trang hướng dẫn hoặc đường dẫn không đúng.
              </p>
              <Button asChild className="mt-6">
                <Link href="/how-to-buy">Quay lại danh sách AI</Link>
              </Button>
            </div>
          </div>
          <Footer />
        </main>
      </PageShell>
    );
  }

  const tool = getAiGuideTool(guide);

  return (
    <PageShell>
      <Header />

      <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90">
        <section className="pb-20 pt-8">
          <div className="container-max section-padding">
            <Button asChild variant="ghost" className="-ml-2 mb-6 gap-2 text-brand-gray">
              <Link href="/how-to-buy">
                <ArrowLeft className="h-4 w-4" />
                Tất cả hướng dẫn AI
              </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <SectionReveal delayMs={80}>
                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <Card className="rounded-3xl border-slate-200/80 bg-white/90 shadow-sm">
                    <CardContent className="p-4">
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-charcoal">
                        <BookOpen className="h-4 w-4 text-brand-blue" />
                        Danh sách tính năng
                      </p>

                      <div className="space-y-2">
                        {guide.features.map((feature, index) => {
                          const active = feature.id === activeFeature?.id;
                          return (
                            <button
                              key={feature.id}
                              type="button"
                              onClick={() => setActiveFeatureId(feature.id)}
                              className={cn(
                                "w-full rounded-2xl border px-3 py-3 text-left transition-all",
                                active
                                  ? "border-brand-blue/20 bg-brand-blue/10 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-brand-blue/20 hover:bg-slate-50"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={cn(
                                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                    active
                                      ? "bg-brand-blue text-white"
                                      : "bg-slate-100 text-brand-gray"
                                  )}
                                >
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-brand-charcoal">{feature.title}</p>
                                  <p className="mt-1 text-xs leading-relaxed text-brand-gray/70">
                                    {feature.summary}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              </SectionReveal>

              <SectionReveal delayMs={120}>
                <div className="min-w-0 space-y-6">
                  {activeFeature ? (
                    <>
                      <Card className="rounded-3xl border-slate-200/80 bg-white/95 shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-gray/50">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Chi tiết tính năng
                          </div>
                          <h2 className="text-2xl font-bold text-brand-charcoal sm:text-3xl">
                            {activeFeature.title}
                          </h2>
                          <RichText
                            text={activeFeature.detail}
                            className="mt-4 text-base leading-relaxed text-brand-gray/80"
                          />

                          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                            <p className="mb-3 text-sm font-semibold text-brand-charcoal">
                              Điểm cần nhớ
                            </p>
                            <ul className="space-y-3">
                              {activeFeature.bullets.map((item) => (
                                <li key={item} className="flex gap-3 text-sm text-brand-gray/80">
                                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-emerald" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white/95 shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-gray/50">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Hình minh họa
                          </div>

                          {(activeFeature.imageUrls?.length ?? 0) > 0 ? (
                            <div className="space-y-4">
                              {(activeFeature.imageUrls ?? []).map((url, index) => (
                                <div
                                  key={`${url}-${index}`}
                                  className="overflow-hidden rounded-3xl border border-slate-200"
                                >
                                  <img
                                    src={resolveApiAssetUrl(url)}
                                    alt={
                                      activeFeature.imageTitle ||
                                      `${activeFeature.title} — ảnh ${index + 1}`
                                    }
                                    className="max-h-[420px] w-full object-cover"
                                  />
                                </div>
                              ))}
                              {(activeFeature.imageTitle || activeFeature.imageCaption) && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                  {activeFeature.imageTitle ? (
                                    <h3 className="text-lg font-bold text-brand-charcoal">
                                      {activeFeature.imageTitle}
                                    </h3>
                                  ) : null}
                                  {activeFeature.imageCaption ? (
                                    <p className="mt-2 text-sm leading-relaxed text-brand-gray/75">
                                      {activeFeature.imageCaption}
                                    </p>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-violet-50">
                              <div className="grid gap-0 lg:grid-cols-[180px_minmax(0,1fr)]">
                                <div className="flex items-center justify-center border-b border-slate-200 bg-gradient-to-br from-sky-100 to-violet-100 p-8 lg:border-b-0 lg:border-r">
                                  <AiToolLogo
                                    tool={tool}
                                    className="h-24 w-24 rounded-3xl bg-white p-3 ring-1 ring-slate-200"
                                    imgClassName="h-full w-full object-contain"
                                  />
                                </div>

                                <div className="p-6 sm:p-8">
                                  <h3 className="text-xl font-bold text-brand-charcoal">
                                    {activeFeature.imageTitle}
                                  </h3>
                                  <p className="mt-2 text-sm leading-relaxed text-brand-gray/75">
                                    {activeFeature.imageCaption}
                                  </p>

                                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    {activeFeature.bullets.map((item, index) => (
                                      <div
                                        key={item}
                                        className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                                      >
                                        <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                                          {index + 1}
                                        </div>
                                        <p className="text-sm leading-relaxed text-brand-gray/80">
                                          {item}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : null}
                </div>
              </SectionReveal>
            </div>
          </div>
        </section>

        <SectionReveal delayMs={180}>
          <section className="pb-20">
            <div className="container-max section-padding">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-brand-charcoal">Xem thêm AI khác</h2>
                  <p className="mt-1 text-sm text-brand-gray/75">
                    Chuyển nhanh sang các trang hướng dẫn liên quan.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {relatedGuides.map((item) => {
                  const relatedTool = getAiGuideTool(item);

                  return (
                    <Link key={item.slug} href={`/how-to-buy/${item.slug}`} className="group">
                      <Card className="h-full rounded-3xl border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/25 hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <AiToolLogo
                              tool={relatedTool}
                              className="h-14 w-14 rounded-2xl bg-white p-2 ring-1 ring-slate-200"
                              imgClassName="h-full w-full object-contain"
                            />
                            <div>
                              <p className="text-lg font-bold text-brand-charcoal">
                                {item.name || relatedTool.name}
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-brand-gray/80">
                            {item.subtitle}
                          </p>

                          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                            Mở hướng dẫn
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </SectionReveal>

        <Footer />
      </main>
    </PageShell>
  );
}
