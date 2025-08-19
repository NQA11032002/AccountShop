
export interface ParentCategory {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    name: string;
    parent_id: number;
    slug: string;
    parent?: ParentCategory; // Optional: bạn có thể populate nếu join API
}