export interface UserPreferences {
    categories: string[];
    notifications: boolean;
    currency: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    joinDate: string; // ISO date string (có thể đổi sang Date nếu cần)
    status: string; // Tùy chỉnh thêm nếu có
    totalOrders: number;
    totalSpent: number;
    avatar: string;
    phone: string;
    address: string;
    points: number;
    rank: string; // Thêm các cấp bậc nếu cần
    coins: number;
    preferences: UserPreferences;
}