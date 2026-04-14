"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Lightbulb, Sparkles, Target, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPromptTemplates } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type PromptCategory = {
  id: string;
  genre: string;
  prompts: string[];
};

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
    prompts: [],
  },
  {
    id: "marketing",
    genre: "Kinh doanh & Marketing",
    prompts: [
      "Bạn là chuyên gia marketing. Hãy lập kế hoạch nội dung Facebook 7 ngày cho shop mỹ phẩm thiên nhiên, mục tiêu tăng inbox.",
      "Viết 5 mẫu caption bán hàng ngắn, giọng thân thiện, có CTA rõ ràng cho sản phẩm [tên sản phẩm].",
      "Phân tích tệp khách hàng mục tiêu cho dịch vụ thiết kế website tại Việt Nam theo 3 nhóm chính.",
    ],
  },
  {
    id: "study",
    genre: "Học tập & Công việc",
    prompts: [
      "Bạn là gia sư tiếng Anh. Tạo lộ trình học giao tiếp 30 ngày cho người mới bắt đầu, mỗi ngày 30 phút.",
      "Tóm tắt nội dung dưới đây thành 5 ý chính và đặt 3 câu hỏi kiểm tra hiểu bài: [dán nội dung].",
      "Giúp tôi viết email chuyên nghiệp xin gia hạn deadline, lịch sự và ngắn gọn.",
    ],
  },
  {
    id: "creative",
    genre: "Sáng tạo nội dung",
    prompts: [
      "Viết kịch bản video TikTok 45 giây về mẹo tiết kiệm thời gian cho dân văn phòng, giọng vui vẻ.",
      "Viết một câu chuyện ngắn truyền cảm hứng về thói quen kỷ luật bản thân, kết thúc có thông điệp tích cực.",
      "Tạo 10 tiêu đề blog hấp dẫn cho chủ đề học AI cho người mới.",
    ],
  },
  {
    id: "tech",
    genre: "Công nghệ & Lập trình",
    prompts: [
      "Giải thích REST API cho người mới bằng ví dụ đời thường và minh họa bằng JSON.",
      "Review đoạn code sau, chỉ ra lỗi tiềm ẩn và đề xuất phiên bản tối ưu hơn: [dán code].",
      "Tạo checklist triển khai website lên VPS an toàn cho production.",
    ],
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

  useEffect(() => {
    const loadPrompts = async () => {
      setLoadingPrompts(true);
      try {
        const res = await fetchPromptTemplates();
        const grouped = new Map<string, string[]>();
        res.data.forEach((p) => {
          const category = (p.category || "Khác").trim();
          if (!grouped.has(category)) grouped.set(category, []);
          grouped.get(category)!.push(p.content);
        });

        if (grouped.size > 0) {
          const dynamicCategories: PromptCategory[] = [
            { id: "all", genre: "Tất cả", prompts: [] },
            ...Array.from(grouped.entries()).map(([genre, prompts]) => ({
              id: genre.toLowerCase().replace(/\s+/g, "-"),
              genre,
              prompts,
            })),
          ];
          setPromptCategories(dynamicCategories);
        } else {
          setPromptCategories(fallbackPromptCategories);
        }
      } catch (e: any) {
        setPromptCategories(fallbackPromptCategories);
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
      cat.prompts.map((prompt) => ({
        categoryId: cat.id,
        categoryName: cat.genre,
        prompt,
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

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
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
            <TabsList className="grid grid-cols-2 w-full max-w-xl mx-auto bg-white/10 border border-white/20 shadow-xl">
              <TabsTrigger value="guide" className="text-white data-[state=active]:bg-white data-[state=active]:text-slate-900">
                <Lightbulb className="w-4 h-4 mr-2" />
                Hướng dẫn nhanh
              </TabsTrigger>
              <TabsTrigger value="library" className="text-white data-[state=active]:bg-white data-[state=active]:text-slate-900">
                <Wand2 className="w-4 h-4 mr-2" />
                Thư viện prompt
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedPromptItems.map((item, idx) => (
                      <Card
                        key={`${item.categoryId}-${idx}-${item.prompt.slice(0, 20)}`}
                        className="bg-white/95 border-white/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border border-indigo-200">
                              {item.categoryName}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              #{(currentPage - 1) * promptsPerPage + idx + 1}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed min-h-[72px]">{item.prompt}</p>
                          <div className="mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyPrompt(item.prompt)}
                              className="text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {copiedPrompt === item.prompt ? "Đã sao chép" : "Sao chép prompt"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
}