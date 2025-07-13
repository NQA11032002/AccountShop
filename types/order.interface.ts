export interface Order {
    id: number;
    user_id: string;
    user_email: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    original_total: number;
    discount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    shipping_address: string;
    notes: string;
    transaction_id: string;

    // Optional nếu bạn cần
    order_products?: any[];
    customerAccounts?: any[];
    analytics?: {
        totalItems: number;
        avgItemPrice: number;
        discountPercentage: number;
        daysSinceOrder: number;
    };
}

export interface OrdersData {
    orders: Order[];
    statistics: {
        totalOrders: number;
        totalSpent: number;
        totalOrderCompledted: number;
        averageOrderValue: number;
        lastOrderDate: string | null;
        totalOrderProducts: number;
    };
}
