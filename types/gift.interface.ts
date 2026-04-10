export interface GiftWinner {
    user_id: string;
    name: string | null;
    email?: string | null;
    selected_at: string | null;
}

export interface GiftParticipant {
    stt: number;
    user_id: string;
    name: string | null;
    email?: string | null;
    registered_at: string | null;
}

export interface GiftStatusData {
    gift_name: string | null;
    ends_at: string | null;
    has_ended: boolean;
    /** Số người trúng thưởng cấu hình cho chiến dịch */
    winner_count?: number;
    /** Người trúng đầu tiên (tương thích cũ) */
    winner: GiftWinner | null;
    /** Toàn bộ người trúng thưởng */
    winners?: GiftWinner[];
    participants: GiftParticipant[];
    has_joined: boolean;
}

export interface GiftStatusResponse {
    success: boolean;
    data: GiftStatusData;
}

export interface AdminGiftActiveData {
    gift_name: string | null;
    ends_at: string | null;
    has_ended: boolean;
    winner_count: number;
    winner: GiftWinner | null;
    winners: GiftWinner[];
    participants: GiftParticipant[];
}

export interface AdminGiftActiveResponse {
    success: boolean;
    data: AdminGiftActiveData;
}

