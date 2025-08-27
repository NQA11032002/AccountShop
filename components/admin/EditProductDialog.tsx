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

import { updateProduct, fetchCategories, createProduct, uploadProductImage } from "@/lib/api";
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
  id: 0, // 0 => thêm mới
  name: "",
  category: defaultCategory,
  price: 0,
  original_price: 0,
  image: "", // DB chỉ lưu "filename.ext"
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
  slug: "",
};

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: EditProductDialogProps) {
  const { sessionId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const serverDurationIds = useRef<Set<number>>(new Set());

  // Upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // auto sync badge/badge_color/color
  function applyStatusBadge(status: "active" | "inactive") {
    const isActive = status === "active";
    return {
      status,
      badge: isActive ? "còn hàng" : "hết hàng",
      badge_color: isActive ? "bg-green-500" : "bg-red-500",
      color: "white",
    };
  }

  const [formData, setFormData] = useState<FormState>(() => {
    const durs = (product?.durations ?? []).map(normalizeDuration(product?.id));
    const base = product
      ? ({ ...(product as Product), durations: durs } as FormState)
      : defaultForm;

    return { ...base, ...applyStatusBadge(base.status as "active" | "inactive") };
  });

  // Helper to show preview for existing image filename
  const fileNameOnly = (p?: string) => (p || "").split("/").pop() || "";

  useEffect(() => {
    if (open) {
      const fn = fileNameOnly(product?.image || formData.image);
      if (fn) setImagePreview(`https://www.taikhoangpremium.shop//images/products/${fn}`);
      else setImagePreview("");
    }
  }, [open]); // eslint-disable-line

  const prevOpen = useRef(open);
  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;

    if (open && !wasOpen) {
      const rawDurs = product?.durations ?? [];
      serverDurationIds.current = new Set(
        rawDurs.filter((d) => !!d.id).map((d) => Number(d.id))
      );
      const durs = rawDurs.map(normalizeDuration(product?.id));

      const base = product
        ? ({ ...(product as Product), durations: durs } as FormState)
        : { ...defaultForm, id: 0 };

      const withStatusFields = {
        ...base,
        ...applyStatusBadge(base.status as "active" | "inactive"),
      };
      setFormData(withStatusFields);

      // reset upload states
      setImageFile(null);
      const fn = fileNameOnly(base.image);
      setImagePreview(fn ? `https://www.taikhoangpremium.shop/images/products/${fn}` : "");

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
      id: d.id ?? Date.now(),
      product_id: d.product_id ?? (productId ?? 0),
      name: d.name ?? "",
      price: Number(d.price ?? 0),
      original_price: Number(d.original_price ?? 0),
      featured: (d.featured as number) === 1 || d.featured === true ? 1 : 0,
    });
  }

  // ----- Upload handlers -----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const okTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!okTypes.includes(f.type)) {
      console.warn("File type not allowed:", f.type);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      console.warn("File too large (>5MB)");
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };


  // ----- Durations UI -----
  const addDuration = () => {
    setFormData((prev) => ({
      ...prev,
      durations: [
        ...prev.durations,
        normalizeDuration(prev.id)({
          id: Date.now(),
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

  // Trả về { filename, url } thay vì string

  // Upload nếu có, trả { filename, url }
  const uploadImageIfNeeded = async (): Promise<{ filename: string; url: string } | null> => {
    if (!imageFile || !sessionId) return null;
    const oldFilename = fileNameOnly(formData.image);
    const { filename, url } = await uploadProductImage(imageFile, sessionId, oldFilename);
    setImagePreview(url);
    return { filename, url };
  };


  // ----- SAVE -----
  const handleSave = async () => {
    try {
      if (!sessionId) throw new Error("Missing session token");

      // 1) upload ảnh (nếu có)
      const uploaded = await uploadImageIfNeeded(); // { filename, url } | null

      // 2) đồng bộ badge theo status
      const normalizedForm: FormState = {
        ...formData,
        ...applyStatusBadge(formData.status as "active" | "inactive"),
      };

      // 3) CHỈ LƯU FILENAME VÀO DB
      const currentFilename = fileNameOnly(normalizedForm.image);
      const imageName = uploaded?.filename ?? currentFilename; // <-- filename, không phải url

      // 4) build durations
      const durationsPayload = normalizedForm.durations.map((d) => {
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
        ...normalizedForm,
        image: imageName,                       // <-- DB chỉ lưu "tên.đuôi"
        category: normalizedForm.category.id,   // gửi ID
        durations: durationsPayload,
      };

      if (!normalizedForm.id || normalizedForm.id === 0) {
        const result = await createProduct(sessionId, payload);
        const newCategory = categories.find((c) => c.id === result.category) || defaultCategory;
        onSave({
          id: result.id,
          name: result.name,
          category: newCategory,
          price: result.price,
          original_price: result.original_price,
          image: result.image,   // BE trả filename
          color: result.color,
          badge: result.badge,
          badge_color: result.badge_color,
          in_stock: result.in_stock === 1 || result.in_stock === true,
          rating: result.rating,
          reviews: result.reviews,
          warranty: result.warranty,
          sales: result.sales,
          stock: result.stock,
          status: result.status,
          description: result.description,
          slug: result.slug,
        });
      } else {
        const result = await updateProduct(sessionId, normalizedForm.id, payload);
        const updatedCategory = categories.find((c) => c.id === result.category) || defaultCategory;
        onSave({
          id: result.id,
          name: result.name,
          category: updatedCategory,
          price: result.price,
          original_price: result.original_price,
          image: result.image,   // filename
          color: result.color,
          badge: result.badge,
          badge_color: result.badge_color,
          in_stock: result.in_stock === 1 || result.in_stock === true,
          rating: result.rating,
          reviews: result.reviews,
          warranty: result.warranty,
          sales: result.sales,
          stock: result.stock,
          status: result.status,
          description: result.description,
          slug: result.slug,
        });
      }

      onOpenChange(false);
    } catch (err: any) {
      console.error("❌ Failed to save product:", err?.message || err);
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
              placeholder="Tên sản phẩm"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="netflix, chat-gpt, office365..."
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Ảnh sản phẩm</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="preview"
                    src={imagePreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ PNG, JPG, JPEG, WEBP, GIF (tối đa 5MB). Lưu tại <code>public/images/products</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Danh mục *</Label>
            <Select
              value={formData.category.id?.toString() || "0"}
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

          {/* Durations */}
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
                  <Label htmlFor={`featured-${d.id}`} className="text-xs">
                    Hiển thị
                  </Label>
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
                  setFormData((prev) => ({ ...prev, ...applyStatusBadge(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
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

          {/* Description */}
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
