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

type PromptFormState = {
  category: string;
  content: string;
  sort_order: number;
  is_active: boolean;
};

const emptyForm: PromptFormState = {
  category: "",
  content: "",
  sort_order: 0,
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item: PromptTemplateItem) => {
    setEditingId(item.id);
    setForm({
      category: item.category,
      content: item.content,
      sort_order: item.sort_order,
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
      if (editingId) {
        await updateAdminPrompt(sessionId, editingId, {
          category: form.category.trim(),
          content: form.content.trim(),
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active,
        });
        toast({ title: "Đã cập nhật prompt" });
      } else {
        await createAdminPrompt(sessionId, {
          category: form.category.trim(),
          content: form.content.trim(),
          sort_order: Number(form.sort_order) || 0,
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
              <Input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value) }))}
              />
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
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[240px]">Thể loại</TableHead>
                    <TableHead>Nội dung Prompt</TableHead>
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

