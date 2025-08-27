export interface Category {
    id: number;
    name: string;
    parent_id: number | null;
}

export interface Product {
    id: number;
    name: string;
    category: Category;
    description: string;
    price: number;
    original_price: number;
    image: string;
    color: string;
    badge: string;
    badge_color: string;
    in_stock: boolean | number;
    rating: number;
    reviews: number;
    warranty: string;
    sales: number;
    stock: number;
    status: 'active' | 'inactive';
    slug: string
}
