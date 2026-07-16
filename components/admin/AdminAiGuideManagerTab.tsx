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
import type { AiGuideFeatureAdmin, AiGuideSummary } from "@/types/ai-guide.interface";
import {
  createAdminAiGuide,
  deleteAdminAiGuide,
  fetchAdminAiGuides,
  resolveApiAssetUrl,
  updateAdminAiGuide,
  uploadAiGuideFeatureImage,
} from "@/lib/api";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Image as ImageIcon,
  Layers3,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

type FeatureForm = {
  id?: number;
  title: string;
  detail: string;
  bulletsText: string;
  image_urls: string[];
  sort_order: number;
  is_active: boolean;
};

type GuideFormState = {
  tool_id: string;
  name: string;
  subtitle: string;
  logo_url: string;
  sort_order: number;
  is_active: boolean;
  features: FeatureForm[];
};

const emptyFeature = (sort = 0): FeatureForm => ({
  title: "",
  detail: "",
  bulletsText: "",
  image_urls: [],
  sort_order: sort,
  is_active: true,
});

const emptyForm: GuideFormState = {
  tool_id: "",
  name: "",
  subtitle: "",
  logo_url: "",
  sort_order: 0,
  is_active: true,
  features: [emptyFeature(0)],
};

function bulletsToText(bullets?: string[]): string {
  return (bullets ?? []).join("\n");
}

function textToBullets(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function featureToForm(f: AiGuideFeatureAdmin, index: number): FeatureForm {
  const imageUrls = (f.image_urls ?? [])
    .map((url) => (url || "").trim())
    .filter(Boolean);
  const fallback = (f.image_url || "").trim();
  return {
    id: f.id,
    title: f.title,
    detail: f.detail ?? "",
    bulletsText: bulletsToText(f.bullets),
    image_urls: imageUrls.length > 0 ? imageUrls : fallback ? [fallback] : [],
    sort_order: f.sort_order ?? index,
    is_active: f.is_active !== false,
  };
}

function guideToForm(g: AiGuideSummary): GuideFormState {
  const features = (g.features ?? []).map(featureToForm);
  return {
    tool_id: g.tool_id,
    name: g.name,
    subtitle: g.subtitle ?? "",
    logo_url: g.logo_url ?? "",
    sort_order: g.sort_order ?? 0,
    is_active: g.is_active !== false,
    features: features.length > 0 ? features : [emptyFeature(0)],
  };
}

export default function AdminAiGuideManagerTab() {
  const { sessionId } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<AiGuideSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<GuideFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedFeatureIndex, setExpandedFeatureIndex] = useState<number | null>(null);
  const [imageUploadingIndex, setImageUploadingIndex] = useState<number | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const featureImageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pendingImageFeatureIndex = useRef<number | null>(null);

  const loadGuides = async (options?: { silent?: boolean }) => {
    if (!sessionId) return;
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    try {
      const res = await fetchAdminAiGuides(sessionId);
      setItems(res.data);
    } catch (e: unknown) {
      toast({
        title: "Không tải được hướng dẫn AI",
        description: e instanceof Error ? e.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) loadGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setExpandedFeatureIndex(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExpandedFeatureIndex(0);
    setDialogOpen(true);
  };

  const openEdit = (guide: AiGuideSummary) => {
    setEditingId(guide.id);
    setForm(guideToForm(guide));
    setExpandedFeatureIndex(null);
    setDialogOpen(true);
  };

  const updateFeature = (index: number, patch: Partial<FeatureForm>) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], ...patch };
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    const nextIndex = form.features.length;
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, emptyFeature(prev.features.length)],
    }));
    setExpandedFeatureIndex(nextIndex);
  };

  const removeFeature = (index: number) => {
    if (form.features.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      features: prev.features
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, sort_order: i })),
    }));
    setExpandedFeatureIndex((cur) => {
      if (cur == null) return null;
      if (cur === index) return null;
      if (cur > index) return cur - 1;
      return cur;
    });
  };

  const moveFeature = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= form.features.length) return;
    setForm((prev) => {
      const features = [...prev.features];
      [features[index], features[next]] = [features[next], features[index]];
      return {
        ...prev,
        features: features.map((f, i) => ({ ...f, sort_order: i })),
      };
    });
    setExpandedFeatureIndex((cur) => {
      if (cur === index) return next;
      if (cur === next) return index;
      return cur;
    });
  };

  const onPickFeatureImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const index = pendingImageFeatureIndex.current;
    if (files.length === 0 || !sessionId || index == null) return;

    setImageUploadingIndex(index);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const { url } = await uploadAiGuideFeatureImage(file, sessionId);
        uploaded.push(url);
      }
      setForm((prev) => {
        const features = [...prev.features];
        const current = features[index];
        const merged = Array.from(new Set([...current.image_urls, ...uploaded]));
        features[index] = { ...current, image_urls: merged };
        return { ...prev, features };
      });
      toast({
        title:
          uploaded.length > 1
            ? `Đã tải ${uploaded.length} ảnh minh họa lên`
            : "Đã tải ảnh minh họa lên",
      });
    } catch (err: unknown) {
      toast({
        title: "Upload thất bại",
        description:
          err instanceof Error ? err.message : "Vui lòng thử ảnh jpg/png/webp dưới 5MB.",
        variant: "destructive",
      });
    } finally {
      setImageUploadingIndex(null);
      pendingImageFeatureIndex.current = null;
    }
  };

  const removeFeatureImage = (featureIndex: number, imageIndex: number) => {
    setForm((prev) => {
      const features = [...prev.features];
      const current = features[featureIndex];
      features[featureIndex] = {
        ...current,
        image_urls: current.image_urls.filter((_, i) => i !== imageIndex),
      };
      return { ...prev, features };
    });
  };

  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !sessionId) return;

    setLogoUploading(true);
    try {
      const { url } = await uploadAiGuideFeatureImage(file, sessionId);
      setForm((p) => ({ ...p, logo_url: url }));
      toast({ title: "Đã tải logo lên" });
    } catch (err: unknown) {
      toast({
        title: "Upload logo thất bại",
        description:
          err instanceof Error ? err.message : "Vui lòng thử ảnh jpg/png/webp dưới 5MB.",
        variant: "destructive",
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const triggerFeatureImagePick = (index: number) => {
    pendingImageFeatureIndex.current = index;
    featureImageInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!sessionId) return;
    const name = form.name.trim();
    const toolId = form.tool_id.trim();
    if (!name || !toolId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn AI và nhập tên hiển thị.",
        variant: "destructive",
      });
      return;
    }

    const features = form.features
      .filter((f) => f.title.trim())
      .map((f, i) => ({
        id: f.id,
        title: f.title.trim(),
        detail: f.detail.trim() || null,
        bullets: textToBullets(f.bulletsText),
        image_urls: f.image_urls,
        image_url: f.image_urls[0] ?? null,
        sort_order: i,
        is_active: f.is_active,
      }));

    const nextSortOrder =
      editingId != null
        ? form.sort_order
        : items.length === 0
          ? 0
          : Math.max(...items.map((g) => Number(g.sort_order) || 0)) + 1;

    const payload = {
      tool_id: toolId,
      name,
      subtitle: form.subtitle.trim() || null,
      logo_url: form.logo_url.trim() || null,
      sort_order: nextSortOrder,
      is_active: form.is_active,
      features,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateAdminAiGuide(sessionId, editingId, payload);
        toast({ title: "Đã cập nhật hướng dẫn" });
      } else {
        await createAdminAiGuide(sessionId, payload);
        toast({ title: "Đã tạo hướng dẫn" });
      }
      closeDialog();
      await loadGuides({ silent: true });
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
    if (!window.confirm("Xóa hướng dẫn này và toàn bộ tính năng?")) return;
    try {
      await deleteAdminAiGuide(sessionId, id);
      toast({ title: "Đã xóa hướng dẫn" });
      if (editingId === id) closeDialog();
      await loadGuides({ silent: true });
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
            <Sparkles className="h-5 w-5 text-violet-600" />
            Hướng dẫn AI
          </CardTitle>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm hướng dẫn
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Đang tải…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
              <p className="mb-4 text-sm text-slate-500">Chưa có hướng dẫn AI nào.</p>
              <Button onClick={openCreate} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo hướng dẫn đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hướng dẫn</TableHead>
                    <TableHead>Tính năng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((guide) => (
                    <TableRow key={guide.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{guide.name}</div>
                        <div className="text-xs text-slate-500">/{guide.slug}</div>
                        <div className="mt-1 text-xs text-slate-400">tool: {guide.tool_id}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                          <Layers3 className="h-3 w-3" />
                          {guide.features?.length ?? guide.features_count ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {guide.is_active !== false ? (
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
                            onClick={() => openEdit(guide)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(guide.id)}
                          >
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
              <BookOpen className="h-5 w-5 text-violet-600" />
              {editingId ? "Sửa hướng dẫn AI" : "Thêm hướng dẫn AI"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guide-tool">AI công cụ *</Label>
                <Input
                  id="guide-tool"
                  value={form.tool_id}
                  onChange={(e) => setForm((p) => ({ ...p, tool_id: e.target.value }))}
                  placeholder="Ví dụ: chatgpt, gemini, grok"
                />
                <p className="text-xs text-slate-500">
                  Nhập mã AI (không dấu, viết thường). Nếu trùng danh sách có sẵn sẽ hiện logo tương ứng.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guide-name">Tên hiển thị *</Label>
                <Input
                  id="guide-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ví dụ: ChatGPT"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="guide-subtitle">Mô tả ngắn</Label>
                <Input
                  id="guide-subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Logo card</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                    className="hidden"
                    disabled={logoUploading || !sessionId}
                    onChange={onPickLogo}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    disabled={logoUploading || !sessionId}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    {logoUploading ? "Đang tải…" : "Chọn logo"}
                  </Button>
                  {form.logo_url.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm((p) => ({ ...p, logo_url: "" }))}
                    >
                      Xóa logo
                    </Button>
                  ) : null}
                </div>
                {form.logo_url.trim() ? (
                  <img
                    src={resolveApiAssetUrl(form.logo_url)}
                    alt=""
                    className="mt-2 h-16 w-16 rounded-xl border object-contain bg-white p-1"
                  />
                ) : (
                  <p className="text-xs text-slate-500">
                    Nếu không upload, trang công khai sẽ dùng logo theo mã AI (nếu có).
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  id="guide-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))}
                />
                <Label htmlFor="guide-active">Hiển thị trên trang công khai</Label>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Danh sách tính năng</h3>
                <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addFeature}>
                  <Plus className="h-3.5 w-3.5" />
                  Thêm tính năng
                </Button>
              </div>

              <input
                ref={featureImageInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                className="hidden"
                disabled={imageUploadingIndex != null || !sessionId}
                onChange={onPickFeatureImage}
              />

              {form.features.map((feature, index) => {
                const expanded = expandedFeatureIndex === index;
                return (
                  <div
                    key={feature.id ?? `new-${index}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left"
                      onClick={() =>
                        setExpandedFeatureIndex((cur) => (cur === index ? null : index))
                      }
                    >
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                      )}
                      <span className="flex-1 truncate text-sm font-medium text-slate-900">
                        {feature.title.trim() || `Tính năng ${index + 1}`}
                      </span>
                      {!feature.is_active && (
                        <Badge variant="secondary" className="shrink-0">
                          Ẩn
                        </Badge>
                      )}
                    </button>

                    {expanded && (
                      <div className="space-y-3 border-t border-slate-200 px-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Tiêu đề tính năng *</Label>
                            <Input
                              value={feature.title}
                              onChange={(e) => updateFeature(index, { title: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center gap-3 sm:col-span-2">
                            <Switch
                              checked={feature.is_active}
                              onCheckedChange={(checked) =>
                                updateFeature(index, { is_active: checked })
                              }
                            />
                            <Label>Hiển thị</Label>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Chi tiết</Label>
                            <Textarea
                              value={feature.detail}
                              onChange={(e) => updateFeature(index, { detail: e.target.value })}
                              rows={5}
                              placeholder="Nhấn Enter để xuống dòng. Dùng **từ khóa** để in đậm."
                            />
                            <p className="text-xs text-slate-500">
                              Ví dụ: Hãy mô tả **mục tiêu** và **kết quả mong muốn**.
                            </p>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Gợi ý (mỗi dòng một mục)</Label>
                            <Textarea
                              value={feature.bulletsText}
                              onChange={(e) =>
                                updateFeature(index, { bulletsText: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Ảnh minh họa</Label>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="gap-2"
                                disabled={imageUploadingIndex === index || !sessionId}
                                onClick={() => triggerFeatureImagePick(index)}
                              >
                                <ImageIcon className="h-4 w-4" />
                                {imageUploadingIndex === index ? "Đang tải…" : "Chọn ảnh"}
                              </Button>
                              {feature.image_urls.length > 0 ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateFeature(index, { image_urls: [] })}
                                >
                                  Xóa tất cả
                                </Button>
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-500">
                              Có thể chọn nhiều ảnh cùng lúc (mỗi ảnh tối đa 5MB).
                            </p>
                            {feature.image_urls.length > 0 ? (
                              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {feature.image_urls.map((url, imageIndex) => (
                                  <div
                                    key={`${url}-${imageIndex}`}
                                    className="group relative overflow-hidden rounded-lg border bg-white"
                                  >
                                    <img
                                      src={resolveApiAssetUrl(url)}
                                      alt=""
                                      className="h-28 w-full object-cover"
                                    />
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      className="absolute right-1 top-1 h-7 px-2 text-xs opacity-90"
                                      onClick={() => removeFeatureImage(index, imageIndex)}
                                    >
                                      Xóa
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 pt-1">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              disabled={index === 0}
                              onClick={() => moveFeature(index, -1)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              disabled={index === form.features.length - 1}
                              onClick={() => moveFeature(index, 1)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            disabled={form.features.length <= 1}
                            onClick={() => removeFeature(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa tính năng
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
              Hủy
            </Button>
            <Button type="button" className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu…" : editingId ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
