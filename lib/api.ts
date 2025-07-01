import { ProductBase } from './products';
import { Review } from '@/types/reviews.interface';
import { CartItem } from '@/types/cart.interface';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts(): Promise<ProductBase[]> {
    const res = await fetch(`${API_URL}/products`, {
        cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch products');

    return res.json();
}


export async function fetchProductById(id: number): Promise<ProductBase> {
    const res = await fetch(`${API_URL}/products/${id}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch product');
    }

    return res.json();
}


// Lấy tất cả review của 1 sản phẩm
export async function fetchReviews(productId: number): Promise<Review[]> {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
}

// Gửi review mới
export async function postReview(productId: number, data: Omit<Review, 'id' | 'date' | 'helpful'>): Promise<Review> {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to post review');
    }

    return res.json();
}

// Lấy giỏ hàng
export async function fetchCart(sessionId: string): Promise<CartItem[]> {
    const res = await fetch(`${API_URL}/cart`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi lấy giỏ hàng');
    }

    return res.json();
}


export async function addToCart(item: Partial<CartItem>, sessionId: string): Promise<CartItem> {
    const res = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Không thể thêm vào giỏ hàng');
    return res.json();
}


// Xoá item trong giỏ hàng
export async function deleteCartItem(id: number, sessionId: string): Promise<void> {
    const res = await fetch(`${API_URL}/cart/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể xoá sản phẩm');
    }
}

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
}) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Đăng ký thất bại');
    }

    return res.json();
}

export async function loginUser(data: {
    email: string;
    password: string;
}) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
    }

    return res.json(); // Trả về user + session_id
}

export async function logoutUser(sessionId: string) {
    const res = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Đăng xuất thất bại');
    }

    return res.json();
}