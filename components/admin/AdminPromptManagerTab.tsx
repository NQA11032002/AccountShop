"use client";

import { useEffect, useMemo, useState } from "react";
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
  updateAdminPrompt,
} from "@/lib/api";
import { Plus, Save, Trash2, BookText } from "lucide-react";

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
};

const emptyForm: PromptFormState = {
  category: "",
  title: "",
  content: "",
  is_active: true,
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

  const loadPrompts = async () => {
    if (!sessionId) return;
    setLoading(true);
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
      setLoading(false);
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
    if (categoryFilter === "all") return items;
    return items.filter((i) => i.category === categoryFilter);
  }, [items, categoryFilter]);

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

      if (editingId) {
        await updateAdminPrompt(sessionId, editingId, {
          category: cat,
          title: form.title.trim() || null,
          content: form.content.trim(),
          sort_order,
          is_active: form.is_active,
        });
        toast({ title: "Đã cập nhật prompt" });
      } else {
        await createAdminPrompt(sessionId, {
          category: cat,
          title: form.title.trim() || null,
          content: form.content.trim(),
          sort_order,
          is_active: form.is_active,
        });
        toast({ title: "Đã tạo prompt mới" });
      }
      await loadPrompts();
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
      await loadPrompts();
      if (editingId === id) resetForm();
    } catch (e: any) {
      toast({
        title: "Xóa thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Thể loại</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                placeholder="Ví dụ: Kinh doanh & Marketing"
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
                placeholder="Ví dụ: 1. Giao vai rõ ràng ngay từ đầu"
              />
              <p className="text-xs text-gray-500">
                Tách riêng với nội dung prompt; hiển thị trên trang khách và trong cột &quot;Tiêu đề&quot; bảng dưới.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Nội dung Prompt</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              placeholder="Nhập nội dung prompt..."
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Danh sách Prompt ({filteredItems.length})</span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={categoryFilter === "all" ? "default" : "outline"}
                onClick={() => setCategoryFilter("all")}
              >
                Tất cả
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? "default" : "outline"}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-500">Đang tải...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-gray-500">Chưa có prompt nào.</div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
              <Table className="min-w-[960px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[180px] min-w-[140px]">Thể loại</TableHead>
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
                        <Badge>{item.category}</Badge>
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

