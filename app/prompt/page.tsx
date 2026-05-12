"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  useEffect(() => {
    const loadPrompts = async () => {
      setLoadingPrompts(true);
      try {
        const res = await fetchPromptTemplates();
        const grouped = new Map<string, PromptEntry[]>();
        res.data.forEach((p: PromptTemplateItem) => {
          if (p.kind === "image") return;
          const category = (p.category || "Khác").trim();
          if (!grouped.has(category)) grouped.set(category, []);
          const title = p.title?.trim() ? p.title.trim() : null;
          grouped.get(category)!.push({
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

        setImageCardsFromApi(apiImageCards.length > 0);
        setImagePromptList(apiImageCards.length > 0 ? apiImageCards : imagePromptSamples);

        if (grouped.size > 0) {
          const dynamicCategories: PromptCategory[] = [
            { id: "all", genre: "Tất cả", entries: [] },
            ...Array.from(grouped.entries()).map(([genre, entries]) => ({
              id: genre.toLowerCase().replace(/\s+/g, "-"),
              genre,
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
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl animate-float" />
        <div className="absolute top-48 -right-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl [animation-duration:4s] animate-float" />

        <section className="relative z-10 container-max section-padding py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <Badge className="mb-4 bg-white/15 text-white border-white/20 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Thư viện Prompt cho khách hàng
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Hướng dẫn dùng Prompt AI
              <span className="block bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent mt-2">
                nhanh, đúng, hiệu quả
              </span>
            </h1>
            <p className="mt-5 text-slate-200 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              Tổng hợp mẫu prompt thực tế để khách hàng copy và dùng ngay cho học tập,
              công việc, marketing và sáng tạo nội dung.
            </p>
          </div>
        </section>

        <section className="relative z-10 container-max section-padding pb-16">
          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="grid h-auto w-full max-w-3xl mx-auto grid-cols-1 gap-2 bg-white/10 border border-white/20 shadow-xl p-2 sm:grid-cols-3 sm:gap-0">
              <TabsTrigger
                value="guide"
                className="text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 gap-2 py-2.5"
              >
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="text-sm">Hướng dẫn nhanh</span>
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 gap-2 py-2.5"
              >
                <Wand2 className="w-4 h-4 shrink-0" />
                <span className="text-sm">Thư viện prompt</span>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 gap-2 py-2.5"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="text-sm">Hình ảnh</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guideSteps.map((step, idx) => (
                  <Card key={step.title} className="border-white/20 bg-white/10 backdrop-blur text-white transition-all duration-300 hover:bg-white/15 hover:shadow-2xl hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-white/20 w-7 h-7 text-sm font-bold">
                          {idx + 1}
                        </span>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-200">
                      {step.desc}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 border-emerald-300/30 bg-emerald-500/10 backdrop-blur text-white animate-fade-in">
                <CardContent className="p-5 text-sm sm:text-base">
                  <p className="font-semibold flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4" />
                    Mẹo quan trọng
                  </p>
                  <p className="text-emerald-100">
                    Prompt càng cụ thể thì kết quả càng đúng ý. Hãy thêm: vai trò AI + mục tiêu + đối tượng + định dạng đầu ra.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="mt-8 space-y-5">
              <Card className="bg-white/10 border-white/20 backdrop-blur shadow-xl animate-fade-in">
                <CardContent className="p-4 flex flex-wrap gap-2">
                  {promptCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`transition-all duration-200 ${
                        selectedCategory === cat.id
                          ? "bg-white text-slate-900 hover:bg-white/90"
                          : "bg-transparent border-white/30 text-white hover:bg-white/15 hover:border-white/60"
                      }`}
                    >
                      {cat.genre}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {loadingPrompts && (
                <Card className="bg-white/95 border-white/30 shadow-xl">
                  <CardContent className="p-6 text-slate-600">Đang tải thư viện prompt...</CardContent>
                </Card>
              )}

              {!loadingPrompts && filteredPromptItems.length === 0 && (
                <Card className="bg-white/95 border-white/30 shadow-xl">
                  <CardContent className="p-8 text-center text-slate-600">
                    Chưa có prompt trong thể loại này.
                  </CardContent>
                </Card>
              )}

              {!loadingPrompts && filteredPromptItems.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {paginatedPromptItems.map((item, idx) => {
                      const fullCopy = copyTextForPrompt(item.title, item.content);
                      return (
                      <Card
                        key={item.id != null ? `p-${item.id}` : `${item.categoryId}-${idx}-${item.content.slice(0, 20)}`}
                        className="flex h-full min-h-0 flex-col bg-white/95 border-white/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in"
                        style={{ animationDelay: `${idx * 60}ms` }}
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
                    );
                    })}
                  </div>

                  <Card className="bg-white/10 border-white/20 backdrop-blur shadow-xl">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-sm text-slate-100">
                        Trang <span className="font-semibold">{currentPage}</span> / {totalPages} - Hiển thị {paginatedPromptItems.length} / {filteredPromptItems.length} prompt
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="bg-transparent border-white/30 text-white hover:bg-white/15"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="bg-transparent border-white/30 text-white hover:bg-white/15"
                        >
                          Sau
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="images" className="mt-8">
              <p className="mb-6 text-center text-sm text-slate-300 max-w-2xl mx-auto">
                Dùng <span className="font-medium text-slate-200">Phóng to ảnh</span> để xem rõ ảnh mẫu;{" "}
                <span className="font-medium text-slate-200">Xem Prompt</span> để đọc và sao chép prompt.
                {imageCardsFromApi ? (
                  <span className="block mt-1 text-slate-400 text-xs">
                    Nội dung do cửa hàng cập nhật từ trang quản trị.
                  </span>
                ) : null}
              </p>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {imagePromptList.map((sample, idx) => (
                  <Card
                    key={sample.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-violet-200/60 bg-[#ebe8f4] shadow-md shadow-violet-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-950/15 animate-fade-in"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <CardContent className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
                      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
                        <div className="overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-100/80">
                          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh mẫu từ host bên ngoài */}
                          <img
                            src={resolveApiAssetUrl(sample.imageSrc)}
                            alt={sample.title}
                            className="aspect-[3/4] w-full object-cover"
                            loading="lazy"
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveApiAssetUrl(zoomImageSample.imageSrc)}
                        alt={zoomImageSample.title}
                        className="h-auto max-h-full w-auto max-w-full rounded-md object-contain shadow-xl"
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
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
}