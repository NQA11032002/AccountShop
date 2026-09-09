"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
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
import { mapApiGuideToUi, mapApiGuidesToUi, mapFallbackGuideToUi } from "@/lib/ai-guide-mappers";
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
          setGuide(mapFallbackGuideToUi(fallback));
          setAllGuides(AI_GUIDES.map(mapFallbackGuideToUi));
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
      <DiscoveryShell>
        <Header />
        <main className="relative z-10 ">
          <div className="container-max section-padding py-20">
            <p className="text-center text-sm text-brand-gray/70">Đang tải hướng dẫn…</p>
          </div>
          <Footer />
        </main>
      </DiscoveryShell>
    );
  }

  if (notFound || !guide) {
    return (
      <DiscoveryShell>
        <Header />
        <main className="relative z-10 ">
          <div className="container-max section-padding py-20">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-brand-charcoal">Không tìm thấy hướng dẫn</h1>
              <p className="mt-3 text-brand-gray/75">
                AI bạn chọn chưa có trang hướng dẫn hoặc đường dẫn không đúng.
              </p>
              <Button asChild className="mt-6">
                <Link href="/huong-dan">Quay lại danh sách AI</Link>
              </Button>
            </div>
          </div>
          <Footer />
        </main>
      </DiscoveryShell>
    );
  }

  const tool = getAiGuideTool(guide);

  return (
    <DiscoveryShell>
      <Header />

      <main className="relative z-10 min-w-0 overflow-x-clip ">
        <section className="pb-20 pt-8">
          <div className="container-max section-padding">
            <Button asChild variant="ghost" className="-ml-2 mb-6 gap-2 text-brand-gray">
              <Link href="/huong-dan">
                <ArrowLeft className="h-4 w-4" />
                Tất cả hướng dẫn AI
              </Link>
            </Button>

            <div className="discovery-panel mb-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <AiToolLogo tool={tool} className="h-16 w-16 rounded-2xl" />
              <div className="min-w-0"><p className="discovery-eyebrow">HỌC QUA THỰC HÀNH</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{guide.name || tool.name}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{guide.subtitle}</p></div>
              <span className="shrink-0 rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 sm:ml-auto">{guide.features.length} tính năng</span>
            </div>
            <div className="mb-5 lg:hidden"><label htmlFor="guide-feature" className="mb-2 block text-sm font-semibold">Chọn tính năng muốn học</label><select id="guide-feature" value={activeFeature?.id ?? ""} onChange={event => setActiveFeatureId(event.target.value)} className="discovery-search w-full min-w-0 px-3">{guide.features.map((feature, index) => <option key={feature.id} value={feature.id}>{index + 1}. {feature.title}</option>)}</select></div>
            <div className="grid min-w-0 max-w-full gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
              <SectionReveal delayMs={80} className="hidden min-w-0 max-w-full lg:block">
                <aside className="min-w-0 max-w-full lg:sticky lg:top-32 lg:self-start">
                  <Card className="discovery-panel rounded-3xl border-slate-200/80 bg-white/90 shadow-sm">
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
                              aria-pressed={active}
                              className={cn(
                                "discovery-lesson w-full min-w-0 max-w-full rounded-2xl border px-3 py-3 text-left transition-all",
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
                                  <p className="break-words font-semibold text-brand-charcoal [overflow-wrap:anywhere]">
                                    {feature.title}
                                  </p>
                                  <p className="mt-1 break-words text-xs leading-relaxed text-brand-gray/70 [overflow-wrap:anywhere]">
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

              <SectionReveal delayMs={120} className="min-w-0 max-w-full">
                <div key={activeFeature?.id} className="discovery-enter min-w-0 max-w-full space-y-6">
                  {activeFeature ? (
                    <>
                      <Card className="discovery-panel min-w-0 max-w-full rounded-3xl border-slate-200/80 bg-white/95 shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-gray/50">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Chi tiết tính năng
                          </div>
                          <h2 className="break-words text-2xl font-bold text-brand-charcoal [overflow-wrap:anywhere] sm:text-3xl">
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
                                <li key={item} className="flex min-w-0 gap-3 text-sm text-brand-gray/80">
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-emerald" />
                                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="discovery-panel min-w-0 max-w-full overflow-hidden rounded-3xl border-slate-200/80 bg-white/95 shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-gray/50">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Hình minh họa
                          </div>

                          {(activeFeature.imageUrls?.length ?? 0) > 0 ? (
                            <div className="min-w-0 max-w-full space-y-4">
                              {(activeFeature.imageUrls ?? []).map((url, index) => (
                                <div
                                  key={`${url}-${index}`}
                                  className="max-w-full overflow-hidden rounded-3xl border border-slate-200"
                                >
                                  <img
                                    loading="lazy"
                                    src={resolveApiAssetUrl(url)}
                                    alt={
                                      activeFeature.imageTitle ||
                                      `${activeFeature.title} — ảnh ${index + 1}`
                                    }
                                    className="block h-auto max-h-[600px] w-full max-w-full object-contain"
                                  />
                                </div>
                              ))}
                              {(activeFeature.imageTitle || activeFeature.imageCaption) && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                  {activeFeature.imageTitle ? (
                                    <h3 className="break-words text-lg font-bold text-brand-charcoal [overflow-wrap:anywhere]">
                                      {activeFeature.imageTitle}
                                    </h3>
                                  ) : null}
                                  {activeFeature.imageCaption ? (
                                    <p className="mt-2 break-words text-sm leading-relaxed text-brand-gray/75 [overflow-wrap:anywhere]">
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

                                <div className="min-w-0 p-6 sm:p-8">
                                  <h3 className="break-words text-xl font-bold text-brand-charcoal [overflow-wrap:anywhere]">
                                    {activeFeature.imageTitle}
                                  </h3>
                                  <p className="mt-2 break-words text-sm leading-relaxed text-brand-gray/75 [overflow-wrap:anywhere]">
                                    {activeFeature.imageCaption}
                                  </p>

                                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    {activeFeature.bullets.map((item, index) => (
                                      <div
                                        key={item}
                                        className="min-w-0 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                                      >
                                        <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                                          {index + 1}
                                        </div>
                                        <p className="break-words text-sm leading-relaxed text-brand-gray/80 [overflow-wrap:anywhere]">
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
                    <Link key={item.slug} href={`/huong-dan/${item.slug}`} className="group">
                      <Card className="discovery-panel h-full rounded-3xl border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/25 hover:shadow-lg">
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
    </DiscoveryShell>
  );
}
