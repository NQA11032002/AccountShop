"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AiCourseLesson, AiCourseSummary } from "@/types/course.interface";
import {
  createAdminAiCourse,
  deleteAdminAiCourse,
  fetchAdminAiCourses,
  resolveApiAssetUrl,
  updateAdminAiCourse,
  uploadAiCourseCoverImage,
} from "@/lib/api";
import CourseLevelBadge from "@/components/CourseLevelBadge";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";

type LessonForm = {
  id?: number;
  title: string;
  content: string;
  video_url: string;
  sort_order: number;
  is_active: boolean;
};

type CourseFormState = {
  slug: string;
  title: string;
  description: string;
  cover_image: string;
  level: string;
  duration: string;
  sort_order: number;
  is_active: boolean;
  lessons: LessonForm[];
};

const COURSE_LEVELS = ["Cơ bản", "Nâng cao"] as const;

const emptyLesson = (sort = 0): LessonForm => ({
  title: "",
  content: "",
  video_url: "",
  sort_order: sort,
  is_active: true,
});

const emptyForm: CourseFormState = {
  slug: "",
  title: "",
  description: "",
  cover_image: "",
  level: "Cơ bản",
  duration: "",
  sort_order: 0,
  is_active: true,
  lessons: [emptyLesson(0)],
};

function normalizeCourseLevel(level?: string | null): string {
  const raw = (level ?? "").trim();
  if (raw === "Nâng cao") return "Nâng cao";
  return "Cơ bản";
}

function courseToForm(c: AiCourseSummary): CourseFormState {
  const lessons = (c.lessons ?? []).map((l: AiCourseLesson, i) => ({
    id: l.id,
    title: l.title,
    content: l.content ?? "",
    video_url: l.video_url ?? "",
    sort_order: l.sort_order ?? i,
    is_active: l.is_active !== false,
  }));
  return {
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    cover_image: c.cover_image ?? "",
    level: normalizeCourseLevel(c.level),
    duration: c.duration ?? "",
    sort_order: c.sort_order ?? 0,
    is_active: c.is_active !== false,
    lessons: lessons.length > 0 ? lessons : [emptyLesson(0)],
  };
}

function formatCourseDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function AdminCourseManagerTab() {
  const { sessionId } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<AiCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  /** Index bài đang mở form chi tiết; null = tất cả thu gọn */
  const [expandedLessonIndex, setExpandedLessonIndex] = useState<number | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadCourses = async (options?: { silent?: boolean }) => {
    if (!sessionId) return;
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    try {
      const res = await fetchAdminAiCourses(sessionId);
      setItems(res.data);
    } catch (e: unknown) {
      toast({
        title: "Không tải được khóa học",
        description: e instanceof Error ? e.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setExpandedLessonIndex(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExpandedLessonIndex(0);
    setDialogOpen(true);
  };

  const openEdit = (course: AiCourseSummary) => {
    setEditingId(course.id);
    setForm(courseToForm(course));
    setExpandedLessonIndex(null);
    setDialogOpen(true);
  };

  const updateLesson = (index: number, patch: Partial<LessonForm>) => {
    setForm((prev) => {
      const lessons = [...prev.lessons];
      lessons[index] = { ...lessons[index], ...patch };
      return { ...prev, lessons };
    });
  };

  const addLesson = () => {
    const nextIndex = form.lessons.length;
    setForm((prev) => ({
      ...prev,
      lessons: [...prev.lessons, emptyLesson(prev.lessons.length)],
    }));
    setExpandedLessonIndex(nextIndex);
  };

  const removeLesson = (index: number) => {
    if (form.lessons.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      lessons: prev.lessons
        .filter((_, i) => i !== index)
        .map((l, i) => ({
          ...l,
          sort_order: i,
        })),
    }));
    setExpandedLessonIndex((cur) => {
      if (cur == null) return null;
      if (cur === index) return null;
      if (cur > index) return cur - 1;
      return cur;
    });
  };

  const moveLesson = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= form.lessons.length) return;
    setForm((prev) => {
      const lessons = [...prev.lessons];
      [lessons[index], lessons[next]] = [lessons[next], lessons[index]];
      return {
        ...prev,
        lessons: lessons.map((l, i) => ({ ...l, sort_order: i })),
      };
    });
    setExpandedLessonIndex((cur) => {
      if (cur === index) return next;
      if (cur === next) return index;
      return cur;
    });
  };

  const onPickCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !sessionId) return;
    setCoverUploading(true);
    try {
      const { url } = await uploadAiCourseCoverImage(file, sessionId);
      setForm((p) => ({ ...p, cover_image: url }));
      toast({ title: "Đã tải ảnh bìa lên" });
    } catch (err: unknown) {
      toast({
        title: "Upload thất bại",
        description:
          err instanceof Error ? err.message : "Vui lòng thử ảnh jpg/png/webp dưới 5MB.",
        variant: "destructive",
      });
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async () => {
    if (!sessionId) return;
    const title = form.title.trim();
    if (!title) {
      toast({
        title: "Thiếu tiêu đề",
        description: "Vui lòng nhập tên khóa học.",
        variant: "destructive",
      });
      return;
    }

    const lessons = form.lessons
      .filter((l) => l.title.trim())
      .map((l, i) => ({
        id: l.id,
        title: l.title.trim(),
        content: l.content.trim() || null,
        video_url: l.video_url.trim() || null,
        sort_order: i,
        is_active: l.is_active,
      }));

    const nextSortOrder =
      editingId != null
        ? form.sort_order
        : items.length === 0
          ? 0
          : Math.max(...items.map((c) => Number(c.sort_order) || 0)) + 1;

    const payload = {
      slug: form.slug.trim() || null,
      title,
      description: form.description.trim() || null,
      cover_image: form.cover_image.trim() || null,
      level: normalizeCourseLevel(form.level),
      duration: form.duration.trim() || null,
      sort_order: nextSortOrder,
      is_active: form.is_active,
      lessons,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateAdminAiCourse(sessionId, editingId, payload);
        toast({ title: "Đã cập nhật khóa học" });
      } else {
        await createAdminAiCourse(sessionId, payload);
        toast({ title: "Đã tạo khóa học" });
      }
      closeDialog();
      await loadCourses({ silent: true });
    } catch (e: unknown) {
      toast({
        title: "Lưu thất bại",
        description: e instanceof Error ? e.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!sessionId) return;
    if (!window.confirm("Xóa khóa học này và toàn bộ bài học?")) return;
    try {
      await deleteAdminAiCourse(sessionId, id);
      toast({ title: "Đã xóa khóa học" });
      if (editingId === id) closeDialog();
      await loadCourses({ silent: true });
    } catch (e: unknown) {
      toast({
        title: "Xóa thất bại",
        description: e instanceof Error ? e.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-5 w-5 text-sky-600" />
            Danh sách khóa học
          </CardTitle>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm khóa học
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Đang tải…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
              <p className="mb-4 text-sm text-slate-500">Chưa có khóa học nào.</p>
              <Button onClick={openCreate} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo khóa học đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Bài học</TableHead>
                    <TableHead>Đăng ký</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((course) => {
                    const created = formatCourseDate(course.created_at);
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">{course.title}</div>
                          <div className="text-xs text-slate-500">/{course.slug}</div>
                          {course.level && (
                            <div className="mt-1.5">
                              <CourseLevelBadge level={course.level} />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                            <BookOpen className="h-3 w-3" />
                            {course.lessons?.length ?? 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            <Users className="h-3 w-3" />
                            {course.enrollments_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          {course.duration ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {created ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                              <Calendar className="h-3 w-3" />
                              {created}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {course.is_active !== false ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              Hiện
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Ẩn</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => openEdit(course)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(course.id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-sky-600" />
              {editingId ? "Sửa khóa học" : "Thêm khóa học AI"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="course-title">Tên khóa học *</Label>
                <Input
                  id="course-title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ví dụ: ChatGPT từ cơ bản đến thực chiến"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-slug">Slug (URL)</Label>
                <Input
                  id="course-slug"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="Tự tạo từ tên nếu để trống"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-level">Cấp độ</Label>
                <Select
                  value={normalizeCourseLevel(form.level)}
                  onValueChange={(value) => setForm((p) => ({ ...p, level: value }))}
                >
                  <SelectTrigger id="course-level">
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-duration">Thời gian hoàn thành</Label>
                <Input
                  id="course-duration"
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="Ví dụ: 2 giờ, 3–5 giờ, 1 tuần"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Ảnh bìa</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                    className="hidden"
                    disabled={coverUploading || !sessionId}
                    onChange={onPickCoverImage}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    disabled={coverUploading || !sessionId}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    {coverUploading ? "Đang tải lên…" : "Chọn ảnh từ máy"}
                  </Button>
                  {form.cover_image.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setForm((p) => ({ ...p, cover_image: "" }))}
                    >
                      Gỡ ảnh
                    </Button>
                  ) : null}
                </div>
                {form.cover_image.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveApiAssetUrl(form.cover_image)}
                    alt="Ảnh bìa khóa học"
                    className="mt-2 max-h-40 w-auto max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-500">
                    Chưa có ảnh. Chấp nhận jpg, png, webp, gif, avif — tối đa 5MB.
                  </p>
                )}
                <details className="mt-1 text-sm">
                  <summary className="cursor-pointer text-slate-600 hover:text-slate-900">
                    Hoặc nhập URL ảnh thủ công
                  </summary>
                  <Input
                    className="mt-2"
                    value={form.cover_image}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, cover_image: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </details>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="course-desc">Mô tả ngắn</Label>
                <Textarea
                  id="course-desc"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Giới thiệu ngắn về khóa học"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
                id="course-active"
              />
              <Label htmlFor="course-active">Hiển thị công khai</Label>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">
                  Bài học{" "}
                  <span className="font-normal text-slate-500">
                    ({form.lessons.length})
                  </span>
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addLesson}>
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm bài
                </Button>
              </div>

              <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {form.lessons.map((lesson, index) => {
                  const expanded = expandedLessonIndex === index;
                  return (
                    <li key={lesson.id ?? `new-${index}`}>
                      <div className="flex items-center gap-1 px-2 py-1.5 sm:px-3">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-slate-50"
                          onClick={() =>
                            setExpandedLessonIndex(expanded ? null : index)
                          }
                        >
                          {expanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                            {lesson.title.trim() || (
                              <span className="font-normal text-slate-400">
                                Chưa đặt tiêu đề
                              </span>
                            )}
                          </span>
                          {!lesson.is_active && (
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              Ẩn
                            </Badge>
                          )}
                        </button>
                        <div className="flex shrink-0 items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveLesson(index, -1)}
                            disabled={index === 0}
                            title="Lên"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveLesson(index, 1)}
                            disabled={index === form.lessons.length - 1}
                            title="Xuống"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => removeLesson(index)}
                            disabled={form.lessons.length <= 1}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-3 py-3 sm:px-4">
                          <Input
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(index, { title: e.target.value })
                            }
                            placeholder="Tiêu đề bài học"
                          />
                          <Input
                            value={lesson.video_url}
                            onChange={(e) =>
                              updateLesson(index, { video_url: e.target.value })
                            }
                            placeholder="Link video (YouTube / Vimeo / mp4) — tùy chọn"
                          />
                          <Textarea
                            value={lesson.content}
                            onChange={(e) =>
                              updateLesson(index, { content: e.target.value })
                            }
                            rows={4}
                            placeholder="Nội dung hướng dẫn (văn bản)"
                          />
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={lesson.is_active}
                              onCheckedChange={(v) =>
                                updateLesson(index, { is_active: v })
                              }
                              id={`lesson-active-${index}`}
                            />
                            <Label htmlFor={`lesson-active-${index}`}>
                              Bài học đang hiện
                            </Label>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu…" : editingId ? "Cập nhật" : "Tạo khóa học"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
