"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, Category } from '@/types/product.interface';
import { updateProduct, fetchCategories, createProduct } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';


interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
}

// ✅ Dữ liệu mặc định
const defaultCategory: Category = {
  id: 0,
  name: '',
  parent_id: null,
};

const defaultProduct: Product = {
  id: Date.now(),
  name: '',
  category: defaultCategory,
  price: 0,
  original_price: 0,
  image: '',
  color: '',
  badge: '',
  badge_color: '',
  in_stock: true,
  rating: 5.0,
  reviews: 0,
  warranty: '',
  sales: 0,
  stock: 0,
  status: 'active',
  description: '',
};


export function EditProductDialog({ product, open, onOpenChange, onSave }: EditProductDialogProps) {
  const [formData, setFormData] = useState<Product>(product || defaultProduct);
  const { sessionId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  // Reset form data when product prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(
        product || {
          id: 0,
          name: '',
          category: defaultCategory,
          price: 0,
          original_price: 0,
          stock: 0,
          status: 'active',
          sales: 0,
          rating: 5.0,
          description: '',
          image: '',
          color: '',
          badge: '',
          badge_color: '',
          in_stock: true,
          reviews: 0,
          warranty: '',
        }
      );

      const loadCategories = async () => {
        try {
          if (!sessionId) throw new Error('Missing session');
          else {
            const result = await fetchCategories(sessionId);
            setCategories(result.data);
          }
        } catch (error) {
          console.error('Lỗi khi tải danh mục:', error);
        }
      };

      loadCategories();
    }
  }, [product, open]);

  const handleSave = async () => {
    try {
      if (!sessionId) throw new Error('Missing session token');

      const payload = {
        ...formData,
        category: formData.category.id, // Chỉ gửi category ID
      };

      if (!formData.id || formData.id === 0) {
        // Tạo sản phẩm mới (chỉ khi formData.id không có giá trị)
        const result = await createProduct(sessionId, payload);

        const newCategory = categories.find(c => c.id === result.category) || defaultCategory;

        const newProduct: Product = {
          id: result.id,
          name: result.name,
          category: newCategory,
          price: result.price,
          original_price: result.original_price, // Chuyển snake_case -> camelCase
          image: result.image,
          color: result.color,
          badge: result.badge,
          badge_color: result.badge_color,
          in_stock: result.in_stock === 1, // API trả boolean
          rating: result.rating,
          reviews: result.reviews,
          warranty: result.warranty,
          sales: result.sales,
          stock: result.stock,
          status: result.status,
          description: result.description,
        };

        onSave(newProduct); // Gọi hàm onSave với sản phẩm mới
      } else {
        // Cập nhật sản phẩm đã có
        const result = await updateProduct(sessionId, formData.id, payload);

        const updatedCategory = categories.find(c => c.id === result.category) || defaultCategory;

        const updatedProduct: Product = {
          id: result.id,
          name: result.name,
          category: updatedCategory,
          price: result.price,
          original_price: result.original_price, // Chuyển snake_case -> camelCase
          image: result.image,
          color: result.color,
          badge: result.badge,
          badge_color: result.badge_color,
          in_stock: result.in_stock === 1, // API trả boolean
          rating: result.rating,
          reviews: result.reviews,
          warranty: result.warranty,
          sales: result.sales,
          stock: result.stock,
          status: result.status,
          description: result.description,
        };

        onSave(updatedProduct); // Gọi hàm onSave với sản phẩm đã được cập nhật
      }

      onOpenChange(false); // Đóng dialog sau khi lưu
    } catch (err: any) {
      console.error('❌ Failed to update product:', err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Cập nhật thông tin sản phẩm' : 'Nhập thông tin để tạo sản phẩm mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Product Image */}
          {/* <div>
            <Label htmlFor="image">Ảnh sản phẩm (URL)</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/product-image.jpg"
            />
            {formData.image && (
              <div className="mt-2">
                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
          </div> */}

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
                if (selected) {
                  setFormData({ ...formData, category: selected });
                }
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
                onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) || 0 })}
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
                onValueChange={(value: 'active' | 'inactive') =>
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
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                placeholder="4.8"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Mô tả sản phẩm</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về sản phẩm..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            {product ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}