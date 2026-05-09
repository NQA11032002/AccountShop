export interface PromptTemplateItem {
  id: number;
  category: string;
  /** Tiêu đề hiển thị (tùy chọn); nội dung prompt vẫn là `content`. */
  title?: string | null;
  /** `image`: prompt kèm ảnh mẫu — hiển thị tab Hình ảnh, không vào thư viện văn bản. */
  kind?: 'text' | 'image';
  content: string;
  /** URL ảnh mẫu khi `kind === 'image'` */
  image_url?: string | null;
  /** Dòng tag (vd. Commercial — Midjourney) khi `kind === 'image'` */
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

