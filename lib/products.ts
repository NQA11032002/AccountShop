import { useEffect, useState } from 'react';
import { fetchProducts } from './api';
import { ProductDuration } from '@/types/productDuration.interface';
import { Category } from '@/types/product.interface';

export interface ProductBase {
    id: number;
    name: string;
    category: Category;
    description: string;
    price: number;
    original_price: number;
    image: string;
    color?: string;
    badge?: string;
    badge_color?: string;
    in_stock: boolean;
    features: string[];
    rating: number;
    reviews: number;
    warranty: string;
    sales: number;
    stock: number;
    status: string;

    // bổ sung nếu có durations (dữ liệu quan hệ)
    durations?: ProductDuration[];
}

// export interface ProductDuration {
//     id: number;
//     product_id: number;
//     name: string;
//     price: number;
//     originalPrice?: number;
//     featured?: boolean;
// }


export function useProducts() {
    const [products, setProducts] = useState<ProductBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    return { products, loading, error };
}