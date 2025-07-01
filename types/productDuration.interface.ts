export interface ProductDuration {
    id: number;
    product_id: number;
    name: string;
    price: number;
    original_price: number;
    featured: boolean | number; // có thể là `1/0` hoặc `true/false` tuỳ bạn xử lý
}
