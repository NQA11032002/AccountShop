import { ProductBase } from './products';
import { Review } from '@/types/reviews.interface';
import { CartItem } from '@/types/cart.interface';
import type { RankingData } from '@/types/RankingData.interface';

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


export async function createOrder(orderData: any, sessionId: string): Promise<any> {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(orderData),
    });

    // if (!res.ok) {
    //     const errorBody = await res.json();
    //     throw new Error(errorBody.message || 'Tạo đơn hàng thất bại');
    // }

    return res.json(); // trả về { order_id, message }
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

    return res.json();
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

export async function updateUserCoins(coins: number, sessionId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update-coins`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ coins }),
    });

    const data = await res.json(); // ✅ chỉ gọi 1 lần

    if (!res.ok) {
        throw new Error(data.message || 'Cập nhật coins thất bại');
    }

    return data; // chứa message, coins_earned, total_coins nếu có
}

export async function clearCart(sessionId: string) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error('Không thể xoá giỏ hàng');
    }

    const data = await res.json();
    return data;
};

export const updateCartItemQuantity = async (cartId: number, quantity: number, sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${cartId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
        throw new Error('Không thể cập nhật số lượng');
    }

    return await res.json();
};

export const fetchOrders = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
            Authorization: `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) throw new Error('Không thể lấy danh sách đơn hàng');

    return await res.json();
};

export const getFavorites = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${sessionId}` },
    });
    return await res.json();
};

export const addFavorite = async (product_id: number, sessionId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ product_id: product_id }),
    });
};

export const removeFavorite = async (productId: number, sessionId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionId}` },
    });
};


export const fetchUserRankingData = async (sessionId: string): Promise<RankingData> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/ranking`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch user ranking data');
    }

    return res.json();
};

export const fetchRanks = async (spent: number, orders: number, sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ranks?spent=${spent}&orders=${orders}`, {
        headers: {
            Authorization: `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch ranks");
    }

    return res.json();
};

// lib/api.ts

export const fetchUserRewards = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-rewards`, {
        headers: {
            Authorization: `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch user rewards');
    }

    return res.json();
};

export const claimUserReward = async (rewardId: number, sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-rewards/claim/${rewardId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to claim reward');
    }

    return res.json();
};

export const fetchAdminUsers = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch admin users');
    }

    return res.json();  // trả về dữ liệu users từ API
};

export const addAdminUser = async (sessionId: string, userData: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add user');
    }

    return res.json(); // trả về dữ liệu người dùng vừa tạo
};

export const updateAdminUser = async (sessionId: string, userId: string, updatedData: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update user');
    }

    return res.json(); // trả về thông tin người dùng sau khi sửa
};

export const deleteAdminUser = async (sessionId: string, userId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete user');
    }

    return res.json(); // trả về thông báo xóa thành công
};
