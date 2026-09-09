"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import DiscoveryHero from "@/components/discovery/DiscoveryHero";
import DiscoverySteps from "@/components/discovery/DiscoverySteps";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  ArrowRight,
  Layers,
  Clock,
  Calendar,
} from "lucide-react";
import { fetchAiCourses, resolveApiAssetUrl } from "@/lib/api";
import type { AiCourseSummary } from "@/types/course.interface";
import SectionReveal from "@/components/SectionReveal";
import CourseLevelBadge from "@/components/CourseLevelBadge";

function formatCourseDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function LoTrinhAiPage() {
  const [courses, setCourses] = useState<AiCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAiCourses();
        if (!cancelled) setCourses(res.data ?? []);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Không thể tải khóa học");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        (c.content_outline?.toLowerCase().includes(q) ?? false) ||
        (c.level?.toLowerCase().includes(q) ?? false) ||
        (c.duration?.toLowerCase().includes(q) ?? false)
    );
  }, [courses, search]);

  return (
    <DiscoveryShell>
      <Header />

      <main>
        <DiscoveryHero theme="courses" badge="Khóa học & lộ trình AI" title={<>Học điều mới.<span className="discovery-gradient">Tiến xa mỗi ngày.</span></>} description="Chọn khóa học phù hợp, khám phá nội dung và từng bước đưa AI vào công việc của bạn.">
          <Link href="/huong-dan" className="discovery-secondary"><BookOpen className="h-4 w-4" />Làm quen với AI trước</Link>
        </DiscoveryHero>

        <section className="section-spacing-home pb-16">
          <div className="container-max section-padding">
            <SectionReveal>
              <DiscoverySteps steps={[{ title: "Chọn khóa học", description: "Xem cấp độ và nội dung phù hợp." }, { title: "Đăng ký tham gia", description: "Mở nội dung theo quyền truy cập." }, { title: "Học & thực hành", description: "Theo dõi các bài học từng bước." }]} />
            </SectionReveal>
            <SectionReveal delayMs={60}>
              <div className="mb-8 mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="discovery-eyebrow">KHÔNG GIAN HỌC TẬP</p><h2 className="mt-2 text-2xl font-bold">Chọn hành trình của bạn</h2></div>
                <div className="relative w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm khóa học theo tên, cấp độ…"
                    className="discovery-search pl-10"
                    aria-label="Tìm khóa học theo tên hoặc cấp độ"
                  />
                </div>
              </div>
            </SectionReveal>

            {loading && (
              <div role="status"><p className="mb-4 text-sm text-slate-500">Đang tải khóa học…</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="discovery-skeleton" aria-hidden="true" />)}</div></div>
            )}

            {!loading && error && (
              <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="discovery-empty mx-auto max-w-lg">
                <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>Chưa có khóa học nào{search.trim() ? " khớp tìm kiếm" : ""}.</p>{search.trim() && <button type="button" className="discovery-secondary mt-4" onClick={() => setSearch("")}>Xóa tìm kiếm</button>}
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((course, index) => {
                  const createdLabel = formatCourseDate(course.created_at);
                  return (
                  <SectionReveal key={course.id} delayMs={Math.min(index * 50, 180)}>
                    <Link
                      href={`/lo-trinh-ai/${course.slug}`}
                      className="discovery-card group flex h-full flex-col overflow-hidden"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-sky-100 via-white to-emerald-50">
                        {course.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveApiAssetUrl(course.cover_image)}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Layers className="h-14 w-14 text-brand-blue/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {course.level && <CourseLevelBadge level={course.level} />}
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                            <BookOpen className="h-3 w-3" />
                            {course.lessons_count ?? 0} bài học
                          </span>
                          {course.duration && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </span>
                          )}
                          {createdLabel && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              <Calendar className="h-3 w-3" />
                              {createdLabel}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold text-brand-charcoal group-hover:text-brand-blue sm:text-xl">
                          {course.title}
                        </h2>
                        {course.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-gray/75">
                            {course.description}
                          </p>
                        )}
                        {course.content_outline && (
                          <div className="mt-3 flex-1">
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray/50">
                              Nội dung khóa học
                            </p>
                            <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-brand-gray/75">
                              {course.content_outline}
                            </p>
                          </div>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue">
                          Xem lộ trình
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </SectionReveal>
                  );
                })}
              </div>
            )}

            {!loading && !error && courses.length > 0 && (
              <div className="mt-12 text-center">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/cong-cu-ai">Khám phá thêm công cụ AI</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </DiscoveryShell>
  );
}
