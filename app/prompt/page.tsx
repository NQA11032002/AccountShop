"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Lightbulb,
  Sparkles,
  Target,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ZoomIn,
  Video,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPromptTemplates, resolveApiAssetUrl } from "@/lib/api";
import PromptSampleImage from "@/components/PromptSampleImage";
import SectionReveal from "@/components/SectionReveal";
import { useToast } from "@/hooks/use-toast";
import type { PromptTemplateItem } from "@/types/prompt.interface";

type PromptEntry = {
  id: number | null;
  title: string | null;
  content: string;
};

type PromptCategory = {
  id: string;
  genre: string;
  entries: PromptEntry[];
};

function entriesFromStrings(lines: string[]): PromptEntry[] {
  return lines.map((content) => ({ id: null, title: null, content }));
}

function copyTextForPrompt(title: string | null | undefined, content: string): string {
  const t = title?.trim();
  return t ? `${t}\n\n${content}` : content;
}

type ImagePromptSample = {
  id: string;
  /** Dùng cho tiêu đề modal & alt ảnh */
  title: string;
  /** Dòng tag trên card (tùy chọn) */
  tag?: string;
  /** Đường dẫn trong `public/` hoặc URL ảnh mẫu */
  imageSrc: string;
  prompt: string;
};

type VideoPromptSample = {
  id: string;
  title: string;
  tag?: string;
  posterSrc?: string;
  videoUrl: string;
  prompt: string;
};

function parseVideoPlayback(url: string):
  | { kind: "youtube"; embedSrc: string }
  | { kind: "vimeo"; embedSrc: string }
  | { kind: "direct"; src: string }
  | { kind: "external"; href: string } {
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      let vid = u.searchParams.get("v");
      if (!vid && u.pathname.startsWith("/embed/")) {
        vid = u.pathname.slice("/embed/".length).split("/")[0] || null;
      }
      if (!vid && u.pathname.startsWith("/shorts/")) {
        vid = u.pathname.slice("/shorts/".length).split("/")[0] || null;
      }
      if (vid && /^[\w-]{6,}$/.test(vid)) {
        return {
          kind: "youtube",
          embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?rel=0`,
        };
      }
    }

    if (host === "youtu.be") {
      const vid = u.pathname.replace(/^\//, "").split("/")[0];
      if (vid && /^[\w-]{6,}$/.test(vid)) {
        return {
          kind: "youtube",
          embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?rel=0`,
        };
      }
    }

    if (host === "vimeo.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts[0];
      if (id && /^\d+$/.test(id)) {
        return { kind: "vimeo", embedSrc: `https://player.vimeo.com/video/${id}` };
      }
    }

    if (host === "player.vimeo.com" && u.pathname.startsWith("/video/")) {
      return { kind: "vimeo", embedSrc: trimmed };
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u.pathname)) {
      return { kind: "direct", src: trimmed };
    }
  } catch {
    /* invalid URL */
  }

  if (/^https?:\/\//i.test(trimmed) && /\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return { kind: "direct", src: trimmed };
  }

  return { kind: "external", href: trimmed };
}

function extractYoutubeVideoId(urlString: string): string | null {
  const trimmed = urlString.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      let vid = u.searchParams.get("v");
      if (!vid && u.pathname.startsWith("/embed/")) {
        vid = u.pathname.slice("/embed/".length).split("/")[0] || null;
      }
      if (!vid && u.pathname.startsWith("/shorts/")) {
        vid = u.pathname.slice("/shorts/".length).split("/")[0] || null;
      }
      if (vid && /^[\w-]{6,}$/.test(vid)) return vid;
    }
    if (host === "youtu.be") {
      const vid = u.pathname.replace(/^\//, "").split("/")[0];
      if (vid && /^[\w-]{6,}$/.test(vid)) return vid;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

function extractVimeoVideoId(urlString: string): string | null {
  const trimmed = urlString.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "vimeo.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts[0];
      if (id && /^\d+$/.test(id)) return id;
    }
    if (host === "player.vimeo.com" && u.pathname.startsWith("/video/")) {
      const id = u.pathname.slice("/video/".length).split("/")[0];
      if (id && /^\d+$/.test(id)) return id;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

/** Ảnh nền thẻ: frame đầu (YouTube/Vimeo qua thumbnail CDN; mp4/webm qua #t=0.001). */
function resolveVideoCardPreviewFromUrl(videoUrl: string):
  | { kind: "image"; src: string }
  | { kind: "nativeVideo"; src: string }
  | null {
  const yt = extractYoutubeVideoId(videoUrl);
  if (yt) {
    return { kind: "image", src: `https://img.youtube.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg` };
  }
  const vm = extractVimeoVideoId(videoUrl);
  if (vm) {
    return { kind: "image", src: `https://vumbnail.com/${encodeURIComponent(vm)}.jpg` };
  }
  const parsed = parseVideoPlayback(videoUrl.trim());
  if (parsed.kind === "direct") {
    const base = resolveApiAssetUrl(parsed.src.trim());
    if (!base) return null;
    const src = base.includes("#") ? base : `${base}#t=0.001`;
    return { kind: "nativeVideo", src };
  }
  return null;
}

function VideoCardPosterArea({ sample }: { sample: VideoPromptSample }) {
  const poster = sample.posterSrc?.trim();
  if (poster) {
    return (
      <PromptSampleImage
        src={poster}
        alt={sample.title}
        className="h-full w-full object-cover"
      />
    );
  }
  const preview = resolveVideoCardPreviewFromUrl(sample.videoUrl);
  if (preview?.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- thumbnail từ YouTube / Vimeo
      <img
        src={preview.src}
        alt={sample.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  if (preview?.kind === "nativeVideo") {
    return (
      <video
        src={preview.src}
        muted
        playsInline
        preload="metadata"
        className="pointer-events-none h-full w-full object-cover"
        aria-hidden
      />
    );
  }
  return (
    <div className="flex h-full w-full min-h-0 items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900">
      <Video className="h-12 w-12 text-white/35" aria-hidden />
    </div>
  );
}

const imagePromptSamples: ImagePromptSample[] = [
  {
    id: "img-1",
    title: "Poster sản phẩm tối giản",
    tag: "Commercial — Midjourney",
    imageSrc: "https://picsum.photos/seed/promptimg1/640/400",
    prompt:
      "Minimal product poster, soft daylight, marble surface, single cosmetic bottle, subtle shadow, clean typography space at top, ultra realistic, 4k, commercial photography style.",
  },
  {
    id: "img-2",
    title: "Minh họa workspace tech",
    tag: "Illustration — DALL·E",
    imageSrc: "https://picsum.photos/seed/promptimg2/640/400",
    prompt:
      "Isometric illustration of a developer workspace, navy and cyan palette, floating UI cards, subtle grid background, modern SaaS aesthetic, vector-like clarity, no text in image.",
  },
  {
    id: "img-3",
    title: "Hoàng hôn bên biển",
    tag: "Scene — Stable Diffusion",
    imageSrc: "https://picsum.photos/seed/promptimg3/640/400",
    prompt:
      "Serene coastal sunset, gentle waves, pastel sky, lone silhouette on beach, cinematic wide shot, film grain, emotional mood, high detail.",
  },
  {
    id: "img-4",
    title: "Logo khối trừu tượng",
    tag: "Brand — Ideogram",
    imageSrc: "https://picsum.photos/seed/promptimg4/640/400",
    prompt:
      "Abstract geometric logo mark, overlapping translucent shapes, gradient from violet to teal, white background, centered, scalable vector style, no letters.",
  },
];

const videoPromptSamples: VideoPromptSample[] = [
  {
    id: "vid-1",
    title: "Quảng cáo sản phẩm tối giản",
    tag: "Commercial — text-to-video",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    prompt:
      "15-second minimalist product commercial: single hero bottle on marble, soft daylight, slow dolly-in, shallow depth of field, subtle reflections, premium aesthetic, no on-screen text, 4k cinematic.",
  },
  {
    id: "vid-2",
    title: "Flycam thành phố đêm",
    tag: "Cinematic — drone look",
    videoUrl: "https://vimeo.com/1084537",
    prompt:
      "Aerial night city fly-through: neon reflections on wet streets, gentle parallax between buildings, slow forward motion, moody teal-orange grade, anamorphic lens flares, ultra detailed, 24fps film motion.",
  },
];

const guideSteps = [
  {
    title: "Nêu rõ vai trò AI",
    desc: "Bắt đầu bằng vai trò cụ thể như: chuyên gia marketing, gia sư, lập trình viên...",
  },
  {
    title: "Đưa bối cảnh cụ thể",
    desc: "Thêm thông tin nền: sản phẩm gì, đối tượng nào, mục tiêu gì.",
  },
  {
    title: "Yêu cầu định dạng đầu ra",
    desc: "Ví dụ: trả lời dạng bảng, checklist, 5 ý chính hoặc 300 từ.",
  },
  {
    title: "Tinh chỉnh theo vòng lặp",
    desc: "Sau câu trả lời đầu tiên, yêu cầu AI sửa chi tiết để có kết quả tốt hơn.",
  },
];

const fallbackPromptCategories: PromptCategory[] = [
  {
    id: "all",
    genre: "Tất cả",
    entries: [],
  },
  {
    id: "marketing",
    genre: "Kinh doanh & Marketing",
    entries: entriesFromStrings([
      "Bạn là chuyên gia marketing. Hãy lập kế hoạch nội dung Facebook 7 ngày cho shop mỹ phẩm thiên nhiên, mục tiêu tăng inbox.",
      "Viết 5 mẫu caption bán hàng ngắn, giọng thân thiện, có CTA rõ ràng cho sản phẩm [tên sản phẩm].",
      "Phân tích tệp khách hàng mục tiêu cho dịch vụ thiết kế website tại Việt Nam theo 3 nhóm chính.",
    ]),
  },
  {
    id: "study",
    genre: "Học tập & Công việc",
    entries: entriesFromStrings([
      "Bạn là gia sư tiếng Anh. Tạo lộ trình học giao tiếp 30 ngày cho người mới bắt đầu, mỗi ngày 30 phút.",
      "Tóm tắt nội dung dưới đây thành 5 ý chính và đặt 3 câu hỏi kiểm tra hiểu bài: [dán nội dung].",
      "Giúp tôi viết email chuyên nghiệp xin gia hạn deadline, lịch sự và ngắn gọn.",
    ]),
  },
  {
    id: "creative",
    genre: "Sáng tạo nội dung",
    entries: entriesFromStrings([
      "Viết kịch bản video TikTok 45 giây về mẹo tiết kiệm thời gian cho dân văn phòng, giọng vui vẻ.",
      "Viết một câu chuyện ngắn truyền cảm hứng về thói quen kỷ luật bản thân, kết thúc có thông điệp tích cực.",
      "Tạo 10 tiêu đề blog hấp dẫn cho chủ đề học AI cho người mới.",
    ]),
  },
  {
    id: "tech",
    genre: "Công nghệ & Lập trình",
    entries: entriesFromStrings([
      "Giải thích REST API cho người mới bằng ví dụ đời thường và minh họa bằng JSON.",
      "Review đoạn code sau, chỉ ra lỗi tiềm ẩn và đề xuất phiên bản tối ưu hơn: [dán code].",
      "Tạo checklist triển khai website lên VPS an toàn cho production.",
    ]),
  },
];

export default function PromptPage() {
  const { toast } = useToast();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>(fallbackPromptCategories);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const promptsPerPage = 6;
  const [imagePromptModalOpen, setImagePromptModalOpen] = useState(false);
  const [activeImagePrompt, setActiveImagePrompt] = useState<ImagePromptSample | null>(null);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [zoomImageSample, setZoomImageSample] = useState<ImagePromptSample | null>(null);
  const [imagePromptList, setImagePromptList] = useState<ImagePromptSample[]>(imagePromptSamples);
  /** true khi tab Hình ảnh đang dùng dữ liệu từ API (có ít nhất một prompt kind=image). */
  const [imageCardsFromApi, setImageCardsFromApi] = useState(false);
  const [videoPromptList, setVideoPromptList] = useState<VideoPromptSample[]>(videoPromptSamples);
  const [videoCardsFromApi, setVideoCardsFromApi] = useState(false);
  const [videoPromptModalOpen, setVideoPromptModalOpen] = useState(false);
  const [activeVideoPrompt, setActiveVideoPrompt] = useState<VideoPromptSample | null>(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState<VideoPromptSample | null>(null);

  useEffect(() => {
    const loadPrompts = async () => {
      setLoadingPrompts(true);
      try {
        const res = await fetchPromptTemplates();
        const grouped = new Map<string, { display: string; entries: PromptEntry[] }>();
        res.data.forEach((p: PromptTemplateItem) => {
          if (p.kind === "image" || p.kind === "video") return;
          const display = (p.category || "Khác").trim();
          const key = display.toLowerCase();
          if (!grouped.has(key)) grouped.set(key, { display, entries: [] });
          const title = p.title?.trim() ? p.title.trim() : null;
          grouped.get(key)!.entries.push({
            id: p.id,
            title,
            content: p.content,
          });
        });

        const apiImageCards: ImagePromptSample[] = res.data
          .filter((p) => p.kind === "image" && (p.image_url || "").trim() !== "")
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((p) => ({
            id: String(p.id),
            title: p.title?.trim() || "Prompt ảnh",
            tag: p.tag?.trim() || undefined,
            imageSrc: (p.image_url || "").trim(),
            prompt: p.content,
          }));

        const apiVideoCards: VideoPromptSample[] = res.data
          .filter((p) => p.kind === "video" && (p.video_url || "").trim() !== "")
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((p) => ({
            id: String(p.id),
            title: p.title?.trim() || "Prompt video",
            tag: p.tag?.trim() || undefined,
            posterSrc: (p.image_url || "").trim() || undefined,
            videoUrl: (p.video_url || "").trim(),
            prompt: p.content,
          }));

        setVideoCardsFromApi(apiVideoCards.length > 0);
        setVideoPromptList(apiVideoCards.length > 0 ? apiVideoCards : videoPromptSamples);

        setImageCardsFromApi(apiImageCards.length > 0);
        setImagePromptList(apiImageCards.length > 0 ? apiImageCards : imagePromptSamples);

        if (grouped.size > 0) {
          const dynamicCategories: PromptCategory[] = [
            { id: "all", genre: "Tất cả", entries: [] },
            ...Array.from(grouped.entries()).map(([key, { display, entries }]) => ({
              id: key.replace(/\s+/g, "-"),
              genre: display,
              entries,
            })),
          ];
          setPromptCategories(dynamicCategories);
        } else {
          setPromptCategories(fallbackPromptCategories);
        }
      } catch (e: any) {
        setPromptCategories(fallbackPromptCategories);
        setImageCardsFromApi(false);
        setVideoCardsFromApi(false);
        setVideoPromptList(videoPromptSamples);
        setImagePromptList(imagePromptSamples);
        toast({
          title: "Không tải được Prompt từ hệ thống",
          description: e?.message || "Đang dùng mẫu Prompt mặc định.",
          variant: "destructive",
        });
      } finally {
        setLoadingPrompts(false);
      }
    };

    loadPrompts();
  }, [toast]);

  const filteredCategories = useMemo(() => {
    if (selectedCategory === "all") {
      return promptCategories.filter((c) => c.id !== "all");
    }
    return promptCategories.filter((c) => c.id === selectedCategory);
  }, [promptCategories, selectedCategory]);

  const filteredPromptItems = useMemo(() => {
    return filteredCategories.flatMap((cat) =>
      cat.entries.map((row) => ({
        categoryId: cat.id,
        categoryName: cat.genre,
        id: row.id,
        title: row.title,
        content: row.content,
      }))
    );
  }, [filteredCategories]);

  const promptCountByCategoryId = useMemo(() => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const cat of promptCategories) {
      if (cat.id === "all") continue;
      counts.set(cat.id, cat.entries.length);
      total += cat.entries.length;
    }
    counts.set("all", total);
    return counts;
  }, [promptCategories]);

  const totalPages = Math.max(1, Math.ceil(filteredPromptItems.length / promptsPerPage));
  const paginatedPromptItems = useMemo(() => {
    const start = (currentPage - 1) * promptsPerPage;
    return filteredPromptItems.slice(start, start + promptsPerPage);
  }, [filteredPromptItems, currentPage]);

  useEffect(() => {
    const exists = promptCategories.some((c) => c.id === selectedCategory);
    if (!exists) setSelectedCategory("all");
  }, [promptCategories, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const copyPrompt = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 1800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100/90">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-72 -right-20 h-80 w-80 rounded-full bg-brand-emerald/15 blur-3xl [animation-duration:4s] animate-float"
      />

      <Header />

      <main className="relative z-10 bg-gradient-to-b from-slate-100/90 via-violet-50/50 to-slate-100/90">
        <SectionReveal>
          <section className="section-spacing-home container-max section-padding pb-0">
            <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
              <Sparkles className="mr-1 h-3 w-3" />
              Thư viện Prompt cho khách hàng
            </Badge>
            <h1 className="text-3xl font-bold leading-snug tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl">
              Hướng dẫn dùng Prompt AI
              <span className="mt-2 block pb-1.5 gradient-text">nhanh, đúng, hiệu quả</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-brand-gray/80 sm:text-lg">
              Tổng hợp mẫu prompt thực tế để khách hàng copy và dùng ngay cho học tập,
              công việc, marketing và sáng tạo nội dung.
            </p>
          </div>
        </section>
        </SectionReveal>

        <section className="section-spacing-home container-max section-padding pb-16 pt-6">
          <SectionReveal delayMs={60}>
            <Tabs defaultValue="guide" className="w-full">
            <TabsList className="mx-auto grid h-auto w-full max-w-5xl grid-cols-2 gap-2 rounded-2xl bg-white/70 p-2 shadow-sm ring-1 ring-violet-200/70 backdrop-blur-sm sm:grid-cols-4 sm:gap-1">
              <TabsTrigger
                value="guide"
                className="gap-2 rounded-xl py-2.5 text-violet-950 data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=inactive]:bg-violet-50/90 data-[state=inactive]:shadow-sm"
              >
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="text-sm">Hướng dẫn nhanh</span>
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="gap-2 rounded-xl py-2.5 text-violet-950 data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=inactive]:bg-violet-50/90 data-[state=inactive]:shadow-sm"
              >
                <Wand2 className="w-4 h-4 shrink-0" />
                <span className="text-sm">Thư viện prompt</span>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="gap-2 rounded-xl py-2.5 text-violet-950 data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=inactive]:bg-violet-50/90 data-[state=inactive]:shadow-sm"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="text-sm">Hình ảnh</span>
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="gap-2 rounded-xl py-2.5 text-violet-950 data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=inactive]:bg-violet-50/90 data-[state=inactive]:shadow-sm"
              >
                <Video className="w-4 h-4 shrink-0" />
                <span className="text-sm">Prompt video</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guideSteps.map((step, idx) => (
                  <SectionReveal key={step.title} delayMs={Math.min(idx * 60, 240)}>
                    <Card
                      className="h-full border-0 bg-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.12)] ring-1 ring-violet-200/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(79,70,229,0.22)]"
                    >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-brand-charcoal">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-bold text-brand-blue">
                          {idx + 1}
                        </span>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-brand-gray/80">
                      {step.desc}
                    </CardContent>
                    </Card>
                  </SectionReveal>
                ))}
              </div>

              <SectionReveal delayMs={120}>
              <Card className="mt-6 border-emerald-200/80 bg-emerald-50/90 shadow-sm ring-1 ring-emerald-200/60">
                <CardContent className="p-5 text-sm sm:text-base">
                  <p className="mb-1 flex items-center gap-2 font-semibold text-emerald-900">
                    <Target className="h-4 w-4" />
                    Mẹo quan trọng
                  </p>
                  <p className="text-emerald-800/90">
                    Prompt càng cụ thể thì kết quả càng đúng ý. Hãy thêm: vai trò AI + mục tiêu + đối tượng + định dạng đầu ra.
                  </p>
                </CardContent>
              </Card>
              </SectionReveal>
            </TabsContent>

            <TabsContent value="library" className="mt-8 space-y-5">
              <SectionReveal delayMs={40}>
              <div className="flex flex-col gap-2 rounded-2xl border-0 bg-white/70 px-3 py-2.5 shadow-sm ring-1 ring-violet-200/70 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-3">
                <label htmlFor="prompt-category-filter" className="shrink-0 text-xs font-medium text-brand-gray/80">
                  Thể loại
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    id="prompt-category-filter"
                    className="h-9 w-full min-w-0 border-violet-200/80 bg-white text-sm text-brand-charcoal focus:ring-brand-blue sm:max-w-xs"
                  >
                    <SelectValue placeholder="Chọn thể loại" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(280px,50vh)]">
                    {promptCategories.map((cat) => {
                      const count = promptCountByCategoryId.get(cat.id) ?? 0;
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.genre}
                          {count > 0 ? ` (${count})` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="shrink-0 text-xs text-brand-gray/70 sm:ml-auto">
                  {filteredPromptItems.length} prompt
                </p>
              </div>
              </SectionReveal>

              {loadingPrompts && (
                <SectionReveal delayMs={60}>
                <Card className="border-0 bg-white shadow-lg ring-1 ring-violet-200/80">
                  <CardContent className="p-6 text-slate-600">Đang tải thư viện prompt...</CardContent>
                </Card>
                </SectionReveal>
              )}

              {!loadingPrompts && filteredPromptItems.length === 0 && (
                <SectionReveal delayMs={60}>
                <Card className="border-0 bg-white shadow-lg ring-1 ring-violet-200/80">
                  <CardContent className="p-8 text-center text-slate-600">
                    Chưa có prompt trong thể loại này.
                  </CardContent>
                </Card>
                </SectionReveal>
              )}

              {!loadingPrompts && filteredPromptItems.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {paginatedPromptItems.map((item, idx) => {
                      const fullCopy = copyTextForPrompt(item.title, item.content);
                      return (
                      <SectionReveal
                        key={item.id != null ? `p-${item.id}` : `${item.categoryId}-${idx}-${item.content.slice(0, 20)}`}
                        delayMs={Math.min(idx * 55, 330)}
                      >
                      <Card
                        className="flex h-full min-h-0 flex-col border-0 bg-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.12)] ring-1 ring-violet-200/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(79,70,229,0.22)]"
                      >
                        <CardContent className="flex flex-1 min-h-0 flex-col gap-4 p-5">
                          <div className="shrink-0 space-y-3 border-b border-slate-200 pb-3">
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="min-w-0 flex-1 text-sm font-semibold text-indigo-700 leading-snug break-words">
                                {item.categoryName}
                              </span>
                              <span className="shrink-0 text-xs font-medium text-slate-500 tabular-nums">
                                Prompt #{(currentPage - 1) * promptsPerPage + idx + 1}
                              </span>
                            </div>
                            {item.title?.trim() ? (
                              <p className="text-sm font-semibold text-slate-900 leading-snug break-words">
                                {item.title.trim()}
                              </p>
                            ) : null}
                          </div>
                          <p className="min-h-0 flex-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {item.content}
                          </p>
                          <div className="shrink-0 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyPrompt(fullCopy)}
                              className="text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {copiedPrompt === fullCopy ? "Đã sao chép" : "Sao chép prompt"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      </SectionReveal>
                    );
                    })}
                  </div>

                  <SectionReveal delayMs={80}>
                  <Card className="border-0 bg-white shadow-md ring-1 ring-violet-200/80">
                    <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
                      <p className="text-sm text-brand-gray/80">
                        Trang <span className="font-semibold">{currentPage}</span> / {totalPages} - Hiển thị {paginatedPromptItems.length} / {filteredPromptItems.length} prompt
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="border-violet-200 bg-white text-brand-charcoal hover:bg-violet-50"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="border-violet-200 bg-white text-brand-charcoal hover:bg-violet-50"
                        >
                          Sau
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </SectionReveal>
                </>
              )}
            </TabsContent>

            <TabsContent value="images" className="mt-8">
              <SectionReveal delayMs={40}>
              <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-brand-gray/80">
                Dùng <span className="font-medium text-brand-charcoal">Phóng to ảnh</span> để xem rõ ảnh mẫu;{" "}
                <span className="font-medium text-brand-charcoal">Xem Prompt</span> để đọc và sao chép prompt.
                {imageCardsFromApi ? (
                  <span className="mt-1 block text-xs text-brand-gray/60">
                    Nội dung do cửa hàng cập nhật từ trang quản trị.
                  </span>
                ) : null}
              </p>
              </SectionReveal>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {imagePromptList.map((sample, idx) => (
                  <SectionReveal key={sample.id} delayMs={Math.min(idx * 55, 330)}>
                  <Card
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-violet-200/60 bg-[#ebe8f4] shadow-md shadow-violet-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-950/15"
                  >
                    <CardContent className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
                      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
                        <div className="overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-100/80">
                          <PromptSampleImage
                            src={sample.imageSrc}
                            alt={sample.title}
                            className="aspect-[3/4] w-full object-cover"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-lg border-slate-200/90 bg-white text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => {
                          setZoomImageSample(sample);
                          setImageZoomOpen(true);
                        }}
                      >
                        <ZoomIn className="w-4 h-4 mr-2 shrink-0" />
                        Phóng to ảnh
                      </Button>

                      <Button
                        type="button"
                        className="mt-auto h-11 w-full rounded-xl border-0 bg-[#ddd6f3] text-sm font-semibold text-violet-950 shadow-none transition-colors hover:bg-[#cfc3ee]"
                        onClick={() => {
                          setActiveImagePrompt(sample);
                          setImagePromptModalOpen(true);
                        }}
                      >
                        Xem Prompt
                      </Button>
                    </CardContent>
                  </Card>
                  </SectionReveal>
                ))}
              </div>

              <Dialog
                open={imagePromptModalOpen}
                onOpenChange={(open) => {
                  setImagePromptModalOpen(open);
                  if (!open) setActiveImagePrompt(null);
                }}
              >
                <DialogContent className="max-h-[min(85vh,720px)] overflow-y-auto border-white/20 bg-slate-900 text-white sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-white pr-8">
                      {activeImagePrompt?.title ?? "Prompt"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="rounded-lg border border-white/15 bg-slate-950/80 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Nội dung prompt</p>
                    <pre className="text-sm text-slate-100 whitespace-pre-wrap font-sans leading-relaxed">
                      {activeImagePrompt?.prompt}
                    </pre>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/30 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setImagePromptModalOpen(false)}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="button"
                      className="bg-white text-slate-900 hover:bg-white/90"
                      disabled={!activeImagePrompt}
                      onClick={() => activeImagePrompt && copyPrompt(activeImagePrompt.prompt)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {activeImagePrompt && copiedPrompt === activeImagePrompt.prompt ? "Đã sao chép" : "Sao chép prompt"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={imageZoomOpen}
                onOpenChange={(open) => {
                  setImageZoomOpen(open);
                  if (!open) setZoomImageSample(null);
                }}
              >
                <DialogContent className="flex h-[min(92vh,calc(100dvh-2rem))] max-h-[min(92vh,calc(100dvh-2rem))] w-[min(96vw,960px)] max-w-[min(96vw,960px)] flex-col overflow-hidden border-white/20 bg-slate-900 p-0 text-white gap-0 sm:rounded-xl">
                  <DialogHeader className="shrink-0 space-y-1 border-b border-white/10 px-4 pb-3 pt-4 sm:px-6">
                    <DialogTitle className="text-left text-white pr-8 text-base leading-snug">
                      {zoomImageSample?.title ?? "Ảnh mẫu"}
                    </DialogTitle>
                    {zoomImageSample?.tag?.trim() ? (
                      <p className="text-left text-sm text-slate-400">{zoomImageSample.tag.trim()}</p>
                    ) : null}
                  </DialogHeader>
                  <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/50 px-3 py-4 sm:px-6">
                    {zoomImageSample ? (
                      <PromptSampleImage
                        src={zoomImageSample.imageSrc}
                        alt={zoomImageSample.title}
                        className="h-auto max-h-full w-auto max-w-full rounded-md object-contain shadow-xl"
                        loading="eager"
                      />
                    ) : null}
                  </div>
                  <DialogFooter className="shrink-0 border-t border-white/10 px-4 py-3 sm:px-6">
                    <Button
                      type="button"
                      className="bg-white text-slate-900 hover:bg-white/90"
                      onClick={() => setImageZoomOpen(false)}
                    >
                      Đóng
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="videos" className="mt-8">
              <SectionReveal delayMs={40}>
              <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-brand-gray/80">
                Dùng <span className="font-medium text-brand-charcoal">Xem clip</span> để phát video mẫu;{" "}
                <span className="font-medium text-brand-charcoal">Xem Prompt</span> để đọc và sao chép prompt tạo video.
                {videoCardsFromApi ? (
                  <span className="mt-1 block text-xs text-brand-gray/60">
                    Nội dung do cửa hàng cập nhật từ trang quản trị.
                  </span>
                ) : null}
              </p>
              </SectionReveal>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {videoPromptList.map((sample, idx) => (
                  <SectionReveal key={sample.id} delayMs={Math.min(idx * 55, 330)}>
                  <Card
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-200/50 bg-[#e6f7fa] shadow-md shadow-cyan-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/15"
                  >
                    <CardContent className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
                      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-100/80">
                          <VideoCardPosterArea sample={sample} />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="rounded-full bg-white/90 p-3 shadow-lg ring-1 ring-black/5">
                              <Play className="h-6 w-6 text-cyan-900" fill="currentColor" aria-hidden />
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-lg border-slate-200/90 bg-white text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => {
                          setActiveVideoPlayer(sample);
                          setVideoPlayerOpen(true);
                        }}
                      >
                        <Play className="w-4 h-4 mr-2 shrink-0" />
                        Xem clip
                      </Button>

                      <Button
                        type="button"
                        className="mt-auto h-11 w-full rounded-xl border-0 bg-cyan-100 text-sm font-semibold text-cyan-950 shadow-none transition-colors hover:bg-cyan-200/90"
                        onClick={() => {
                          setActiveVideoPrompt(sample);
                          setVideoPromptModalOpen(true);
                        }}
                      >
                        Xem Prompt
                      </Button>
                    </CardContent>
                  </Card>
                  </SectionReveal>
                ))}
              </div>

              <Dialog
                open={videoPromptModalOpen}
                onOpenChange={(open) => {
                  setVideoPromptModalOpen(open);
                  if (!open) setActiveVideoPrompt(null);
                }}
              >
                <DialogContent className="max-h-[min(85vh,720px)] overflow-y-auto border-white/20 bg-slate-900 text-white sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-white pr-8">
                      {activeVideoPrompt?.title ?? "Prompt video"}
                    </DialogTitle>
                    {activeVideoPrompt?.tag?.trim() ? (
                      <p className="text-left text-sm text-slate-400 -mt-1">{activeVideoPrompt.tag.trim()}</p>
                    ) : null}
                  </DialogHeader>
                  <div className="rounded-lg border border-white/15 bg-slate-950/80 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Nội dung prompt</p>
                    <pre className="text-sm text-slate-100 whitespace-pre-wrap font-sans leading-relaxed">
                      {activeVideoPrompt?.prompt}
                    </pre>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/30 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setVideoPromptModalOpen(false)}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="button"
                      className="bg-white text-slate-900 hover:bg-white/90"
                      disabled={!activeVideoPrompt}
                      onClick={() => activeVideoPrompt && copyPrompt(activeVideoPrompt.prompt)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {activeVideoPrompt && copiedPrompt === activeVideoPrompt.prompt ? "Đã sao chép" : "Sao chép prompt"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={videoPlayerOpen}
                onOpenChange={(open) => {
                  setVideoPlayerOpen(open);
                  if (!open) setActiveVideoPlayer(null);
                }}
              >
                <DialogContent className="max-w-[min(96vw,920px)] border-white/20 bg-slate-900 p-0 text-white gap-0 overflow-hidden sm:rounded-xl">
                  <DialogHeader className="space-y-1 border-b border-white/10 px-4 pb-3 pt-4 sm:px-6 shrink-0">
                    <DialogTitle className="text-left text-white pr-8 text-base leading-snug">
                      {activeVideoPlayer?.title ?? "Video mẫu"}
                    </DialogTitle>
                    {activeVideoPlayer?.tag?.trim() ? (
                      <p className="text-left text-sm text-slate-400">{activeVideoPlayer.tag.trim()}</p>
                    ) : null}
                  </DialogHeader>
                  <div className="bg-black px-3 py-4 sm:px-6">
                    {activeVideoPlayer ? (
                      (() => {
                        const parsed = parseVideoPlayback(activeVideoPlayer.videoUrl);
                        if (parsed.kind === "youtube" || parsed.kind === "vimeo") {
                          return (
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-xl ring-1 ring-white/10">
                              <iframe
                                src={parsed.embedSrc}
                                title={activeVideoPlayer.title}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                              />
                            </div>
                          );
                        }
                        if (parsed.kind === "direct") {
                          return (
                            <video
                              src={parsed.src}
                              controls
                              playsInline
                              className="mx-auto max-h-[min(70vh,560px)] w-full rounded-lg bg-black"
                            >
                              Trình duyệt không hỗ trợ phát video trực tiếp.
                            </video>
                          );
                        }
                        return (
                          <div className="rounded-lg border border-white/15 bg-slate-950/80 p-6 text-center text-sm text-slate-200">
                            <p className="mb-4">Không nhúng được trực tiếp định dạng này. Mở liên kết gốc để xem.</p>
                            <Button asChild className="bg-white text-slate-900 hover:bg-white/90">
                              <a href={parsed.href} target="_blank" rel="noopener noreferrer">
                                Mở video trong tab mới
                              </a>
                            </Button>
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                  <DialogFooter className="border-t border-white/10 px-4 py-3 sm:px-6 shrink-0">
                    <Button
                      type="button"
                      className="bg-white text-slate-900 hover:bg-white/90"
                      onClick={() => setVideoPlayerOpen(false)}
                    >
                      Đóng
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
          </SectionReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}