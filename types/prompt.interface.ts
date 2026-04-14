export interface PromptTemplateItem {
  id: number;
  category: string;
  content: string;
  sort_order: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromptTemplateListResponse {
  success: boolean;
  data: PromptTemplateItem[];
}

