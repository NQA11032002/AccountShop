import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import data from '@/lib/data.json';
import { ProductBase } from '@/lib/products';
import { CartItem } from '@/types/cart.interface';
import { ProductDuration } from '@/types/productDuration.interface';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export function calculateSavings(originalPrice: number, price: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function normalizeDurationId(durationId: string): string {
  if (!durationId || typeof durationId !== 'string') {
    return '1m';
  }

  const normalized = durationId.toLowerCase().trim()
    .replace(/\s+/g, '')
    .replace(/month|months|tháng|thang/g, 'm')
    .replace(/year|years|năm|nam/g, 'y')
    .replace(/day|days|ngày|ngay/g, 'd')
    .replace(/week|weeks|tuần|tuan/g, 'w')
    .replace(/hour|hours|giờ|gio/g, 'h')
    .replace(/minute|minutes|phút|phut/g, 'min')
    .replace(/[^0-9mywdhmin]/g, '');

  if (normalized.match(/^\d+$/)) {
    return normalized + 'm';
  } else if (normalized.match(/^[mywdh]$/)) {
    return '1' + normalized;
  } else if (!normalized.match(/^\d+[mywdhmin]+$/)) {
    return '1m';
  }

  return normalized || '1m';
}

export async function fetchProductData(productId?: number): Promise<any[]> {
  try {
    const response = await fetch('/api/data?type=products');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch products');
    }

    const products = result.data || [];
    if (productId) {
      const product = products.find((p: any) => p.id === productId);
      return product ? [product] : [];
    }

    return products;
  } catch (error) {
    console.error('❌ Error fetching product data:', error);
    return [];
  }
}

export function validateCartItem(item: any): boolean {
  return !!(
    item &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    item.price >= 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.durationId === 'string'
  );
}

export function calculateCartTotal(items: any[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function calculateCartSavings(items: any[]): number {
  return items.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);
}

export function createCartItem(product: ProductBase, duration: ProductDuration, userId: number): CartItem {
  return {
    id: 0,
    user_id: userId,
    product_id: product.id,
    product_name: product.name,
    price: duration.price,
    original_price: duration.original_price || duration.price,
    quantity: 1,
    selected_duration: duration.id,
    duration: duration.name,
    image: product.image || '',
    color: product.color || '#3B82F6',
    description: product.description || '',
    warranty: product.warranty || '',
    added_at: new Date().toISOString(),
  };
}


export function getFeaturedDuration(durations: ProductDuration[]): ProductDuration {
  if (!durations || durations.length === 0) {
    return {
      id: 1,
      product_id: 0,
      name: '1 tháng',
      price: 0,
      original_price: 0,
      featured: false,
    };
  }

  const featured = durations.find((d) => d.featured === true || d.featured === 1);
  return featured || durations.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
}
