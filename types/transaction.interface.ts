export interface Transaction {
    id: number;            // Nếu có cột id tự tăng bên backend thì nên thêm, còn không thì bỏ
    user_id: string;
    transaction_id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;     // ISO date string
    updated_at: string;     // ISO date string
    status: string;         // Ví dụ: 'pending', 'completed', 'failed', ...
}