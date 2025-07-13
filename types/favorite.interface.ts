export interface FavoriteItem {
    id: number;
    product_id: number;
    name: string;
    price: number;
    original_price?: number;
    image?: string;
    rating?: number;
    description?: string;
    color?: string;
    duration?: string;
    selected_duration?: number;
    reviews?: number;
    added_at: string;
}
