"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminDiscountCode {
  id?: number;
  code: string;
  description?: string;
  type: "fixed";
  value: number;
  min_amount?: number;
  max_discount?: number | null;
  expiry_date?: string | null;
  usage_limit?: number | null;
  is_active: boolean;
}

interface EditDiscountCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: AdminDiscountCode | null;
  onSave: (payload: AdminDiscountCode) => Promise<void> | void;
}

const defaultDiscount: AdminDiscountCode = {
  code: "",
  description: "",
  type: "fixed",
  value: 10000,
  min_amount: 0,
  max_discount: null,
  expiry_date: null,
  usage_limit: null,
  is_active: true,
};

export function EditDiscountCodeDialog({
  open,
  onOpenChange,
  code,
  onSave,
}: EditDiscountCodeDialogProps) {
  const [formData, setFormData] = useState<AdminDiscountCode>(defaultDiscount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (code) {
        // Chuẩn hoá ngày hết hạn về dạng YYYY-MM-DD để hiển thị đúng trên input[type="date"]
        const rawDate = code.expiry_date;
        const normalizedDate =
          rawDate && typeof rawDate === "string"
            ? rawDate.substring(0, 10)
            : null;

        setFormData({
          ...defaultDiscount,
          ...code,
          type: 'fixed',
          expiry_date: normalizedDate,
        });
      } else {
        setFormData(defaultDiscount);
      }
    }
  }, [open, code]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSave(formData);
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to save discount code", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {code ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
          </DialogTitle>
          <DialogDescription>
            {code
              ? "Cập nhật thông tin mã giảm giá"
              : "Nhập thông tin để tạo mã giảm giá mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Mã *
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              className="col-span-3"
              placeholder="WELCOME10"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Mô tả
            </Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="col-span-3"
              placeholder="Giảm 10% cho đơn hàng đầu tiên"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Loại</Label>
            <div className="col-span-3 rounded-md border px-3 py-2 text-sm bg-muted/50">Giảm tiền</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Giá trị (đ) *
            </Label>
            <Input
              id="value"
              type="number"
              min={1}
              value={formData.value}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  value: Number(e.target.value) || 0,
                }))
              }
              className="col-span-3"
              placeholder="20000"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min_amount" className="text-right">
              Đơn tối thiểu
            </Label>
            <Input
              id="min_amount"
              type="number"
              min={0}
              value={formData.min_amount ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  min_amount: Number(e.target.value) || 0,
                }))
              }
              className="col-span-3"
              placeholder="0"
            />
          </div>

          {false && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_discount" className="text-right">
                Giảm tối đa
              </Label>
              <Input
                id="max_discount"
                type="number"
                min={0}
                value={formData.max_discount ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_discount: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="col-span-3"
                placeholder="Ví dụ: 50000"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiry_date" className="text-right">
              Ngày hết hạn
            </Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expiry_date: e.target.value || null,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usage_limit" className="text-right">
              Số lần dùng
            </Label>
            <Input
              id="usage_limit"
              type="number"
              min={0}
              value={formData.usage_limit ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  usage_limit: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="col-span-3"
              placeholder="0 = không giới hạn"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trạng thái</Label>
            <Select
              value={formData.is_active ? "1" : "0"}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, is_active: v === "1" }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Đang hoạt động</SelectItem>
                <SelectItem value="0">Tạm tắt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {code ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

