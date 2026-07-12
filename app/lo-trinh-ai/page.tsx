"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  GraduationCap,
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

      <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-sky-50/40 to-slate-100/90">
        <SectionReveal>
          <section className="section-spacing-home pb-0">
            <div className="container-max section-padding">
              <div className="mx-auto max-w-4xl text-center">
                <Badge className="mb-4 border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Lộ trình học AI
                </Badge>
                <h1 className="text-3xl font-bold leading-snug tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl">
                  Khóa học AI
                  <span className="mt-2 block pb-1.5 gradient-text">thực chiến từng bước</span>
                </h1>
                <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-brand-gray/80 sm:text-lg">
                  Chọn khóa phù hợp, xem danh sách bài học và làm theo hướng dẫn ngay trên trang.
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
                    placeholder="Tìm khóa học theo tên, cấp độ…"
                    className="h-12 rounded-xl border-slate-200/80 bg-white/90 pl-10 shadow-sm"
                  />
                </div>
              </div>
            </SectionReveal>

            {loading && (
              <p className="py-16 text-center text-brand-gray/70">Đang tải khóa học…</p>
            )}

            {!loading && error && (
              <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="mx-auto max-w-lg py-16 text-center text-brand-gray/70">
                <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>Chưa có khóa học nào{search.trim() ? " khớp tìm kiếm" : ""}.</p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
                {filtered.map((course, index) => {
                  const createdLabel = formatCourseDate(course.created_at);
                  return (
                  <SectionReveal key={course.id} delayMs={80 + index * 40}>
                    <Link
                      href={`/lo-trinh-ai/${course.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-md"
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
    </div>
  );
}
