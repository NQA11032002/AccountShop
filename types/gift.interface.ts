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
    winner: GiftWinner | null;
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
    winner: GiftWinner | null;
    participants: GiftParticipant[];
}

export interface AdminGiftActiveResponse {
    success: boolean;
    data: AdminGiftActiveData;
}

