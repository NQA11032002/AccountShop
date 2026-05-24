export interface PromptTemplateItem {
  id: number;
  category: string;
  /** Tiêu đề hiển thị (tùy chọn); nội dung prompt vẫn là `content`. */
  title?: string | null;
  /** ID gốc từ Meigen.ai — dùng chống trùng khi đồng bộ */
  id_mei?: string | null;
  /** `image` / `video`: tab riêng trên trang Prompt */
  kind?: 'text' | 'image' | 'video';
  content: string;
  /** Ảnh mẫu (`image`) hoặc poster tuỳ chọn (`video`) */
  image_url?: string | null;
  /** Link video khi `kind === 'video'` */
  video_url?: string | null;
  /** Tag / ghi chú (ảnh hoặc video) */
  tag?: string | null;
  sort_order: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromptTemplateListResponse {
  success: boolean;
  data: PromptTemplateItem[];
}

