import type { AiTool } from "@/data/ai-tools";
import { AI_TOOLS } from "@/data/ai-tools";
import { resolveApiAssetUrl } from "@/lib/api";

export type AiGuideFeature = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  bullets: string[];
  imageTitle: string;
  imageCaption: string;
};

export type AiGuide = {
  slug: string;
  toolId: string;
  name?: string;
  category: string;
  subtitle: string;
  description: string;
  audience: string[];
  logoUrl?: string | null;
  features: AiGuideFeature[];
};

export function getAiGuideTool(
  guide: Pick<AiGuide, "toolId" | "name" | "logoUrl">
): AiTool {
  const found = AI_TOOLS.find((item) => item.id === guide.toolId);
  const rawLogo = guide.logoUrl?.trim();
  const logo = rawLogo ? resolveApiAssetUrl(rawLogo) : undefined;

  if (found) {
    return logo ? { ...found, logo } : found;
  }

  return {
    id: guide.toolId,
    name: guide.name?.trim() || guide.toolId,
    website: "",
    categoryId: "chat",
    useCase: "",
    logo,
  };
}

export const AI_GUIDES: AiGuide[] = [
  {
    slug: "chatgpt",
    toolId: "chatgpt",
    category: "Trợ lý đa năng",
    subtitle: "Viết, phân tích, lập kế hoạch và hỗ trợ công việc mỗi ngày.",
    description:
      "ChatGPT phù hợp cho người mới bắt đầu lẫn người làm nội dung, marketing, vận hành và học tập. Bạn có thể dùng để hỏi đáp nhanh, tạo bản nháp, phân tích tài liệu và tối ưu quy trình làm việc.",
    audience: ["Người mới học AI", "Marketing", "Chủ shop", "Nhân viên văn phòng"],
    features: [
      {
        id: "chat",
        title: "Chat hỏi đáp và brainstorming",
        summary: "Đặt câu hỏi, xin ý tưởng và nhận câu trả lời có cấu trúc rõ ràng.",
        detail:
          "Khi bạn chưa biết bắt đầu từ đâu, hãy mô tả ngữ cảnh, mục tiêu và kết quả mong muốn. ChatGPT sẽ giúp bạn đề xuất hướng làm, đặt câu hỏi ngược để làm rõ vấn đề và chia nhỏ công việc thành từng bước thực hiện.",
        bullets: [
          "Dùng prompt có ngữ cảnh: vai trò, mục tiêu, đầu ra mong muốn",
          "Yêu cầu trả lời theo checklist, bảng hoặc kế hoạch từng bước",
          "Tiếp tục đào sâu bằng câu hỏi phụ thay vì mở chat mới",
        ],
        imageTitle: "Minh họa hội thoại",
        imageCaption: "Một phiên chat tốt nên có bối cảnh, mục tiêu và định dạng đầu ra rõ ràng.",
      },
      {
        id: "writing",
        title: "Soạn nội dung và chỉnh văn phong",
        summary: "Tạo caption, email, kịch bản, mô tả sản phẩm và tối ưu giọng văn.",
        detail:
          "Bạn có thể dùng ChatGPT để viết từ bản nháp đầu tiên đến phiên bản hoàn chỉnh. Hãy cung cấp đối tượng người đọc, độ dài, giọng điệu và ví dụ mẫu nếu có để kết quả sát nhu cầu hơn.",
        bullets: [
          "Viết nhiều phiên bản để so sánh góc tiếp cận",
          "Nhờ AI rút gọn, lịch sự hơn hoặc bán hàng hơn",
          "Tái sử dụng một nội dung gốc cho nhiều nền tảng khác nhau",
        ],
        imageTitle: "Luồng viết nội dung",
        imageCaption: "Từ ý tưởng ban đầu, AI có thể mở rộng thành bản nháp rồi tinh chỉnh theo giọng thương hiệu.",
      },
      {
        id: "analysis",
        title: "Phân tích tài liệu và tóm tắt",
        summary: "Đọc văn bản dài, rút ý chính và chuyển thành hành động cụ thể.",
        detail:
          "Với nội dung dài như biên bản họp, quy trình hay tài liệu hướng dẫn, bạn có thể dán vào ChatGPT và yêu cầu tóm tắt, chỉ ra rủi ro, đầu việc tiếp theo hoặc viết lại theo ngôn ngữ dễ hiểu.",
        bullets: [
          "Tóm tắt theo cấp độ: ngắn, trung bình, chi tiết",
          "Rút ra checklist hành động sau khi đọc tài liệu",
          "Biến tài liệu dài thành FAQ hoặc SOP dễ dùng",
        ],
        imageTitle: "Khung phân tích tài liệu",
        imageCaption: "AI giúp rút ý chính, đầu việc và lưu ý quan trọng từ tài liệu dài.",
      },
    ],
  },
  {
    slug: "gemini",
    toolId: "gemini",
    category: "Hệ sinh thái Google",
    subtitle: "Hỏi đáp, nghiên cứu và làm việc cùng Gmail, Docs, Sheets, Drive.",
    description:
      "Gemini phù hợp với người làm việc nhiều trong hệ sinh thái Google. Điểm mạnh là kết nối ngữ cảnh từ các công cụ quen thuộc và hỗ trợ tìm kiếm, tóm tắt, đề xuất nội dung rất nhanh.",
    audience: ["Người dùng Google Workspace", "Giáo viên", "Nhân sự", "Freelancer"],
    features: [
      {
        id: "workspace",
        title: "Hỗ trợ Gmail, Docs và Sheets",
        summary: "Tạo email, chỉnh tài liệu và phân tích bảng dữ liệu nhanh hơn.",
        detail:
          "Gemini hỗ trợ bạn viết email chuyên nghiệp, tóm tắt tài liệu trong Docs và gợi ý xử lý dữ liệu trong Sheets. Điều này đặc biệt hữu ích khi bạn cần hoàn thành công việc văn phòng với tốc độ cao.",
        bullets: [
          "Viết email chăm sóc khách hàng hoặc follow-up",
          "Tóm tắt nội dung tài liệu dài trong Google Docs",
          "Đề xuất công thức hoặc cách trình bày dữ liệu trong Sheets",
        ],
        imageTitle: "Không gian làm việc Google",
        imageCaption: "Gemini phát huy tốt khi bạn đang làm việc trực tiếp với Gmail, Docs, Sheets và Drive.",
      },
      {
        id: "research",
        title: "Nghiên cứu và tìm ý nhanh",
        summary: "Tóm tắt chủ đề, so sánh lựa chọn và phác thảo góc nhìn.",
        detail:
          "Khi cần nghiên cứu một chủ đề mới, Gemini có thể giúp bạn tổng hợp nhanh, chia thành các nhóm ý chính và gợi ý những câu hỏi tiếp theo để đào sâu thông tin.",
        bullets: [
          "So sánh nhiều lựa chọn trong cùng một câu trả lời",
          "Tạo dàn ý nghiên cứu hoặc nội dung đào tạo",
          "Rút ngắn thời gian đọc và ghi chú ban đầu",
        ],
        imageTitle: "Bản đồ ý tưởng",
        imageCaption: "Hữu ích khi bạn cần nhìn tổng quan một chủ đề trước khi hành động.",
      },
      {
        id: "multimodal",
        title: "Nhận diện ngữ cảnh đa phương thức",
        summary: "Đọc ảnh, hiểu nội dung và hỗ trợ giải thích trực quan.",
        detail:
          "Gemini mạnh ở việc kết hợp văn bản với hình ảnh hoặc tài liệu từ hệ sinh thái Google. Bạn có thể dùng để giải thích hình ảnh, đọc nội dung trên ảnh hay rút thông tin từ biểu đồ, slide.",
        bullets: [
          "Giải thích ảnh chụp màn hình hoặc slide",
          "Biến hình ảnh thành ghi chú ngắn gọn",
          "Hỗ trợ học tập với biểu đồ và sơ đồ trực quan",
        ],
        imageTitle: "Phân tích ảnh và slide",
        imageCaption: "Tận dụng hình ảnh để AI giải thích ngữ cảnh dễ hiểu hơn.",
      },
    ],
  },
  {
    slug: "grok",
    toolId: "grok",
    category: "Tin tức và góc nhìn nhanh",
    subtitle: "Theo dõi xu hướng, hỏi đáp nhanh và khai thác nội dung thời sự.",
    description:
      "Grok phù hợp khi bạn muốn cập nhật góc nhìn mới, theo dõi xu hướng hoặc lấy ý tưởng từ các chủ đề đang được quan tâm. Đây là lựa chọn hữu ích cho social, nội dung và quan sát thị trường.",
    audience: ["Social media", "Content creator", "Người theo dõi xu hướng", "Nghiên cứu thị trường"],
    features: [
      {
        id: "trends",
        title: "Theo dõi xu hướng đang nổi",
        summary: "Nhanh chóng nắm bắt chủ đề, từ khóa và góc nhìn nổi bật.",
        detail:
          "Khi cần theo dõi thị trường hoặc chủ đề đang nóng, Grok giúp bạn tóm tắt các ý chính, xu hướng tranh luận và những góc tiếp cận có thể triển khai thành nội dung hoặc báo cáo nội bộ.",
        bullets: [
          "Tóm tắt nhanh một xu hướng đang lên",
          "Gợi ý tiêu đề, hook hoặc angle nội dung",
          "Nhận diện chủ đề nào đang được quan tâm nhiều",
        ],
        imageTitle: "Bảng xu hướng",
        imageCaption: "Phù hợp để tìm chủ đề nội dung hoặc theo dõi biến động thị trường.",
      },
      {
        id: "social",
        title: "Ý tưởng social theo thời điểm",
        summary: "Biến thông tin đang nóng thành caption, post hoặc kịch bản ngắn.",
        detail:
          "Bạn có thể đưa một chủ đề thời sự hoặc trào lưu vào Grok để xin danh sách góc viết, caption khác nhau và cách điều chỉnh cho từng nền tảng như Facebook, TikTok hay X.",
        bullets: [
          "Lên caption nhiều tông giọng khác nhau",
          "Đổi 1 ý tưởng thành nhiều định dạng bài đăng",
          "Tạo hook ngắn để tăng khả năng thu hút",
        ],
        imageTitle: "Tái chế nội dung social",
        imageCaption: "Một chủ đề có thể được chuyển thành nhiều bài đăng phù hợp từng nền tảng.",
      },
      {
        id: "qa",
        title: "Hỏi đáp nhanh theo ngữ cảnh hiện tại",
        summary: "Đặt câu hỏi ngắn để có câu trả lời đủ ý, dễ hành động.",
        detail:
          "Grok hữu ích khi bạn không cần phân tích quá sâu mà cần câu trả lời nhanh để ra quyết định, đặc biệt với các chủ đề có tính thời điểm hoặc cần phản ứng sớm.",
        bullets: [
          "Lấy bản tóm tắt cực nhanh của một vấn đề",
          "Gợi ý hướng phản hồi hoặc thông điệp chính",
          "Hỗ trợ ra quyết định bước đầu",
        ],
        imageTitle: "Bảng trả lời nhanh",
        imageCaption: "Thích hợp cho các trường hợp cần tốc độ hơn là quy trình phân tích dài.",
      },
    ],
  },
  {
    slug: "notebooklm",
    toolId: "notebooklm",
    category: "Học tập và nghiên cứu",
    subtitle: "Đọc tài liệu, tổng hợp ghi chú và xây dựng tri thức từ nguồn riêng.",
    description:
      "NotebookLM nổi bật ở việc học và nghiên cứu theo bộ tài liệu của riêng bạn. Bạn có thể nạp nhiều nguồn, đặt câu hỏi dựa trên dữ liệu đó và tạo ghi chú có cấu trúc.",
    audience: ["Sinh viên", "Nghiên cứu", "Đào tạo nội bộ", "Người làm tài liệu"],
    features: [
      {
        id: "sources",
        title: "Làm việc theo bộ tài liệu nguồn",
        summary: "Tải tài liệu lên và đặt câu hỏi dựa trên đúng nguồn của bạn.",
        detail:
          "Thay vì hỏi AI chung chung, NotebookLM cho phép bạn tập trung vào một nhóm tài liệu cụ thể. Điều này giúp câu trả lời bám sát nguồn, hữu ích cho học tập, báo cáo hoặc đào tạo.",
        bullets: [
          "Hỏi đáp xoay quanh đúng tài liệu đã tải lên",
          "Giảm lệch ngữ cảnh khi làm việc theo dự án",
          "Phù hợp cho tài liệu nội bộ hoặc học thuật",
        ],
        imageTitle: "Không gian tài liệu nguồn",
        imageCaption: "Mọi câu hỏi và câu trả lời đều xoay quanh tập tài liệu mà bạn cung cấp.",
      },
      {
        id: "summary",
        title: "Tóm tắt và tạo ghi chú",
        summary: "Biến tài liệu dài thành ghi chú ngắn, mục tiêu học và câu hỏi ôn tập.",
        detail:
          "Bạn có thể dùng NotebookLM để rút gọn tài liệu dài, biến chúng thành ghi chú súc tích hoặc tạo bộ câu hỏi để tự học, ôn thi hay hướng dẫn lại cho người khác.",
        bullets: [
          "Tạo bản tóm tắt theo từng chương hoặc từng chủ đề",
          "Sinh câu hỏi ôn tập và checklist ghi nhớ",
          "Dùng làm nền để viết tài liệu đào tạo",
        ],
        imageTitle: "Ghi chú học tập",
        imageCaption: "Từ tài liệu gốc, AI tạo ra ghi chú và bộ câu hỏi dễ tiêu hóa hơn.",
      },
      {
        id: "connections",
        title: "Kết nối ý giữa nhiều nguồn",
        summary: "So sánh, liên kết và tìm điểm giống nhau giữa các tài liệu.",
        detail:
          "Khi bạn phải đọc nhiều nguồn khác nhau, NotebookLM giúp phát hiện chủ đề chung, điểm khác biệt và các kết nối hữu ích để hình thành góc nhìn tổng hợp.",
        bullets: [
          "So sánh giữa nhiều tài liệu hoặc bài nghiên cứu",
          "Phát hiện phần trùng lặp và mâu thuẫn",
          "Tạo khung hiểu biết tổng hợp từ nhiều nguồn",
        ],
        imageTitle: "Sơ đồ liên kết kiến thức",
        imageCaption: "Rất phù hợp cho nghiên cứu, đào tạo hoặc tổng hợp kiến thức phức tạp.",
      },
    ],
  },
];

export function getAiGuideBySlug(slug: string): AiGuide | undefined {
  return AI_GUIDES.find((guide) => guide.slug === slug);
}
