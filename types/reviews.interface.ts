export interface Review {
    id: number;
    product_id: number;
    user_id: string
    user_name: string;
    user_avatar: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
}