export interface ChatgptPayload {
    id: number;
    email: string;
    password: string;
    two_fa?: string | null;
    start_date?: string | null; // yyyy-mm-dd
    end_date?: string | null;
    count_user: number;
    category: string;
    status: number;   // Laravel trả 0/1, ta hiển thị boolean
};
