import type { AiGuide, AiGuideApi, AiGuideFeature, AiGuideFeatureApi } from "@/types/ai-guide.interface";
import type { AiGuide as FallbackGuide } from "@/data/ai-guides";

/** Keep local fallback content compatible with the public API view model. */
export function mapFallbackGuideToUi(guide: FallbackGuide): AiGuide {
  return {
    ...guide,
    name: guide.name ?? "",
    features: guide.features.map(feature => ({ ...feature, imageUrls: [] })),
  };
}

function resolveImageUrls(f: AiGuideFeatureApi): string[] {
  const fromList = (f.image_urls ?? [])
    .map((url) => (url || "").trim())
    .filter(Boolean);
  if (fromList.length > 0) return Array.from(new Set(fromList));
  const single = (f.image_url || "").trim();
  return single ? [single] : [];
}

function mapFeature(f: AiGuideFeatureApi): AiGuideFeature {
  const imageUrls = resolveImageUrls(f);
  return {
    id: f.feature_key || f.id || String(f.db_id ?? ""),
    title: f.title,
    summary: f.summary ?? "",
    detail: f.detail ?? "",
    bullets: f.bullets ?? [],
    imageTitle: f.image_title ?? "",
    imageCaption: f.image_caption ?? "",
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
  };
}

export function mapApiGuideToUi(g: AiGuideApi): AiGuide {
  return {
    slug: g.slug,
    toolId: g.tool_id,
    name: g.name,
    category: g.category ?? "",
    subtitle: g.subtitle ?? "",
    description: g.description ?? "",
    audience: g.audience ?? [],
    logoUrl: g.logo_url ?? null,
    features: (g.features ?? []).map(mapFeature),
  };
}

export function mapApiGuidesToUi(guides: AiGuideApi[]): AiGuide[] {
  return guides.map(mapApiGuideToUi);
}
