
export interface CustomerAccount {
    id: number;                 // PRIMARY KEY trong DB

    account_email: string | null;
    account_password: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    product_type: string | null;
    product_icon: string | null;
    product_color: string | null;

    // Laravel thường trả về dạng string (YYYY-MM-DD hoặc datetime)
    purchase_date: string | null;
    expiry_date: string | null;

    status: 'active' | 'expired' | 'suspended' | string; // tuỳ bạn dùng gì trong DB
    link: string | null;

    order_id: number | null;    // trong DB nên để int
    duration: number | null;    // số ngày / tháng…
    purchase_price: number | null;
}