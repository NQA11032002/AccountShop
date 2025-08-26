"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Product, Category } from "@/types/product.interface";
import { ProductDuration } from "@/types/productDuration.interface";

import { updateProduct, fetchCategories, createProduct } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

type ProductWithDurations = Product & { durations?: ProductDuration[] };
type FormState = Product & { durations: ProductDuration[] };

interface EditProductDialogProps {
  product: ProductWithDurations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
}

const defaultCategory: Category = { id: 0, name: "", parent_id: null };

const defaultForm: FormState = {
  id: Date.now(),
  name: "",
  category: defaultCategory,
  price: 0,
  original_price: 0,
  image: "",
  color: "",
  badge: "",
  badge_color: "",
  in_stock: true,
  rating: 5.0,
  reviews: 0,
  warranty: "",
  sales: 0,
  stock: 0,
  status: "active",
  description: "",
  durations: [],
};

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: EditProductDialogProps) {
  const { sessionId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const serverDurationIds = useRef<Set<number>>(new Set()); // 🔑 lưu ID duration từ server

  const [formData, setFormData] = useState<FormState>(() => {
    const durs = (product?.durations ?? []).map(normalizeDuration(product?.id));
    return product
      ? ({ ...(product as Product), durations: durs } as FormState)
      : defaultForm;
  });

  const prevOpen = useRef(open);
  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;

    if (open && !wasOpen) {
      // chỉ reset khi dialog vừa mở
      const rawDurs = product?.durations ?? [];
      serverDurationIds.current = new Set(
        rawDurs.filter((d) => !!d.id).map((d) => Number(d.id))
      );

      const durs = rawDurs.map(normalizeDuration(product?.id));
      setFormData(
        product
          ? ({ ...(product as Product), durations: durs } as FormState)
          : { ...defaultForm, id: 0 }
      );

      (async () => {
        try {
          const result = await fetchCategories();
          setCategories(result.data);
        } catch (error) {
          console.error("Lỗi khi tải danh mục:", error);
        }
      })();
    }
  }, [open, product]);

  function normalizeDuration(productId?: number) {
    return (d: ProductDuration): ProductDuration => ({
      id: d.id ?? Date.now(), // id tạm để render UI
      product_id: d.product_id ?? (productId ?? 0),
      name: d.name ?? "",
      price: Number(d.price ?? 0),
      original_price: Number(d.original_price ?? 0),
      featured: (d.featured as number) === 1 || d.featured === true ? 1 : 0,
    });
  }

  // ----- Durations UI -----
  const addDuration = () => {
    setFormData((prev) => ({
      ...prev,
      durations: [
        ...prev.durations,
        normalizeDuration(prev.id)({
          id: Date.now(), // chỉ dùng cho key UI, KHÔNG gửi lên backend
          product_id: prev.id || 0,
          name: "",
          price: 0,
          original_price: 0,
          featured: 0,
        }),
      ],
    }));
  };

  const removeDuration = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      durations: prev.durations.filter((_, i) => i !== index),
    }));
  };

  const changeDuration = (
    index: number,
    field: keyof ProductDuration,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      durations: prev.durations.map((d, i) =>
        i === index
          ? {
            ...d,
            [field]:
              field === "name"
                ? (value as string)
                : field === "featured"
                  ? (value ? 1 : 0)
                  : parseInt(value as string) || 0,
          }
          : d
      ),
    }));
  };

  // ----- SAVE -----
  const handleSave = async () => {
    try {
      if (!sessionId) throw new Error("Missing session token");

      // 👉 chỉ gửi id cho durations cũ (tồn tại trên server)
      const durationsPayload = formData.durations.map((d) => {
        const base = {
          name: d.name,
          price: Number(d.price) || 0,
          original_price: Number(d.original_price) || 0,
          featured: (d.featured as number) === 1 || d.featured === true ? 1 : 0,
        };
        const isServerItem = serverDurationIds.current.has(Number(d.id));
        return isServerItem ? { id: Number(d.id), ...base } : base;
      });

      const payload = {
        ...formData,
        category: formData.category.id, // chỉ gửi ID category
        durations: durationsPayload,    // 👈 đã lọc id phù hợp
      };

      if (!formData.id || formData.id === 0) {
        const result = await createProduct(sessionId, payload);

        const newCategory =
          categories.find((c) => c.id === result.category) || defaultCategory;

        const newProduct: Product = {
          id: result.id,
          name: result.name,
          category: newCategory,
          price: result.price,
          original_price: result.original_price,
          image: result.image,
          color: result.color,
          badge: result.badge,
          badge_color: result.badge_color,
          in_stock: result.in_stock === 1,
          rating: result.rating,
          reviews: result.reviews,
          warranty: result.warranty,
          sales: result.sales,
          stock: result.stock,
          status: result.status,
          description: result.description,
        };

        onSave(newProduct);
      } else {
        const result = await updateProduct(sessionId, formData.id, payload);

        const updatedCategory =
          categories.find((c) => c.id === result.category) || defaultCategory;

        const updatedProduct: Product = {
          id: result.id,
          name: result.name,
          category: updatedCategory,
          price: result.price,
          original_price: result.original_price,
          image: result.image,
          color: result.color,
          badge: result.badge,
          badge_color: result.badge_color,
          in_stock: result.in_stock === 1,
          rating: result.rating,
          reviews: result.reviews,
          warranty: result.warranty,
          sales: result.sales,
          stock: result.stock,
          status: result.status,
          description: result.description,
        };

        onSave(updatedProduct);
      }

      onOpenChange(false);
    } catch (err: any) {
      console.error("❌ Failed to update product:", err.message);
    }
  };

  // ----- UI -----
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {product ? "Cập nhật thông tin sản phẩm" : "Nhập thông tin để tạo sản phẩm mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Netflix Premium"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Danh mục *</Label>
            <Select
              value={formData.category.id.toString()}
              onValueChange={(value) => {
                const selected = categories.find((c) => c.id === parseInt(value));
                if (selected) setFormData({ ...formData, category: selected });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Durations dynamic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Thời hạn gói</Label>
              <Button type="button" variant="outline" onClick={addDuration}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm thời hạn
              </Button>
            </div>

            {formData.durations.map((d, i) => (
              <div key={d.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Label className="text-xs">Tên</Label>
                  <Input
                    placeholder="1 tháng, 3 tháng..."
                    value={d.name}
                    onChange={(e) => changeDuration(i, "name", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Giá bán</Label>
                  <Input
                    type="number"
                    placeholder="80000"
                    value={d.price}
                    onChange={(e) => changeDuration(i, "price", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Giá gốc</Label>
                  <Input
                    type="number"
                    placeholder="273000"
                    value={d.original_price}
                    onChange={(e) => changeDuration(i, "original_price", e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    id={`featured-${d.id}`}
                    type="checkbox"
                    checked={(d.featured as number) === 1 || d.featured === true}
                    onChange={(e) => changeDuration(i, "featured", e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <Label htmlFor={`featured-${d.id}`} className="text-xs">Hiển thị</Label>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeDuration(i)}
                    className="text-red-600 hover:bg-red-50"
                    aria-label="Xoá thời hạn"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Giá bán (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="89000"
                required
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Giá gốc (VNĐ) *</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.original_price}
                onChange={(e) =>
                  setFormData({ ...formData, original_price: parseInt(e.target.value) || 0 })
                }
                placeholder="260000"
                required
              />
            </div>
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Số lượng kho</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="50"
              />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sales & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sales">Số lượng đã bán</Label>
              <Input
                id="sales"
                type="number"
                value={formData.sales}
                onChange={(e) => setFormData({ ...formData, sales: parseInt(e.target.value) || 0 })}
                placeholder="1250"
              />
            </div>
            <div>
              <Label htmlFor="rating">Đánh giá (1-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })
                }
                placeholder="4.8"
              />
            </div>
          </div>

          {/* Description - SunEditor */}
          <div>
            <Label htmlFor="description">Mô tả sản phẩm</Label>
            <SunEditor
              key={`editor-${formData.id}`}
              name="description"
              defaultValue={formData.description}
              onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
              setOptions={{
                height: "500px",
                buttonList: [
                  ["formatBlock", "bold", "italic", "underline", "strike"],
                  ["list", "align", "fontColor", "hiliteColor"],
                  ["link", "image", "video"],
                ],
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            {product ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
