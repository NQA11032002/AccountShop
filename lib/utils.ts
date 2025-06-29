import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import data from '@/lib/data.json';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Product data types and utilities
export interface ProductDuration {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  featured?: boolean;
}

export interface ProductBase {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  color?: string;
  rating: number;
  reviews: number;
  warranty: string;
  features: string[];
  inStock: boolean;
  badge?: string;
  badgeColor?: string;
  durations: ProductDuration[];
}

export interface CartItemData {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  durationId: string;
  image: string;
  color: string;
  description: string;
  warranty: string;
}

// Enhanced product data set
export const PRODUCTS: ProductBase[] = data.products;
// export const PRODUCTS: ProductBase[] = [
//   {
//     id: 1,
//     name: "Netflix Premium",
//     category: "Streaming",
//     description: "4K Ultra HD, 4 thiết bị cùng lúc, thư viện phim khổng lồ",
//     image: "🎬",
//     color: "#E50914",
//     rating: 4.9,
//     reviews: 1240,
//     warranty: "Bảo hành 30 ngày",
//     features: ["4K Ultra HD", "4 màn hình", "Tải offline", "Không quảng cáo"],
//     inStock: true,
//     badge: "Bán chạy",
//     badgeColor: "bg-red-500",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 50000, originalPrice: 80000, featured: true },
//       { id: "3m", name: "3 tháng", price: 140000, originalPrice: 240000 },
//       { id: "6m", name: "6 tháng", price: 270000, originalPrice: 480000 },
//       { id: "12m", name: "12 tháng", price: 500000, originalPrice: 960000 }
//     ]
//   },
//   {
//     id: 2,
//     name: "Spotify Premium",
//     category: "Music",
//     description: "Nghe nhạc không giới hạn, không quảng cáo, chất lượng cao",
//     image: "🎵",
//     color: "#1DB954",
//     rating: 4.8,
//     reviews: 856,
//     warranty: "Bảo hành 30 ngày",
//     features: ["Không quảng cáo", "Chất lượng cao", "Tải offline", "Playlist riêng"],
//     inStock: true,
//     badge: "Hot Deal",
//     badgeColor: "bg-green-500",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 30000, originalPrice: 50000, featured: true },
//       { id: "3m", name: "3 tháng", price: 85000, originalPrice: 150000 },
//       { id: "6m", name: "6 tháng", price: 160000, originalPrice: 300000 },
//       { id: "12m", name: "12 tháng", price: 300000, originalPrice: 600000 }
//     ]
//   },
//   {
//     id: 3,
//     name: "ChatGPT Plus",
//     category: "AI Tools",
//     description: "GPT-4, ưu tiên truy cập, plugin mới nhất và tốc độ phản hồi nhanh hơn",
//     image: "🤖",
//     color: "#412991",
//     rating: 4.9,
//     reviews: 634,
//     warranty: "Bảo hành 30 ngày",
//     features: ["GPT-4 Unlimited", "Plugin mới", "Ưu tiên truy cập", "Nhanh hơn"],
//     inStock: true,
//     badge: "Mới nhất",
//     badgeColor: "bg-purple-500",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 120000, originalPrice: 180000, featured: true },
//       { id: "3m", name: "3 tháng", price: 340000, originalPrice: 540000 },
//       { id: "6m", name: "6 tháng", price: 650000, originalPrice: 1080000 },
//       { id: "12m", name: "12 tháng", price: 1200000, originalPrice: 2160000 }
//     ]
//   },
//   {
//     id: 4,
//     name: "YouTube Premium",
//     category: "Streaming",
//     description: "Xem video không quảng cáo, YouTube Music included và phát nền",
//     image: "📺",
//     color: "#FF0000",
//     rating: 4.7,
//     reviews: 923,
//     warranty: "Bảo hành 30 ngày",
//     features: ["Không quảng cáo", "YouTube Music", "Phát nền", "Tải offline"],
//     inStock: true,
//     badge: "Ưu đãi",
//     badgeColor: "bg-orange-500",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 40000, originalPrice: 60000, featured: true },
//       { id: "3m", name: "3 tháng", price: 110000, originalPrice: 180000 },
//       { id: "6m", name: "6 tháng", price: 210000, originalPrice: 360000 },
//       { id: "12m", name: "12 tháng", price: 400000, originalPrice: 720000 }
//     ]
//   },
//   {
//     id: 5,
//     name: "Canva Pro",
//     category: "Design",
//     description: "Thiết kế chuyên nghiệp, template premium unlimited và Magic Resize",
//     image: "🎨",
//     color: "#00C4CC",
//     rating: 4.8,
//     reviews: 445,
//     warranty: "Bảo hành 30 ngày",
//     features: ["Template premium", "Xóa phông", "Magic Resize", "Brand Kit"],
//     inStock: true,
//     badge: "Xu hướng",
//     badgeColor: "bg-blue-500",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 60000, originalPrice: 90000, featured: true },
//       { id: "3m", name: "3 tháng", price: 170000, originalPrice: 270000 },
//       { id: "6m", name: "6 tháng", price: 320000, originalPrice: 540000 },
//       { id: "12m", name: "12 tháng", price: 600000, originalPrice: 1080000 }
//     ]
//   },
//   {
//     id: 6,
//     name: "Adobe Creative Suite",
//     category: "Design",
//     description: "Photoshop, Illustrator, Premiere Pro - Full package cho nhà thiết kế",
//     image: "🎭",
//     color: "#DA1F26",
//     rating: 4.9,
//     reviews: 327,
//     warranty: "Bảo hành 30 ngày",
//     features: ["Tất cả ứng dụng", "Cloud storage", "Font premium", "Stock photos"],
//     inStock: true,
//     badge: "Pro",
//     badgeColor: "bg-indigo-600",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 200000, originalPrice: 300000, featured: true },
//       { id: "3m", name: "3 tháng", price: 570000, originalPrice: 900000 },
//       { id: "6m", name: "6 tháng", price: 1100000, originalPrice: 1800000 },
//       { id: "12m", name: "12 tháng", price: 2000000, originalPrice: 3600000 }
//     ]
//   },
//   {
//     id: 7,
//     name: "1Password Premium",
//     category: "Productivity",
//     description: "Quản lý mật khẩu an toàn, đồng bộ đa thiết bị và bảo mật tối đa",
//     image: "🔐",
//     color: "#0F62FE",
//     rating: 4.7,
//     reviews: 289,
//     warranty: "Bảo hành 30 ngày",
//     features: ["Unlimited passwords", "Secure sharing", "Travel Mode", "2FA"],
//     inStock: true,
//     badge: "Bảo mật",
//     badgeColor: "bg-gray-600",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 45000, originalPrice: 70000, featured: true },
//       { id: "3m", name: "3 tháng", price: 130000, originalPrice: 210000 },
//       { id: "6m", name: "6 tháng", price: 250000, originalPrice: 420000 },
//       { id: "12m", name: "12 tháng", price: 450000, originalPrice: 840000 }
//     ]
//   },
//   {
//     id: 8,
//     name: "Grammarly Premium",
//     category: "Productivity",
//     description: "Kiểm tra ngữ pháp AI, viết văn chuyên nghiệp và tone detection",
//     image: "✍️",
//     color: "#15C39A",
//     rating: 4.6,
//     reviews: 412,
//     warranty: "Bảo hành 30 ngày",
//     features: ["AI Grammar Check", "Tone Detection", "Plagiarism Check", "Style Guide"],
//     inStock: false,
//     badge: "Tiện ích",
//     badgeColor: "bg-emerald-500",
//     durations: [
//       { id: "1m", name: "1 tháng", price: 55000, originalPrice: 85000, featured: true },
//       { id: "3m", name: "3 tháng", price: 155000, originalPrice: 255000 },
//       { id: "6m", name: "6 tháng", price: 300000, originalPrice: 510000 },
//       { id: "12m", name: "12 tháng", price: 550000, originalPrice: 1020000 }
//     ]
//   }
// ];

// Utility functions for products

export function getProductById(id: number): ProductBase | undefined {
  return PRODUCTS.find(product => product.id === id);
}

export function getFeaturedDuration(product: ProductBase | any): ProductDuration {
  // Handle products from admin sync or static products without durations array
  if (!product.durations || product.durations.length === 0) {
    // Create a default duration object from the product's price data
    return {
      id: '1month',
      name: product.duration || '1 tháng',
      price: product.price || 0,
      originalPrice: product.originalPrice,
      featured: true
    };
  }

  // Handle standard ProductBase with durations array
  return product.durations.find(d => d.featured) || product.durations[0];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export function calculateSavings(originalPrice: number, price: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// Normalize duration ID to standard format to prevent duplicates
export function normalizeDurationId(durationId: string): string {
  if (!durationId || typeof durationId !== 'string') {
    return '1m';
  }

  const normalized = durationId.toLowerCase().trim()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/month|months|tháng|thang/g, 'm')
    .replace(/year|years|năm|nam/g, 'y')
    .replace(/day|days|ngày|ngay/g, 'd')
    .replace(/week|weeks|tuần|tuan/g, 'w')
    .replace(/hour|hours|giờ|gio/g, 'h')
    .replace(/minute|minutes|phút|phut/g, 'min')
    .replace(/[^0-9mywdhmin]/g, ''); // Remove any other characters

  // Handle edge cases
  if (normalized.match(/^\d+$/)) {
    return normalized + 'm'; // Default to months
  } else if (normalized.match(/^[mywdh]$/)) {
    return '1' + normalized; // Default to 1
  } else if (!normalized.match(/^\d+[mywdhmin]+$/)) {
    return '1m'; // Default fallback
  }

  console.log(`🔄 Duration ID normalized: "${durationId}" → "${normalized}"`);
  return normalized || '1m';
}

// Enhanced product data fetching utility
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

// Cart item validation utility
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

// Cart total calculation utilities
export function calculateCartTotal(items: any[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function calculateCartSavings(items: any[]): number {
  return items.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);
}

export function createCartItem(product: ProductBase, duration: ProductDuration): CartItemData {
  const normalizedDurationId = normalizeDurationId(duration.id);

  return {
    id: product.id,
    name: product.name,
    price: duration.price,
    originalPrice: duration.originalPrice || duration.price,
    duration: duration.name,
    durationId: normalizedDurationId, // Use normalized durationId
    image: product.image,
    color: product.color || '#3B82F6',
    description: product.description,
    warranty: product.warranty
  };
}
