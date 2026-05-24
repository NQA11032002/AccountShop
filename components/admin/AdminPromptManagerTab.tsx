"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { PromptTemplateItem } from "@/types/prompt.interface";
import {
  createAdminPrompt,
  deleteAdminPrompt,
  fetchAdminPrompts,
  importMeigenImagePrompts,
  updateAdminPrompt,
  uploadPromptSampleImage,
} from "@/lib/api";
import PromptSampleImage from "@/components/PromptSampleImage";
import { cn } from "@/lib/utils";
import { Plus, Save, Trash2, BookText, Image as ImageIcon, Video, Download, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MEIGEN_LIMIT_MIN = 1;

function normalizeMeigenLimit(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.max(MEIGEN_LIMIT_MIN, Math.trunc(value));
}

/** Số thứ tự tiếp theo trong thể loại (max + 1). `excludeId` bỏ qua bản ghi đang sửa khi đổi thể loại. */
function nextSortOrderForCategory(
  all: PromptTemplateItem[],
  category: string,
  excludeId: number | null
): number {
  const c = category.trim();
  if (!c) return 0;
  const relevant = all.filter(
    (i) => i.category.trim() === c && (excludeId == null || i.id !== excludeId)
  );
  if (relevant.length === 0) return 0;
  return Math.max(...relevant.map((i) => Number(i.sort_order) || 0)) + 1;
}

type PromptFormState = {
  category: string;
  title: string;
  content: string;
  is_active: boolean;
  kind: "text" | "image" | "video";
  image_url: string;
  video_url: string;
  tag: string;
};

const emptyForm: PromptFormState = {
  category: "",
  title: "",
  content: "",
  is_active: true,
  kind: "text",
  image_url: "",
  video_url: "",
  tag: "",
};

export default function AdminPromptManagerTab() {
  const { sessionId, user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<PromptTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PromptFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<"all" | "text" | "image" | "video">("all");
  const [imageUploading, setImageUploading] = useState(false);
  const [meigenImporting, setMeigenImporting] = useState(false);
  const [meigenOffset, setMeigenOffset] = useState(0);
  const [meigenLimit, setMeigenLimit] = useState(100);
  const [meigenSyncMessage, setMeigenSyncMessage] = useState<string | null>(null);
  const promptImageInputRef = useRef<HTMLInputElement>(null);

  /** `silent`: cập nhật danh sách sau thêm/sửa/xóa mà không ẩn bảng (tránh nhảy scroll / cảm giác reload trang). */
  const loadPrompts = async (options?: { silent?: boolean }) => {
    if (!sessionId) return;
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    try {
      const res = await fetchAdminPrompts(sessionId);
      setItems(res.data);
    } catch (e: any) {
      toast({
        title: "Không tải được Prompt",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadPrompts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, "vi"));
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (kindFilter === "text") {
      list = list.filter((i) => (i.kind ?? "text") === "text");
    } else if (kindFilter === "image") {
      list = list.filter((i) => i.kind === "image");
    } else if (kindFilter === "video") {
      list = list.filter((i) => i.kind === "video");
    }
    if (categoryFilter !== "all") {
      list = list.filter((i) => i.category === categoryFilter);
    }
    return list;
  }, [items, categoryFilter, kindFilter]);

  /** Số thứ tự sẽ dùng khi bấm lưu (chỉ hiển thị, không nhập tay). */
  const sortOrderPreview = useMemo(() => {
    const cat = form.category.trim();
    if (!cat) return null;
    if (!editingId) {
      return nextSortOrderForCategory(items, cat, null);
    }
    const original = items.find((i) => i.id === editingId);
    if (!original) return nextSortOrderForCategory(items, cat, editingId);
    if (original.category.trim() === cat) {
      return Number(original.sort_order) || 0;
    }
    return nextSortOrderForCategory(items, cat, editingId);
  }, [items, form.category, editingId]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item: PromptTemplateItem) => {
    setEditingId(item.id);
    setForm({
      category: item.category,
      title: item.title ?? "",
      content: item.content,
      is_active: Boolean(item.is_active),
      kind: item.kind === "image" ? "image" : item.kind === "video" ? "video" : "text",
      image_url: item.image_url ?? "",
      video_url: item.video_url ?? "",
      tag: item.tag ?? "",
    });
  };

  const onSubmit = async () => {
    if (!sessionId) return;
    if (!form.category.trim() || !form.content.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập thể loại và nội dung prompt.",
        variant: "destructive",
      });
      return;
    }

    if (form.kind === "image") {
      const ref = form.image_url.trim();
      if (!ref) {
        toast({
          title: "Thiếu ảnh mẫu",
          description: "Vui lòng tải ảnh lên (hoặc điền URL/đường dẫn trong mục tuỳ chọn).",
          variant: "destructive",
        });
        return;
      }
    }

    if (form.kind === "video" && !form.video_url.trim()) {
      toast({
        title: "Thiếu link video",
        description: "Vui lòng nhập URL video (YouTube, Vimeo hoặc file .mp4/.webm).",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const cat = form.category.trim();
      let sort_order: number;
      if (!editingId) {
        sort_order = nextSortOrderForCategory(items, cat, null);
      } else {
        const original = items.find((i) => i.id === editingId);
        if (original && original.category.trim() === cat) {
          sort_order = Number(original.sort_order) || 0;
        } else {
          sort_order = nextSortOrderForCategory(items, cat, editingId);
        }
      }

      const basePayload = {
        category: cat,
        title: form.title.trim() || null,
        content: form.content.trim(),
        sort_order,
        is_active: form.is_active,
        kind: form.kind,
        image_url:
          form.kind === "image"
            ? form.image_url.trim()
            : form.kind === "video"
              ? form.image_url.trim() || null
              : null,
        video_url: form.kind === "video" ? form.video_url.trim() : null,
        tag: form.kind === "image" || form.kind === "video" ? form.tag.trim() || null : null,
      };

      if (editingId) {
        await updateAdminPrompt(sessionId, editingId, basePayload);
        toast({ title: "Đã cập nhật prompt" });
      } else {
        await createAdminPrompt(sessionId, {
          ...basePayload,
        });
        toast({ title: "Đã tạo prompt mới" });
      }
      await loadPrompts({ silent: true });
      resetForm();
    } catch (e: any) {
      toast({
        title: "Lưu prompt thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!sessionId) return;
    if (!window.confirm("Bạn chắc chắn muốn xóa prompt này?")) return;
    try {
      await deleteAdminPrompt(sessionId, id);
      toast({ title: "Đã xóa prompt" });
      await loadPrompts({ silent: true });
      if (editingId === id) resetForm();
    } catch (e: any) {
      toast({
        title: "Xóa thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const onPickPromptImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !sessionId) return;

    setImageUploading(true);
    try {
      const { url } = await uploadPromptSampleImage(file, sessionId);
      setForm((s) => ({ ...s, image_url: url }));
      toast({ title: "Đã tải ảnh lên" });
    } catch (err: any) {
      toast({
        title: "Upload thất bại",
        description: err?.message || "Vui lòng thử ảnh jpg/png/webp dưới 5MB.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const onSyncMeigen = async () => {
    if (!sessionId || meigenImporting) return;
    const offset = Math.max(0, meigenOffset);
    const limit = normalizeMeigenLimit(meigenLimit);
    if (offset !== meigenOffset) setMeigenOffset(offset);
    if (limit !== meigenLimit) setMeigenLimit(limit);

    setMeigenImporting(true);
    setMeigenSyncMessage(null);
    try {
      const res = await importMeigenImagePrompts(sessionId, {
        offset,
        limit,
      });
      await loadPrompts({ silent: true });
      setKindFilter("image");
      setCategoryFilter("Meigen AI");

      const { imported, skipped, total_fetched } = res.data;
      const successText =
        imported > 0
          ? `Thêm thành công ${imported} prompt vào database.`
          : "Không có prompt mới được thêm (có thể trùng IDmei hoặc thiếu dữ liệu).";

      setMeigenSyncMessage(
        `${successText} Bỏ qua ${skipped} · Lấy ${total_fetched} mục từ API (offset ${res.data.offset}, limit ${res.data.limit}).`
      );

      toast({
        title: imported > 0 ? `Thêm thành công ${imported} prompt` : "Đồng bộ xong",
        description: res.message ?? successText,
      });
    } catch (err: any) {
      setMeigenSyncMessage(null);
      toast({
        title: "Đồng bộ thất bại",
        description: err?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setMeigenImporting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="text-gray-600">Bạn không có quyền truy cập.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="w-5 h-5 text-indigo-600" />
            Quản lý Prompt
          </CardTitle>
          <p className="text-sm text-gray-500 pt-1">
            <span className="font-medium">Hình ảnh</span>: ảnh mẫu + prompt (tab Hình ảnh).{" "}
            <span className="font-medium">Video</span>: link YouTube/Vimeo/mp4 + poster tuỳ chọn (tab Prompt video).
          </p>
        </CardHeader>
      </Card>

      <Card className="border-violet-100 bg-violet-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-violet-600" />
            Đồng bộ Meigen.ai
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gọi Meigen.ai theo <strong>offset</strong> / <strong>limit</strong> bạn chọn. Lưu{" "}
            <strong>IDmei</strong>, image, title, prompt — bỏ qua nếu <strong>IDmei</strong> đã có trong database.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-1 w-28">
            <Label htmlFor="meigen-offset">Offset</Label>
            <Input
              id="meigen-offset"
              type="number"
              min={0}
              value={meigenOffset}
              onChange={(e) => setMeigenOffset(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <div className="space-y-1 w-28">
            <Label htmlFor="meigen-limit">Limit</Label>
            <Input
              id="meigen-limit"
              type="number"
              min={MEIGEN_LIMIT_MIN}
              step={1}
              value={meigenLimit}
              onChange={(e) => setMeigenLimit(normalizeMeigenLimit(Number(e.target.value)))}
              onBlur={() => setMeigenLimit((v) => normalizeMeigenLimit(v))}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          <Button
            type="button"
            className="page-btn-primary shrink-0"
            disabled={meigenImporting || !sessionId}
            onClick={onSyncMeigen}
          >
            {meigenImporting ? "Đang đồng bộ..." : "Đồng bộ Meigen.ai"}
          </Button>
          </div>
          {meigenSyncMessage && (
            <Alert className="w-full border-emerald-200 bg-emerald-50 text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Kết quả đồng bộ</AlertTitle>
              <AlertDescription>{meigenSyncMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="w-5 h-5 text-indigo-600" />
            Thêm / sửa Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Loại prompt</Label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                value={form.kind}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((s) => ({
                    ...s,
                    kind: v === "image" ? "image" : v === "video" ? "video" : "text",
                  }));
                }}
              >
                <option value="text">Văn bản (thư viện prompt)</option>
                <option value="image">Hình ảnh (card ảnh + Xem prompt)</option>
                <option value="video">Video (xem clip + sao chép prompt)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Thể loại</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                placeholder={
                  form.kind === "image"
                    ? "Ví dụ: Ảnh AI"
                    : form.kind === "video"
                      ? "Ví dụ: Video AI"
                      : "Ví dụ: Kinh doanh & Marketing"
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Thứ tự hiển thị</Label>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 min-h-[40px] flex items-center">
                {sortOrderPreview === null ? (
                  <span className="text-gray-400">Nhập thể loại để xem số thứ tự</span>
                ) : (
                  <span>
                    <span className="font-semibold tabular-nums">{sortOrderPreview}</span>
                    <span className="text-gray-500 font-normal ml-2">
                      {editingId
                        ? items.find((i) => i.id === editingId)?.category.trim() === form.category.trim()
                          ? "(giữ nguyên trong thể loại)"
                          : "(cuối thể loại mới)"
                        : "(tự thêm cuối thể loại)"}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Tự tăng theo từng thể loại khi thêm mới. Khi sửa: giữ số cũ nếu không đổi thể loại; đổi thể loại thì gán tiếp số cuối trong thể loại mới.
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Tiêu đề</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                placeholder={
                  form.kind === "image"
                    ? "Hiển thị trong modal và alt ảnh (vd: Poster sản phẩm tối giản)"
                    : form.kind === "video"
                      ? "Tiêu đề card và modal (vd: Kịch bản 15 giây)"
                      : "Ví dụ: 1. Giao vai rõ ràng ngay từ đầu"
                }
              />
              <p className="text-xs text-gray-500">
                {form.kind === "image"
                  ? "Tiêu đề modal khi khách xem prompt; ảnh tải lên bên dưới."
                  : form.kind === "video"
                    ? "Tiêu đề trên card và trong cửa sổ xem prompt."
                    : "Tách riêng với nội dung prompt; hiển thị trên trang khách và trong cột Tiêu đề bảng dưới."}
              </p>
            </div>
          </div>

          {form.kind === "image" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Ảnh mẫu (tải file)
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={promptImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                    className="hidden"
                    disabled={imageUploading || !sessionId}
                    onChange={onPickPromptImage}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={imageUploading || !sessionId}
                    onClick={() => promptImageInputRef.current?.click()}
                  >
                    {imageUploading ? "Đang tải lên..." : "Chọn ảnh từ máy"}
                  </Button>
                  {form.image_url.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setForm((s) => ({ ...s, image_url: "" }))}
                    >
                      Gỡ ảnh
                    </Button>
                  ) : null}
                </div>
                {form.image_url.trim() ? (
                  <PromptSampleImage
                    src={form.image_url}
                    alt="Ảnh mẫu prompt"
                    className="mt-2 max-h-40 w-auto max-w-full rounded-lg border border-gray-200 bg-white object-contain"
                  />
                ) : (
                  <p className="text-xs text-gray-500">Chưa có ảnh. Chấp nhận jpg, png, webp, gif, avif — tối đa 5MB.</p>
                )}
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-900">Hoặc nhập URL / đường dẫn thủ công</summary>
                  <Input
                    value={form.image_url}
                    onChange={(ev) => setForm((s) => ({ ...s, image_url: ev.target.value }))}
                    placeholder="https://... hoặc /images/prompts/tên-file.webp"
                    className="mt-2 font-mono text-xs"
                  />
                </details>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Tag (tùy chọn)</Label>
                <Input
                  value={form.tag}
                  onChange={(e) => setForm((s) => ({ ...s, tag: e.target.value }))}
                  placeholder="Ví dụ: Commercial — Midjourney"
                />
                <p className="text-xs text-gray-500">Hiển thị trong popup phóng to ảnh (không hiện trên card).</p>
              </div>
            </div>
          )}

          {form.kind === "video" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-cyan-100 bg-cyan-50/50 p-4">
              <div className="space-y-1 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Link video (bắt buộc)
                </Label>
                <Input
                  value={form.video_url}
                  onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... hoặc https://vimeo.com/... hoặc .mp4"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500">YouTube, Vimeo hoặc URL file .mp4 / .webm.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Ảnh poster (tuỳ chọn)
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={promptImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                    className="hidden"
                    disabled={imageUploading || !sessionId}
                    onChange={onPickPromptImage}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={imageUploading || !sessionId}
                    onClick={() => promptImageInputRef.current?.click()}
                  >
                    {imageUploading ? "Đang tải lên..." : "Chọn ảnh poster"}
                  </Button>
                  {form.image_url.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setForm((s) => ({ ...s, image_url: "" }))}
                    >
                      Gỡ poster
                    </Button>
                  ) : null}
                </div>
                {form.image_url.trim() ? (
                  <PromptSampleImage
                    src={form.image_url}
                    alt="Poster video"
                    className="mt-2 max-h-40 w-auto max-w-full rounded-lg border border-gray-200 bg-white object-contain"
                  />
                ) : (
                  <p className="text-xs text-gray-500">Không bắt buộc — để trống thì dùng nền mặc định trên trang khách.</p>
                )}
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-900">Hoặc nhập URL poster thủ công</summary>
                  <Input
                    value={form.image_url}
                    onChange={(ev) => setForm((s) => ({ ...s, image_url: ev.target.value }))}
                    placeholder="https://... hoặc /images/prompts/tên-file.webp"
                    className="mt-2 font-mono text-xs"
                  />
                </details>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Tag (tùy chọn)</Label>
                <Input
                  value={form.tag}
                  onChange={(e) => setForm((s) => ({ ...s, tag: e.target.value }))}
                  placeholder="Ví dụ: Runway — text-to-video"
                />
                <p className="text-xs text-gray-500">Hiển thị dưới tiêu đề trong popup xem video.</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>
              {form.kind === "image" || form.kind === "video" ? "Nội dung prompt (sao chép)" : "Nội dung Prompt"}
            </Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              placeholder={
                form.kind === "image"
                  ? "Toàn bộ prompt tạo ảnh (tiếng Anh hoặc theo công cụ)..."
                  : form.kind === "video"
                    ? "Prompt / kịch bản tạo video..."
                    : "Nhập nội dung prompt..."
              }
              className="min-h-[110px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((s) => ({ ...s, is_active: v }))}
            />
            <span className="text-sm text-gray-700">Hiển thị cho khách hàng</span>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={saving}>
              {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {saving ? "Đang lưu..." : editingId ? "Cập nhật Prompt" : "Thêm Prompt"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Hủy sửa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-0 pb-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold shrink-0">
              Danh sách Prompt{" "}
              <span className="font-normal text-gray-500">({filteredItems.length})</span>
            </CardTitle>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 shrink-0 whitespace-nowrap">Loại</span>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  {(
                    [
                      { v: "all" as const, label: "Tất cả" },
                      { v: "text" as const, label: "Văn bản" },
                      { v: "image" as const, label: "Ảnh" },
                      { v: "video" as const, label: "Video" },
                    ] satisfies { v: typeof kindFilter; label: string }[]
                  ).map(({ v, label }) => (
                    <button
                      key={v}
                      type="button"
                      className={cn(
                        "h-7 rounded-md px-2.5 font-medium transition-colors whitespace-nowrap",
                        kindFilter === v
                          ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                      onClick={() => setKindFilter(v)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-gray-500 shrink-0 whitespace-nowrap">Thể loại</span>
                <select
                  aria-label="Lọc theo thể loại"
                  className={cn(
                    "h-7 min-h-7 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs",
                    "text-gray-900 max-w-[200px] sm:max-w-[240px]",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  )}
                  value={categoryFilter === "all" ? "all" : categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">— Tất cả —</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-500">Đang tải...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-gray-500">Chưa có prompt nào.</div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
              <Table className="min-w-[1160px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[90px] min-w-[80px]">Loại</TableHead>
                    <TableHead className="w-[180px] min-w-[140px]">Thể loại</TableHead>
                    <TableHead className="w-[140px] min-w-[120px]">IDmei</TableHead>
                    <TableHead className="w-[220px] min-w-[160px]">Tiêu đề</TableHead>
                    <TableHead className="min-w-[280px]">Nội dung Prompt</TableHead>
                    <TableHead className="w-[100px] text-center">Thứ tự</TableHead>
                    <TableHead className="w-[130px]">Trạng thái</TableHead>
                    <TableHead className="w-[170px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge
                          variant={item.kind === "text" || !item.kind ? "secondary" : "default"}
                          className={cn(item.kind === "video" && "bg-cyan-700 hover:bg-cyan-700")}
                        >
                          {item.kind === "image" ? "Ảnh" : item.kind === "video" ? "Video" : "Text"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-gray-600 font-mono truncate max-w-[140px]" title={item.id_mei ?? undefined}>
                          {item.id_mei?.trim() ? item.id_mei : "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-800 font-medium line-clamp-2">
                          {item.title?.trim() ? item.title : "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                          {item.content}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.sort_order}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Hiển thị" : "Ẩn"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                            Sửa
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

