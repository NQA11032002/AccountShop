"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Play,
  UserPlus,
} from "lucide-react";
import { enrollAiCourse, fetchAiCourseBySlug } from "@/lib/api";
import { parseVideoPlayback } from "@/lib/video-playback";
import type { AiCourseDetail, AiCourseLesson } from "@/types/course.interface";
import SectionReveal from "@/components/SectionReveal";
import CourseLevelBadge from "@/components/CourseLevelBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function formatCourseDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function AiCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { sessionId, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<AiCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const isEnrolled = course?.is_enrolled === true;

  const loadCourse = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAiCourseBySlug(slug, sessionId);
      setCourse(res.data);
      if (res.data.is_enrolled && res.data.lessons?.[0]) {
        setActiveLessonId(res.data.lessons[0].id);
      } else {
        setActiveLessonId(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể tải khóa học");
      setCourse(null);
      setActiveLessonId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug || authLoading) return;
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sessionId, authLoading]);

  const activeLesson: AiCourseLesson | null = useMemo(() => {
    if (!isEnrolled || !course?.lessons?.length || activeLessonId == null) return null;
    return course.lessons.find((l) => l.id === activeLessonId) ?? null;
  }, [course, activeLessonId, isEnrolled]);

  const playback = useMemo(() => {
    if (!activeLesson?.video_url) return null;
    return parseVideoPlayback(activeLesson.video_url);
  }, [activeLesson]);

  const handleSelectLesson = (lessonId: number) => {
    if (!isEnrolled) {
      toast({
        title: "Cần đăng ký khóa học",
        description: "Hãy nhấn Đăng ký để mở khóa danh sách bài học.",
      });
      return;
    }
    setActiveLessonId(lessonId);
  };

  const handleEnroll = async () => {
    if (!sessionId || !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/lo-trinh-ai/${slug}`)}`);
      return;
    }
    if (enrolling) return;
    setEnrolling(true);
    try {
      await enrollAiCourse(sessionId, slug);
      toast({ title: "Đăng ký thành công", description: "Bạn có thể xem bài học ngay." });
      const res = await fetchAiCourseBySlug(slug, sessionId);
      setCourse(res.data);
      if (res.data.lessons?.[0]) {
        setActiveLessonId(res.data.lessons[0].id);
      }
    } catch (e: unknown) {
      toast({
        title: "Đăng ký thất bại",
        description: e instanceof Error ? e.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100/90">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl"
      />

      <Header />

      <main className="relative z-10">
        <div className="container-max section-padding py-8 sm:py-10">
          <Button asChild variant="ghost" className="mb-6 -ml-2 gap-2 text-brand-gray">
            <Link href="/lo-trinh-ai">
              <ArrowLeft className="h-4 w-4" />
              Tất cả khóa học
            </Link>
          </Button>

          {loading && (
            <p className="py-20 text-center text-brand-gray/70">Đang tải nội dung…</p>
          )}

          {!loading && error && (
            <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
              <p className="mb-4">{error}</p>
              <Button asChild variant="outline">
                <Link href="/lo-trinh-ai">Quay lại danh sách</Link>
              </Button>
            </div>
          )}

          {!loading && course && (
            <SectionReveal>
              <div className="mb-8 max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {course.level && <CourseLevelBadge level={course.level} />}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-sm font-semibold text-sky-700">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.lessons?.length ?? 0} bài học
                  </span>
                  {course.duration && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-sm font-semibold text-violet-700">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration}
                    </span>
                  )}
                  {(() => {
                    const createdLabel = formatCourseDate(course.created_at);
                    return createdLabel ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                        <Calendar className="h-3.5 w-3.5" />
                        {createdLabel}
                      </span>
                    ) : null;
                  })()}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="mt-4 text-base leading-relaxed text-brand-gray/80 sm:text-lg">
                    {course.description}
                  </p>
                )}
                {course.content_outline && (
                  <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-4">
                    <p className="mb-2 text-sm font-semibold text-brand-charcoal">
                      Nội dung khóa học
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-brand-gray/80">
                      {course.content_outline}
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  {isEnrolled ? (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Bạn đã đăng ký khóa học này
                    </div>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="gap-2 rounded-xl px-6"
                      size="lg"
                    >
                      <UserPlus className="h-4 w-4" />
                      {enrolling
                        ? "Đang đăng ký…"
                        : sessionId
                          ? "Đăng ký học"
                          : "Đăng nhập để đăng ký"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div
                    className={cn(
                      "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm",
                      !isEnrolled && "opacity-90"
                    )}
                  >
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-charcoal">
                      <BookOpen className="h-4 w-4 text-brand-blue" />
                      Danh sách bài học
                      {!isEnrolled && (
                        <Lock className="ml-auto h-3.5 w-3.5 text-slate-400" />
                      )}
                    </p>
                    <ol className="space-y-1">
                      {(course.lessons ?? []).map((lesson, index) => {
                        const active = isEnrolled && lesson.id === activeLesson?.id;
                        return (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectLesson(lesson.id)}
                              disabled={!isEnrolled}
                              className={cn(
                                "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                                !isEnrolled && "cursor-not-allowed text-slate-400",
                                isEnrolled &&
                                  (active
                                    ? "bg-brand-blue/10 text-brand-blue"
                                    : "text-brand-charcoal hover:bg-slate-50")
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                                  active
                                    ? "bg-brand-blue text-white"
                                    : "bg-slate-100 text-brand-gray"
                                )}
                              >
                                {isEnrolled ? index + 1 : <Lock className="h-3 w-3" />}
                              </span>
                              <span className="leading-snug">{lesson.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                    {(course.lessons?.length ?? 0) === 0 && (
                      <p className="px-1 py-4 text-sm text-brand-gray/60">
                        Khóa học chưa có bài học.
                      </p>
                    )}
                  </div>
                </aside>

                <div className="min-w-0">
                  {!isEnrolled ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Lock className="h-6 w-6" />
                      </div>
                      <p className="mb-2 text-lg font-semibold text-brand-charcoal">
                        Nội dung đang bị khóa
                      </p>
                      <p className="mb-6 max-w-md text-sm text-brand-gray/70">
                        Đăng ký khóa học để mở danh sách bài học, video và hướng dẫn chi tiết.
                      </p>
                      <Button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="gap-2 rounded-xl"
                      >
                        <UserPlus className="h-4 w-4" />
                        {enrolling
                          ? "Đang đăng ký…"
                          : sessionId
                            ? "Đăng ký học"
                            : "Đăng nhập để đăng ký"}
                      </Button>
                    </div>
                  ) : activeLesson ? (
                    <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm sm:p-8">
                      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-gray/50">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Bài học
                      </div>
                      <h2 className="text-2xl font-semibold text-brand-charcoal sm:text-3xl">
                        {activeLesson.title}
                      </h2>

                      {playback && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                          {playback.kind === "youtube" || playback.kind === "vimeo" ? (
                            <div className="aspect-video w-full">
                              <iframe
                                title={activeLesson.title}
                                src={playback.embedSrc}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : playback.kind === "direct" ? (
                            <video
                              controls
                              className="aspect-video w-full"
                              src={playback.src}
                            />
                          ) : (
                            <a
                              href={playback.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-white/90 hover:text-white"
                            >
                              <Play className="h-4 w-4" />
                              Mở video
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      )}

                      {activeLesson.content ? (
                        <div className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap text-brand-charcoal/90">
                          {activeLesson.content}
                        </div>
                      ) : (
                        !playback && (
                          <p className="mt-6 text-brand-gray/60">
                            Bài học này chưa có nội dung hướng dẫn.
                          </p>
                        )
                      )}
                    </article>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center text-brand-gray/60">
                      Chọn một bài học ở danh sách bên trái.
                    </div>
                  )}
                </div>
              </div>
            </SectionReveal>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
