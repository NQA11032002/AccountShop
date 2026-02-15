import { ProductBase } from './products';
import { Review } from '@/types/reviews.interface';
import { CartItem } from '@/types/cart.interface';
import type { RankingData } from '@/types/RankingData.interface';
import type { userOnetimecode, Onetimecode } from '@/types/Onetimecode';
import type { ChatgptPayload } from '@/types/chatgpt.interface';

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

export interface ProductsMeta {
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
}

export interface FetchProductsPaginatedResponse {
    data: ProductBase[];
    meta: ProductsMeta;
}

export async function fetchProductsPaginated(params: {
    page: number;
    perPage?: number;
    categoryId?: number | 'all';
    search?: string;
}): Promise<FetchProductsPaginatedResponse> {
    const { page, perPage = 12, categoryId, search } = params;
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('per_page', String(perPage));
    if (categoryId !== undefined && categoryId !== 'all') {
        qs.set('category_id', String(categoryId));
    }
    if (search?.trim()) {
        qs.set('search', search.trim());
    }
    const res = await fetch(`${API_URL}/products?${qs.toString()}`, {
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

interface UserOrdersMeta {
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
}

interface UserOrdersStatistics {
    totalOrders: number;
    totalSpent: number;
    totalOrderCompleted: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
    totalOrderProducts: number;
}

export interface FetchUserOrdersResponse {
    orders: any[];
    statistics: UserOrdersStatistics;
    meta: UserOrdersMeta;
}

export const fetchOrders = async (
    sessionId: string,
    page: number = 1,
    perPage: number = 10
): Promise<FetchUserOrdersResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
    }).toString();

    const res = await fetch(`${API_URL}/orders?${params}`, {
        headers: {
            Authorization: `Bearer ${sessionId}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) throw new Error('Không thể lấy danh sách đơn hàng');

    return await res.json();
};

/** GET /api/my-accounts - Danh sách tài khoản đã mua của khách (đã giao, gắn đơn hàng) */
export const fetchMyAccounts = async (sessionId: string): Promise<{ success: boolean; data: any[] }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-accounts`, {
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Không thể tải tài khoản của bạn');
    return res.json();
};

/** POST /api/my-accounts/{id}/renew - Gia hạn tài khoản (trừ coin, gia hạn expiry). Trả 402 nếu không đủ coin. */
export const renewAccount = async (
    sessionId: string,
    accountId: number
): Promise<{ success: boolean; message?: string; new_coins?: number; expiry_date?: string }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-accounts/${accountId}/renew`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 402) {
        const err = new Error(data?.message || 'Số dư không đủ') as Error & { status: number };
        err.status = 402;
        throw err;
    }
    if (!res.ok) throw new Error(data?.message || 'Gia hạn thất bại');
    return data;
};

/** POST /api/renewal-requests - Gửi yêu cầu gia hạn tài khoản */
export const createRenewalRequest = async (
    sessionId: string,
    payload: { account_id: number; note?: string }
): Promise<{ success: boolean; message?: string; data?: any }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/renewal-requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Không thể gửi yêu cầu gia hạn');
    return data;
};

/** GET /api/renewal-requests - Danh sách yêu cầu gia hạn của tôi */
export const getMyRenewalRequests = async (sessionId: string): Promise<{ success: boolean; data: any[] }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/renewal-requests`, {
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Không thể tải yêu cầu gia hạn');
    return res.json();
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
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        // Thử đọc JSON lỗi, nếu không được thì log text thuần
        let errorText = 'Failed to fetch user ranking data';
        try {
            const errJson = await res.json();
            errorText = errJson?.message || errorText;
        } catch {
            try {
                const text = await res.text();
                console.error('Ranking API error (non‑JSON):', text.slice(0, 300));
            } catch {
                // ignore
            }
        }
        throw new Error(errorText);
    }

    // Đảm bảo chỉ parse JSON khi thực sự là JSON
    try {
        return await res.json();
    } catch (e) {
        const text = await res.text().catch(() => '');
        console.error('Ranking API returned invalid JSON:', text.slice(0, 300));
        throw new Error('Server trả về dữ liệu xếp hạng không hợp lệ');
    }
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

/** Danh sách voucher của khách (kho voucher) */
export interface CustomerVoucherItem {
    id: number;
    code: string;
    title: string | null;
    type: 'percentage' | 'fixed';
    value: number;
    min_amount: number;
    max_discount: number | null;
    expires_at: string | null;
    source: string;
    used_at: string | null;
    order_id: number | null;
    created_at: string;
    is_used: boolean;
    is_valid: boolean;
}

export const getMyVouchers = async (
    sessionId: string,
    params?: { status?: 'all' | 'available' | 'used' | 'expired' }
): Promise<{ data: CustomerVoucherItem[] }> => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/user/vouchers${qs.toString() ? '?' + qs.toString() : ''}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            Accept: 'application/json',
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể tải voucher');
    }
    return res.json();
};

/** Cập nhật điểm hạng khi đơn hàng thanh toán thành công (mua hàng tăng điểm) */
export const updateCustomerRankingOnOrder = async (
    sessionId: string,
    orderId: number,
    orderTotal: number,
    itemCount: number
) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/ranking/update`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId,
            order_total: orderTotal,
            item_count: itemCount,
        }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Không thể cập nhật điểm hạng');
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

export const fetchAdminUsers = async (
    sessionId: string,
    page: number = 1,
    perPage: number = 20,
    sortBy: string = 'join_date',
    sortOrder: string = 'desc'
) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (sortBy) params.set('sort_by', sortBy);
    if (sortOrder) params.set('sort_order', sortOrder);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params.toString()}`, {
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

export const fetchAllTransactions = async (
    sessionId: string,
    page: number = 1,
    perPage: number = 20
) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/transactions?page=${page}&per_page=${perPage}`, {
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
    if (!API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to .env.local (e.g. NEXT_PUBLIC_API_URL=http://localhost:8000/api).');
    }
    const res = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
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

/** GET /api/admin/orders/revenue-by-month — doanh thu 6 tháng gần đây từ DB */
export async function fetchAdminRevenueByMonth(
    sessionId: string,
    months: number = 6
): Promise<{ success: boolean; data: { year: number; month: number; month_label: string; revenue: number; orders_count: number }[] }> {
    const res = await fetch(`${API_URL}/admin/orders/revenue-by-month?months=${months}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Không lấy được doanh thu theo tháng');
    return data;
}

/** GET /api/admin/orders/top-selling-products — sản phẩm bán chạy từ DB */
export async function fetchAdminTopSellingProducts(
    sessionId: string,
    limit: number = 5
): Promise<{ success: boolean; data: { product_id: number; name: string; category_name: string; sales: number; rating: number }[] }> {
    const res = await fetch(`${API_URL}/admin/orders/top-selling-products?limit=${limit}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Không lấy được sản phẩm bán chạy');
    return data;
}

/** GET /api/admin/statistics/traffic — thống kê truy cập (phiên đăng nhập + đơn hàng theo ngày) */
export async function fetchAdminTrafficStats(
    sessionId: string,
    days: number = 7
): Promise<{
    success: boolean;
    data: {
        by_day: { date: string; day_label: string; visitors: number; page_views: number }[];
        today_visitors: number;
        today_page_views: number;
        completion_rate: number;
    };
}> {
    const res = await fetch(`${API_URL}/admin/statistics/traffic?days=${days}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Không lấy được thống kê truy cập');
    return data;
}

/** GET /api/admin/statistics/revenue-comparison — so sánh doanh thu tháng trước / tháng này / dự báo */
export async function fetchAdminRevenueComparison(sessionId: string): Promise<{
    success: boolean;
    data: { name: string; label: string; value: number; color: string }[];
}> {
    const res = await fetch(`${API_URL}/admin/statistics/revenue-comparison`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Không lấy được so sánh doanh thu');
    return data;
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


export async function sendOrderEmail(
    sessionId: string,
    orderId: number,
    payload: { subject: string; message: string; template?: 'custom' | 'status_update' }
) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}/email`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.message || 'Không thể gửi email');
    }
    return data; // { success: true, message: 'Email scheduled to send' }
}

export async function getOnetimecodes(
    sessionId: string | number,
    page: number,
    perPage: number,
    q?: string
) {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/onetimecodes`;

    const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
    });

    const keyword = q?.trim();
    if (keyword) params.set("q", keyword); // ✅ gửi q lên backend khi có search

    const res = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
        },
        // optional (tuỳ bạn muốn fresh data):
        // cache: "no-store",
    });

    if (!res.ok) {
        let message = "Failed to fetch onetimecodes";
        try {
            const error = await res.json();
            message = error?.message || message;
        } catch { }
        throw new Error(message);
    }

    return res.json(); // backend trả { data: ..., meta: ... }
}


export const getListOnetimecodes = async (sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-onetimecodes`, {
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


export const insertOnetimecode = async (sessionId: string, UserOnetimecode: userOnetimecode) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/store-onetimecodes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify(UserOnetimecode),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch user coins');
    }

    return res.json(); // trả về { coins: number }
};

export const updateOnetimecode = async (sessionId: string, UserOnetimecode: userOnetimecode) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-onetimecodes/${UserOnetimecode.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify(UserOnetimecode),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch user coins');
    }

    return res.json(); // trả về { coins: number }
};

// Xoá item trong giỏ hàng
export async function deleteOnetimecode(id: number, sessionId: string): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/destroy-onetimecodes/${id}`, {
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



/** Thêm mới onetimecode */
export const createOnetimecode = async (sessionId: string, payload: Onetimecode) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/onetimecodes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Không thể tạo onetimecode");
    }

    return res.json();
};

/** Cập nhật onetimecode */
export const updateMasterOnetimecode = async (sessionId: string, payload: Onetimecode) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/onetimecodes/${encodeURIComponent(payload.email)}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Không thể cập nhật onetimecode");
    }

    return res.json();
};

/** Xoá onetimecode */
export const deleteMasterOnetimecode = async (sessionId: string, id: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/onetimecodes/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Không thể xoá onetimecode");
    }

    return res.json();
};

// ============ Discount Codes ============ //

export async function fetchDiscountCodes(sessionId: string, page: number = 1, perPage: number = 20, q: string = '') {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('per_page', String(perPage));
    if (q.trim()) qs.set('q', q.trim());

    const res = await fetch(`${API_URL}/admin/discount-codes?${qs.toString()}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch discount codes');
    }
    return data; // { success, data, meta }
}

export async function createDiscountCode(sessionId: string, payload: any) {
    const res = await fetch(`${API_URL}/admin/discount-codes`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to create discount code');
    }
    return data;
}

export async function updateDiscountCode(sessionId: string, id: number, payload: any) {
    const res = await fetch(`${API_URL}/admin/discount-codes/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to update discount code');
    }
    return data;
}

export async function deleteDiscountCode(sessionId: string, id: number) {
    const res = await fetch(`${API_URL}/admin/discount-codes/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'Failed to delete discount code');
    }
    return data;
}

// ============ Customer Vouchers (Kho voucher khách) ============ //

export interface AdminCustomerVoucherItem {
    id: number;
    user_id: string;
    user: { id: string; name: string; email: string } | null;
    code: string;
    title: string | null;
    type: 'percentage' | 'fixed';
    value: number;
    min_amount: number;
    max_discount: number | null;
    expires_at: string | null;
    source: string;
    used_at: string | null;
    order_id: number | null;
    created_at: string;
    is_used: boolean;
    is_valid: boolean;
}

export async function fetchCustomerVouchersAdmin(
    sessionId: string,
    params?: { page?: number; per_page?: number; user_id?: string; status?: string; q?: string }
) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    if (params?.user_id) qs.set('user_id', params.user_id);
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);

    const res = await fetch(`${API_URL}/admin/customer-vouchers?${qs.toString()}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            Accept: 'application/json',
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tải danh sách voucher');
    return data as { success: boolean; data: AdminCustomerVoucherItem[]; meta: { current_page: number; per_page: number; last_page: number; total: number } };
}

export async function createCustomerVoucherAdmin(sessionId: string, payload: {
    user_id: string;
    code: string;
    title?: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_amount?: number;
    max_discount?: number;
    expires_at?: string;
}) {
    const res = await fetch(`${API_URL}/admin/customer-vouchers`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tạo voucher');
    return data;
}

export async function deleteCustomerVoucherAdmin(sessionId: string, id: number) {
    const res = await fetch(`${API_URL}/admin/customer-vouchers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionId}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Không thể xóa voucher');
    return data;
}

// --- Phần thưởng hạng (voucher theo hạng) ---
export interface AdminRankItem {
    id: string;
    name: string;
    min_spent: number;
    min_orders: number;
}
export interface AdminRankRewardVoucherItem {
    id: number;
    rank_id: string;
    rank_name?: string;
    title: string | null;
    type: 'percentage' | 'fixed';
    value: number;
    min_amount: number;
    max_discount: number | null;
    expiry_days: number;
    created_at: string;
    updated_at: string;
}
export async function fetchAdminRanks(sessionId: string): Promise<{ success: boolean; data: AdminRankItem[] }> {
    const res = await fetch(`${API_URL}/admin/ranks`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}`, Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tải danh sách hạng');
    return data;
}
export async function fetchRankRewardVouchersAdmin(
    sessionId: string,
    params?: { rank_id?: string }
): Promise<{ success: boolean; data: AdminRankRewardVoucherItem[] }> {
    const qs = new URLSearchParams();
    if (params?.rank_id) qs.set('rank_id', params.rank_id);
    const url = `${API_URL}/admin/rank-reward-vouchers${qs.toString() ? '?' + qs.toString() : ''}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}`, Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tải phần thưởng hạng');
    return data;
}
export async function createRankRewardVoucherAdmin(sessionId: string, payload: {
    rank_id: string;
    title?: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_amount?: number;
    max_discount?: number;
    expiry_days?: number;
}) {
    const res = await fetch(`${API_URL}/admin/rank-reward-vouchers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionId}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tạo phần thưởng');
    return data as { success: boolean; data: AdminRankRewardVoucherItem };
}
export async function updateRankRewardVoucherAdmin(sessionId: string, id: number, payload: Partial<{
    rank_id: string;
    title: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_amount: number;
    max_discount: number | null;
    expiry_days: number;
}>) {
    const res = await fetch(`${API_URL}/admin/rank-reward-vouchers/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sessionId}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể cập nhật phần thưởng');
    return data as { success: boolean; data: AdminRankRewardVoucherItem };
}
export async function deleteRankRewardVoucherAdmin(sessionId: string, id: number) {
    const res = await fetch(`${API_URL}/admin/rank-reward-vouchers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionId}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Không thể xóa phần thưởng');
    return data;
}

// --- Phần thưởng có thể đổi (đổi điểm lấy voucher) ---
export interface AdminRewardItem {
    id: number;
    name: string;
    description: string | null;
    icon_url: string | null;
    points_cost: number;
    voucher_type: 'percentage' | 'fixed' | null;
    voucher_value: number | null;
    voucher_min_amount: number;
    voucher_max_discount: number | null;
    voucher_expiry_days: number;
    created_at: string;
    updated_at: string;
}
export async function fetchRewardsAdmin(sessionId: string): Promise<{ success: boolean; data: AdminRewardItem[] }> {
    const res = await fetch(`${API_URL}/admin/rewards`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionId}`, Accept: 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tải phần thưởng');
    return data;
}
export async function createRewardAdmin(sessionId: string, payload: {
    name: string;
    description?: string;
    icon_url?: string;
    points_cost: number;
    voucher_type?: 'percentage' | 'fixed';
    voucher_value?: number;
    voucher_min_amount?: number;
    voucher_max_discount?: number;
    voucher_expiry_days?: number;
}) {
    const res = await fetch(`${API_URL}/admin/rewards`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionId}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tạo phần thưởng');
    return data as { success: boolean; data: AdminRewardItem };
}
export async function updateRewardAdmin(sessionId: string, id: number, payload: Partial<{
    name: string;
    description: string;
    icon_url: string;
    points_cost: number;
    voucher_type: 'percentage' | 'fixed';
    voucher_value: number;
    voucher_min_amount: number;
    voucher_max_discount: number | null;
    voucher_expiry_days: number;
}>) {
    const res = await fetch(`${API_URL}/admin/rewards/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sessionId}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể cập nhật phần thưởng');
    return data as { success: boolean; data: AdminRewardItem };
}
export async function deleteRewardAdmin(sessionId: string, id: number) {
    const res = await fetch(`${API_URL}/admin/rewards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionId}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Không thể xóa phần thưởng');
    return data;
}

export async function applyDiscountCodeApi(code: string, orderTotal: number, sessionId?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) headers['Authorization'] = `Bearer ${sessionId}`;
    const res = await fetch(`${API_URL}/discount-codes/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, order_total: orderTotal }),
    });

    const data = await res.json();
    if (!res.ok || !data.valid) {
        throw new Error(data.message || 'Mã giảm giá không hợp lệ');
    }
    return data as {
        code: string;
        type: 'percentage' | 'fixed';
        value: number;
        discountAmount: number;
        finalTotal: number;
        message: string;
    };
}

export async function consumeDiscountCodeApi(code: string, orderId?: number, sessionId?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) headers['Authorization'] = `Bearer ${sessionId}`;
    const res = await fetch(`${API_URL}/discount-codes/consume`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, order_id: orderId ?? undefined }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể cập nhật số lần dùng của mã giảm giá');
    }
    return data as {
        success: boolean;
        code: string;
        used_count: number;
        is_active: boolean;
    };
}

export const getListAccounts = async (
    sessionId: string,
    params?: {
        page?: number;
        per_page?: number;
        q?: string;
        product_type?: string;      // all | ...
        sort_by?: string;           // purchaseDate | expiryDate | expiryToday | customerName | productType
        sort_order?: "asc" | "desc";
    }
) => {
    const base = `${process.env.NEXT_PUBLIC_API_URL}/admin/customer-accounts`;

    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.q?.trim()) qs.set("q", params.q.trim());
    if (params?.product_type && params.product_type !== "all") qs.set("product_type", params.product_type);
    if (params?.sort_by) qs.set("sort_by", params.sort_by);
    if (params?.sort_order) qs.set("sort_order", params.sort_order);

    const res = await fetch(`${base}${qs.toString() ? `?${qs.toString()}` : ""}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch accounts");
    }

    return res.json(); // { success, data, meta }
};


export const createAccount = async (sessionId: string, accountData: object) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customer-accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify(accountData), // Send the account data in the body
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create account');
    }

    return res.json(); // Returns the created account
};

export const getAccountById = async (sessionId: string, accountId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customer-accounts/${accountId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch account');
    }

    return res.json(); // Returns the account details
};

export const updateAccount = async (sessionId: string, accountId: string, accountData: object) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customer-accounts/${accountId}`, {
        method: 'PUT', // Or use PATCH if you prefer partial updates
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify(accountData), // Send the updated account data
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update account');
    }

    return res.json(); // Returns the updated account
};

export const deleteAccount = async (sessionId: string, accountId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customer-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete account');
    }

    return res.json(); // Returns a success message or empty response
};

export const sendCustomerAccountRenewalEmail = async (sessionId: string, accountId: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customer-accounts/${accountId}/renewal-email`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || 'Failed to send renewal email');
    }

    return data;
};

/** GET /api/admin/renewal-requests - Danh sách đơn yêu cầu gia hạn (admin) */
export const fetchAdminRenewalRequests = async (
    sessionId: string,
    params?: { page?: number; per_page?: number; status?: string }
): Promise<{ success: boolean; data: any[]; meta: any }> => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    if (params?.status) qs.set('status', params.status);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/renewal-requests${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${sessionId}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Không thể tải đơn yêu cầu gia hạn');
    return res.json();
};

/** PUT /api/admin/renewal-requests/{id} - Duyệt / từ chối yêu cầu gia hạn */
export const updateAdminRenewalRequest = async (
    sessionId: string,
    id: number,
    payload: { status: 'approved' | 'rejected'; admin_note?: string }
): Promise<{ success: boolean; message?: string }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/renewal-requests/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');
    return data;
};


const base = process.env.NEXT_PUBLIC_API_URL;

const headers = (sessionId: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionId}`,
});

const handle = async (res: Response) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Request failed");
    }
    return res.json();
};

export const getListChatgpts = async (
    sessionId: string,
    params?: { page?: number; per_page?: number; category?: string; status?: number | string; q?: string }
) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.category) qs.set("category", params.category);
    if (params?.status !== undefined) qs.set("status", String(params.status));
    if (params?.q?.trim()) qs.set("q", params.q.trim()); // ✅

    const res = await fetch(
        `${base}/admin/chatgpts${qs.toString() ? `?${qs.toString()}` : ""}`,
        { method: "GET", headers: headers(sessionId), cache: "no-store" }
    );
    return handle(res);
};


/** GET /admin/chatgpts/:id */
export const getChatgptById = async (sessionId: string, id: string | number) => {
    const res = await fetch(`${base}/admin/chatgpts/${id}`, {
        method: "GET",
        headers: headers(sessionId),
        cache: "no-store",
    });
    return handle(res); // trả về chi tiết bản ghi
};



/** POST /admin/chatgpts */
export const createChatgpt = async (
    sessionId: string,
    payload: ChatgptPayload
) => {
    const res = await fetch(`${base}/admin/chatgpts`, {
        method: "POST",
        headers: headers(sessionId),
        body: JSON.stringify(payload),
    });
    return handle(res); // trả về bản ghi vừa tạo
};


/** PUT /admin/chatgpts/:id */
export const updateChatgpt = async (
    sessionId: string,
    id: string | number,
    payload: ChatgptPayload
) => {
    const res = await fetch(`${base}/admin/chatgpts/${id}`, {
        method: "PUT",
        headers: headers(sessionId),
        body: JSON.stringify(payload),
    });
    return handle(res); // trả về bản ghi sau cập nhật
};

/** DELETE /admin/chatgpts/:id */
export const deleteChatgpt = async (sessionId: string, id: string | number) => {
    const res = await fetch(`${base}/admin/chatgpts/${id}`, {
        method: "DELETE",
        headers: headers(sessionId),
    });
    // Laravel trả 204 No Content hoặc JSON; ta xử lý cả hai
    if (res.status === 204) return { success: true };
    return handle(res);
};

/** GET /admin/chatgpts/:id/accounts */
export const getAccountsByChatgptId = async (sessionId: string, id: string | number) => {
    const res = await fetch(`${base}/admin/chatgpts/${id}/accounts`, {
        method: "GET",
        headers: headers(sessionId),
        cache: "no-store",
    });

    return handle(res);
};


export const getOnetimeCodeAdmin = async (id: Number, sessionId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/chatgpts/get-code/${id}`, {
        method: "GET",
        headers: headers(sessionId),
        cache: "no-store",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch onetimecode');
    }

    return res.json();
};

export const createGPTBusiness = async (sessionId: string, accountData: object) => {
    const res = await fetch(`https://chatgpt.com/backend-api/accounts/cd894bb7-af5b-4ae8-ae24-3ed036f2248e/invites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify(accountData), // Send the account data in the body
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create account');
    }

    return res.json(); // Returns the created account
};