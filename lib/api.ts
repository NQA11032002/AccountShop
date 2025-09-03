import { ProductBase } from './products';
import { Review } from '@/types/reviews.interface';
import { CartItem } from '@/types/cart.interface';
import type { RankingData } from '@/types/RankingData.interface';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


interface Order {
    id: string;
    userId: string;
    userEmail: string;
    customerName?: string;
    products: { name: string; quantity: number; price: number }[];
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    paymentMethod: string;
    createdAt: string;
    completedAt?: string;
    discount?: number;
    originalTotal?: number;
}

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

// lib/api.ts
type UploadImageResult = { filename: string; url: string };


function extractJson(raw: string) {
    // Tước mọi rác HTML/Notice trước/sau JSON
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) {
        throw new Error(`Upload response is not JSON: ${raw.slice(0, 200)}`);
    }
    const jsonStr = raw.slice(start, end + 1);
    return JSON.parse(jsonStr);
}


export async function uploadProductImage(
    file: File,
    sessionId: string,
    oldFilename?: string
): Promise<UploadImageResult> {
    const fd = new FormData();
    fd.append("image", file, file.name); // BE validate key "image"
    if (oldFilename) fd.append("old", oldFilename);

    const res = await fetch(`${API_URL}/admin/upload-product-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionId}` },
        body: fd, // KHÔNG set Content-Type khi dùng FormData
        cache: "no-store",
    });

    const raw = await res.text();
    // Nếu HTTP fail -> ném lỗi kèm raw
    if (!res.ok) throw new Error(`Upload failed (${res.status}): ${raw.slice(0, 200)}`);

    let data: any;
    try {
        data = extractJson(raw);
    } catch (e: any) {
        throw new Error(e?.message || "Upload response is not JSON");
    }

    // Laravel của bạn có thể chỉ trả filename; tự suy url nếu thiếu
    if (!data?.success || !data?.filename) {
        const msg = data?.message || data?.errors?.image?.[0] || "Upload image failed";
        throw new Error(msg);
    }

    const filename = String(data.filename);
    const url = data.url || `/images/products/${filename}`;

    return { filename, url };
}


/** Helper: từ tên file trong DB -> URL để hiển thị ảnh */
export function imageFilenameToUrl(filename?: string | null): string {
    if (!filename) return '';
    return `/images/products/${filename}`;
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

export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    // Đọc dữ liệu response
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
    }

    return data; // Trả data gốc cho hàm gọi xử lý tiếp
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

export const fetchAllTransactions = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/transactions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch transactions');
    }

    return res.json(); // Trả về danh sách giao dịch ví
};

export const fetchTransactionById = async (sessionId: string, transactionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch transaction');
    }

    return res.json(); // Trả về thông tin giao dịch ví
};

export const fetchTransactionUserById = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch transaction');
    }

    return res.json(); // Trả về thông tin giao dịch ví
};

export const createTransaction = async (sessionId: string, transactionData: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/transactions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create transaction');
    }

    return res.json(); // Trả về thông báo thành công và thông tin giao dịch đã tạo
};

export const updateTransactionStatus = async (sessionId: string, transactionId: string, status: 'pending' | 'approved' | 'rejected') => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }) // Chỉ gửi status cập nhật
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update transaction status');
    }

    return res.json();  // Trả về thông tin giao dịch đã được cập nhật
};

export const deleteTransaction = async (sessionId: string, transactionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete transaction');
    }

    return res.json(); // Trả về thông báo xóa thành công
};


export const getProductsAdmin = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
        headers: {
            'Authorization': `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }

    return res.json();
};


export const getProduct = async (sessionId: string, productId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`, {
        headers: {
            'Authorization': `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch product');
    }

    return res.json();
};

export const createProduct = async (sessionId: string, productData: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create product');
    }

    return res.json();
};


export const updateProduct = async (sessionId: string, productId: number, updatedData: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update product');
    }

    return res.json();
};

export const deleteProduct = async (sessionId: string, productId: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
    }

    return res.json();
};

export const fetchCategories = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch categories');
    }

    return res.json();
};

export const getOnetimeCode = async (emailAccount: string, emailUser: string) => {
    const query = new URLSearchParams({
        emailAccount,
        emailUser
    }).toString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/otp/get?${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch onetimecode');
    }

    return res.json();
};


export const checkRole = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch role');
    }

    return res.json(); // trả về { role, is_admin, ... }
};

export const getUserCoins = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/coins`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch user coins');
    }

    return res.json(); // trả về { coins: number }
};

export const checkDepositStatus = async (orderId: string, sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/check-deposit-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ order_id: orderId }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to check deposit status');
    }

    return res.json(); // trả về { status, coins, updated_at }
};

type SortBy = 'created_at' | 'total' | 'id';
type SortDir = 'asc' | 'desc';
type AdminOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// ===================== Admin Orders APIs (typed) =====================
// ---- helpers ----
async function parseOrThrow<T = any>(res: Response): Promise<T> {
    let data: any = null;
    try { data = await res.json(); } catch { /* ignore */ }
    if (!res.ok) {
        const msg = data?.message || 'Request failed';
        throw new Error(msg);
    }
    return data as T;
}

interface FetchAdminOrdersParams {
    includeProducts?: boolean;   // default true
    status?: AdminOrderStatus | 'all';
    q?: string;
    date_from?: string;          // YYYY-MM-DD
    date_to?: string;            // YYYY-MM-DD
    sort_by?: SortBy;            // default created_at
    sort_dir?: SortDir;          // default desc
    page?: number;               // default 1
    per_page?: number;           // default 20
}


// GET /api/admin/orders
export async function fetchAdminOrdersData(
    sessionId: string,
    params: FetchAdminOrdersParams = {}
) {
    const qs = new URLSearchParams({
        includeProducts: String(params.includeProducts ?? true),
        ...(params.status ? { status: params.status } : {}),
        ...(params.q ? { q: params.q } : {}),
        ...(params.date_from ? { date_from: params.date_from } : {}),
        ...(params.date_to ? { date_to: params.date_to } : {}),
        ...(params.sort_by ? { sort_by: params.sort_by } : {}),
        ...(params.sort_dir ? { sort_dir: params.sort_dir } : {}),
        ...(params.page ? { page: String(params.page) } : {}),
        ...(params.per_page ? { per_page: String(params.per_page) } : {}),
    }).toString();

    const res = await fetch(`${API_URL}/admin/orders?${qs}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });

    return res.json();
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export const updateStatusOrder = async (
    sessionId: string,
    orderId: string,
    status: OrderStatus
) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        // Laravel validate expects an object: { status: "..." }
        body: JSON.stringify({ status }),
    });

    // cố gắng parse JSON cho cả success và error
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg =
            data?.message ||
            (data?.errors ? Object.values(data.errors).flat().join(' ') : '') ||
            'Failed to update order';
        throw new Error(msg);
    }

    return data; // { success, data, message? } theo response của bạn
};

// Xoá item trong giỏ hàng
export async function deleteOrder(id: number, sessionId: string): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể xoá order');
    }
}