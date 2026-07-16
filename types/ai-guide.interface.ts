export type AiGuideFeatureApi = {
  id: string;
  feature_key?: string | null;
  db_id?: number;
  title: string;
  summary?: string | null;
  detail?: string | null;
  bullets?: string[];
  image_title?: string | null;
  image_caption?: string | null;
  image_url?: string | null;
  image_urls?: string[];
  sort_order?: number;
};

export type AiGuideApi = {
  id?: number;
  slug: string;
  tool_id: string;
  name: string;
  category?: string | null;
  subtitle?: string | null;
  description?: string | null;
  audience?: string[];
  logo_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  features_count?: number;
  features?: AiGuideFeatureApi[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type AiGuideFeatureAdmin = {
  id?: number;
  feature_key?: string | null;
  title: string;
  summary?: string | null;
  detail?: string | null;
  bullets?: string[];
  image_title?: string | null;
  image_caption?: string | null;
  image_url?: string | null;
  image_urls?: string[];
  sort_order?: number;
  is_active?: boolean;
};

export type AiGuideSummary = AiGuideApi & {
  id: number;
  features: AiGuideFeatureAdmin[];
};

export type AiGuideListResponse = {
  success: boolean;
  data: AiGuideSummary[];
};

export type AiGuideDetailResponse = {
  success: boolean;
  data: AiGuideApi;
};

export type AiGuideUpsertPayload = {
  slug?: string | null;
  tool_id: string;
  name: string;
  category?: string | null;
  subtitle?: string | null;
  description?: string | null;
  audience?: string[];
  logo_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  features?: Array<
    Partial<AiGuideFeatureAdmin> & {
      title: string;
    }
  >;
};

/** UI shape used by public pages (camelCase) */
export type AiGuideFeature = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  bullets: string[];
  imageTitle: string;
  imageCaption: string;
  imageUrl?: string | null;
  imageUrls: string[];
};

export type AiGuide = {
  slug: string;
  toolId: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  audience: string[];
  logoUrl?: string | null;
  features: AiGuideFeature[];
};
