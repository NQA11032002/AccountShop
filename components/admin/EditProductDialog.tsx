"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  sales: number;
  rating: number;
  description?: string;
  image?: string;
}

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
}

export function EditProductDialog({ product, open, onOpenChange, onSave }: EditProductDialogProps) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: Date.now(),
      name: '',
      category: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      status: 'active',
      sales: 0,
      rating: 5.0,
      description: '',
      image: ''
    }
  );

  console.log("EditProductDialog rendered", { productId: product?.id, open });

  // Reset form data when product prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(
        product || {
          id: Date.now(),
          name: '',
          category: '',
          price: 0,
          originalPrice: 0,
          stock: 0,
          status: 'active',
          sales: 0,
          rating: 5.0,
          description: '',
          image: ''
        }
      );
      console.log("Form data reset for product", product?.id);
    }
  }, [product, open]);

  const handleSave = () => {
    console.log("Saving product", formData);
    onSave(formData);
    onOpenChange(false);
  };

  const categories = [
    'Streaming', 'Music', 'AI Tools', 'Gaming', 'Software', 'VPN', 'Cloud Storage', 'Education'
  ];

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
          <div>
            <Label htmlFor="image">Ảnh sản phẩm (URL)</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="https://example.com/product-image.jpg"
            />
            {formData.image && (
              <div className="mt-2">
                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Netflix Premium"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Danh mục *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                placeholder="89000"
                required
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Giá gốc (VNĐ) *</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({...formData, originalPrice: parseInt(e.target.value) || 0})}
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
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                placeholder="50"
              />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'inactive') => 
                  setFormData({...formData, status: value})
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
                onChange={(e) => setFormData({...formData, sales: parseInt(e.target.value) || 0})}
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
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 5.0})}
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
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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