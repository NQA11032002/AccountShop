export type AiToolCategory = {
  id: string;
  name: string;
  description: string;
};

export type AiTool = {
  id: string;
  name: string;
  website: string;
  categoryId: string;
  /** Phù hợp cho lĩnh vực / công việc gì */
  useCase: string;
  /** Logo tùy chỉnh (URL). Bỏ trống thì tự lấy favicon từ website. */
  logo?: string;
  /** Mô tả ngắn (tùy chọn) */
  note?: string;
};

export const AI_TOOL_CATEGORIES: AiToolCategory[] = [
  {
    id: "chat",
    name: "Trò chuyện & Trợ lý",
    description: "Hỏi đáp, brainstorm, phân tích và hỗ trợ công việc hàng ngày",
  },
  {
    id: "writing",
    name: "Viết lách & Nội dung",
    description: "Soạn thảo, chỉnh sửa, copywriting và sản xuất nội dung",
  },
  {
    id: "image",
    name: "Hình ảnh & Thiết kế",
    description: "Tạo ảnh AI, thiết kế banner, poster, mockup và visual",
  },
  {
    id: "video",
    name: "Video & Âm thanh",
    description: "Tạo video, avatar, lồng tiếng, nhạc và chỉnh sửa media",
  },
  {
    id: "coding",
    name: "Lập trình & Phát triển",
    description: "Viết code, debug, review và tăng tốc phát triển phần mềm",
  },
  {
    id: "marketing",
    name: "Marketing & Kinh doanh",
    description: "Quảng cáo, social media, email marketing và bán hàng",
  },
  {
    id: "research",
    name: "Học tập & Nghiên cứu",
    description: "Tóm tắt tài liệu, tra cứu học thuật và ghi chú thông minh",
  },
  {
    id: "productivity",
    name: "Năng suất & Văn phòng",
    description: "Slide, họp, ghi chú và tự động hóa quy trình làm việc",
  },
];

export const AI_TOOLS: AiTool[] = [
  // Trò chuyện & Trợ lý
  {
    id: "chatgpt",
    name: "ChatGPT",
    website: "https://chat.openai.com",
    categoryId: "chat",
    useCase: "Trò chuyện đa năng, viết nội dung, phân tích, lập kế hoạch",
    note: "OpenAI",
  },
  {
    id: "claude",
    name: "Claude",
    website: "https://claude.ai",
    categoryId: "chat",
    useCase: "Viết dài, phân tích tài liệu, coding, trợ lý chuyên sâu",
    note: "Anthropic",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    website: "https://gemini.google.com",
    categoryId: "chat",
    useCase: "Tìm kiếm, tóm tắt, tích hợp Google Workspace",
    note: "Google",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    website: "https://copilot.microsoft.com",
    categoryId: "chat",
    useCase: "Hỏi đáp, tìm kiếm web, hỗ trợ Word/Excel/PowerPoint",
    note: "Microsoft",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    website: "https://www.perplexity.ai",
    categoryId: "chat",
    useCase: "Tìm kiếm có trích dẫn nguồn, nghiên cứu nhanh",
  },
  {
    id: "grok",
    name: "Grok",
    website: "https://grok.com",
    categoryId: "chat",
    useCase: "Trò chuyện, cập nhật tin tức và thông tin thời sự",
    note: "xAI",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    website: "https://chat.deepseek.com",
    categoryId: "chat",
    useCase: "Chat, suy luận logic, coding và phân tích dữ liệu",
    note: "DeepSeek",
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    website: "https://www.meta.ai",
    categoryId: "chat",
    useCase: "Trò chuyện, tạo ảnh nhanh, tích hợp Facebook/Instagram/WhatsApp",
    note: "Meta",
  },
  {
    id: "mistral",
    name: "Le Chat",
    website: "https://chat.mistral.ai",
    categoryId: "chat",
    useCase: "Chat đa ngôn ngữ, phân tích và hỗ trợ công việc",
    note: "Mistral AI",
  },
  {
    id: "poe",
    name: "Poe",
    website: "https://poe.com",
    categoryId: "chat",
    useCase: "Dùng nhiều model AI (GPT, Claude, Gemini…) trong một app",
    note: "Quora",
  },
  {
    id: "pi",
    name: "Pi",
    website: "https://pi.ai",
    categoryId: "chat",
    useCase: "Trò chuyện thân thiện, coaching và brainstorm cá nhân",
    note: "Inflection AI",
  },
  {
    id: "qwen",
    name: "Qwen Chat",
    website: "https://chat.qwen.ai",
    categoryId: "chat",
    useCase: "Chat đa năng, hỗ trợ tiếng Việt và nhiều ngôn ngữ",
    note: "Alibaba",
  },
  {
    id: "character-ai",
    name: "Character.AI",
    website: "https://character.ai",
    categoryId: "chat",
    useCase: "Chat với nhân vật AI, roleplay và sáng tạo hội thoại",
  },

  // Viết lách & Nội dung
  {
    id: "notion-ai",
    name: "Notion AI",
    website: "https://www.notion.so/product/ai",
    categoryId: "writing",
    useCase: "Ghi chú, viết blog, tóm tắt và quản lý dự án",
  },
  {
    id: "grammarly",
    name: "Grammarly",
    website: "https://www.grammarly.com",
    categoryId: "writing",
    useCase: "Chỉnh sửa ngữ pháp, tone văn bản tiếng Anh",
  },
  {
    id: "jasper",
    name: "Jasper",
    website: "https://www.jasper.ai",
    categoryId: "writing",
    useCase: "Copywriting marketing, quảng cáo, email bán hàng",
  },
  {
    id: "copy-ai",
    name: "Copy.ai",
    website: "https://www.copy.ai",
    categoryId: "writing",
    useCase: "Caption social, mô tả sản phẩm, nội dung ngắn",
  },
  {
    id: "writesonic",
    name: "Writesonic",
    website: "https://writesonic.com",
    categoryId: "writing",
    useCase: "Blog SEO, landing page, quảng cáo và nội dung dài",
  },
  {
    id: "quillbot",
    name: "QuillBot",
    website: "https://quillbot.com",
    categoryId: "writing",
    useCase: "Paraphrase, kiểm tra ngữ pháp và cải thiện văn bản",
  },
  {
    id: "wordtune",
    name: "Wordtune",
    website: "https://www.wordtune.com",
    categoryId: "writing",
    useCase: "Viết lại câu, điều chỉnh tone và làm rõ ý",
  },
  {
    id: "rytr",
    name: "Rytr",
    website: "https://rytr.me",
    categoryId: "writing",
    useCase: "Viết nhanh email, blog, quảng cáo với template sẵn",
  },
  {
    id: "sudowrite",
    name: "Sudowrite",
    website: "https://www.sudowrite.com",
    categoryId: "writing",
    useCase: "Viết tiểu thuyết, kịch bản và sáng tạo văn học",
  },

  // Hình ảnh & Thiết kế
  {
    id: "midjourney",
    name: "Midjourney",
    website: "https://www.midjourney.com",
    categoryId: "image",
    useCase: "Tạo ảnh nghệ thuật, concept art, poster chất lượng cao",
  },
  {
    id: "dalle",
    name: "DALL·E",
    website: "https://openai.com/dall-e-3",
    categoryId: "image",
    useCase: "Tạo ảnh từ mô tả văn bản, chỉnh sửa ảnh nhanh",
    note: "OpenAI",
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    website: "https://leonardo.ai",
    categoryId: "image",
    useCase: "Ảnh game, nhân vật, asset thiết kế và fine-tune model",
  },
  {
    id: "canva",
    name: "Canva AI",
    website: "https://www.canva.com/ai-image-generator",
    categoryId: "image",
    useCase: "Thiết kế banner, post social, slide có template sẵn",
  },
  {
    id: "meigen",
    name: "Meigen.ai",
    website: "https://www.meigen.ai",
    categoryId: "image",
    useCase: "Thư viện prompt ảnh, tham khảo style và cảnh quay",
  },
  {
    id: "firefly",
    name: "Adobe Firefly",
    website: "https://firefly.adobe.com",
    categoryId: "image",
    useCase: "Tạo ảnh thương mại, chỉnh sửa trong hệ sinh thái Adobe",
    note: "Adobe",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    website: "https://stability.ai",
    categoryId: "image",
    useCase: "Tạo ảnh mã nguồn mở, tùy biến model cao",
    note: "Stability AI",
  },
  {
    id: "flux",
    name: "Flux",
    website: "https://blackforestlabs.ai",
    categoryId: "image",
    useCase: "Tạo ảnh chất lượng cao, chữ trong ảnh rõ nét",
    note: "Black Forest Labs",
  },
  {
    id: "ideogram",
    name: "Ideogram",
    website: "https://ideogram.ai",
    categoryId: "image",
    useCase: "Poster, typography và thiết kế có chữ đẹp",
  },
  {
    id: "recraft",
    name: "Recraft",
    website: "https://www.recraft.ai",
    categoryId: "image",
    useCase: "Vector, icon, illustration và brand visual",
  },
  {
    id: "photoroom",
    name: "Photoroom",
    website: "https://www.photoroom.com",
    categoryId: "image",
    useCase: "Xóa nền, mockup sản phẩm và ảnh bán hàng",
  },
  {
    id: "remove-bg",
    name: "Remove.bg",
    website: "https://www.remove.bg",
    categoryId: "image",
    useCase: "Xóa phông nền ảnh tự động, nhanh cho e-commerce",
  },
  {
    id: "bing-image",
    name: "Bing Image Creator",
    website: "https://www.bing.com/images/create",
    categoryId: "image",
    useCase: "Tạo ảnh miễn phí từ prompt, tích hợp DALL·E",
    note: "Microsoft",
  },
  {
    id: "pixlr",
    name: "Pixlr AI",
    website: "https://pixlr.com",
    categoryId: "image",
    useCase: "Chỉnh sửa ảnh online, filter và generative fill",
  },

  // Video & Âm thanh
  {
    id: "runway",
    name: "Runway",
    website: "https://runwayml.com",
    categoryId: "video",
    useCase: "Text-to-video, chỉnh sửa video và hiệu ứng AI",
  },
  {
    id: "pika",
    name: "Pika",
    website: "https://pika.art",
    categoryId: "video",
    useCase: "Tạo clip ngắn, animation và hiệu ứng chuyển động",
  },
  {
    id: "kling",
    name: "Kling AI",
    website: "https://klingai.com",
    categoryId: "video",
    useCase: "Video từ prompt, cảnh quay điện ảnh",
  },
  {
    id: "heygen",
    name: "HeyGen",
    website: "https://www.heygen.com",
    categoryId: "video",
    useCase: "Avatar nói chuyện, video giới thiệu sản phẩm đa ngôn ngữ",
  },
  {
    id: "capcut",
    name: "CapCut AI",
    website: "https://www.capcut.com",
    categoryId: "video",
    useCase: "Edit video nhanh, phụ đề, hiệu ứng cho TikTok/Reels",
  },
  {
    id: "suno",
    name: "Suno",
    website: "https://suno.com",
    categoryId: "video",
    useCase: "Tạo nhạc và bài hát từ mô tả văn bản",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    website: "https://elevenlabs.io",
    categoryId: "video",
    useCase: "Giọng nói AI, lồng tiếng và clone voice",
  },
  {
    id: "sora",
    name: "Sora",
    website: "https://openai.com/sora",
    categoryId: "video",
    useCase: "Text-to-video chất lượng cao, cảnh quay điện ảnh",
    note: "OpenAI",
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    website: "https://lumalabs.ai",
    categoryId: "video",
    useCase: "Tạo video ngắn từ ảnh hoặc prompt",
    note: "Luma AI",
  },
  {
    id: "invideo",
    name: "InVideo AI",
    website: "https://invideo.io",
    categoryId: "video",
    useCase: "Tạo video marketing, script → video tự động",
  },
  {
    id: "descript",
    name: "Descript",
    website: "https://www.descript.com",
    categoryId: "video",
    useCase: "Edit video/podcast bằng text, overdub giọng nói",
  },
  {
    id: "synthesia",
    name: "Synthesia",
    website: "https://www.synthesia.io",
    categoryId: "video",
    useCase: "Video đào tạo, avatar presenter đa ngôn ngữ",
  },
  {
    id: "udio",
    name: "Udio",
    website: "https://www.udio.com",
    categoryId: "video",
    useCase: "Sáng tác nhạc AI, beat và bài hát đa thể loại",
  },
  {
    id: "murf",
    name: "Murf AI",
    website: "https://murf.ai",
    categoryId: "video",
    useCase: "Voice-over chuyên nghiệp cho video và presentation",
  },
  {
    id: "d-id",
    name: "D-ID",
    website: "https://www.d-id.com",
    categoryId: "video",
    useCase: "Avatar nói từ ảnh tĩnh, video talking head",
  },

  // Lập trình & Phát triển
  {
    id: "cursor",
    name: "Cursor",
    website: "https://cursor.com",
    categoryId: "coding",
    useCase: "IDE AI: viết code, refactor, chat trong project",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    website: "https://github.com/features/copilot",
    categoryId: "coding",
    useCase: "Gợi ý code trong VS Code, JetBrains và GitHub",
    note: "GitHub / Microsoft",
  },
  {
    id: "v0",
    name: "v0",
    website: "https://v0.dev",
    categoryId: "coding",
    useCase: "Sinh UI React/Tailwind từ mô tả giao diện",
    note: "Vercel",
  },
  {
    id: "replit",
    name: "Replit",
    website: "https://replit.com",
    categoryId: "coding",
    useCase: "Code online, deploy nhanh và agent lập trình",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    website: "https://windsurf.com",
    categoryId: "coding",
    useCase: "IDE AI với agent flow, viết và debug code",
    note: "Codeium",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    website: "https://bolt.new",
    categoryId: "coding",
    useCase: "Tạo full-stack app từ prompt trong trình duyệt",
    note: "StackBlitz",
  },
  {
    id: "lovable",
    name: "Lovable",
    website: "https://lovable.dev",
    categoryId: "coding",
    useCase: "Sinh web app React/Supabase từ mô tả tự nhiên",
  },
  {
    id: "tabnine",
    name: "Tabnine",
    website: "https://www.tabnine.com",
    categoryId: "coding",
    useCase: "Autocomplete code, hỗ trợ nhiều ngôn ngữ lập trình",
  },
  {
    id: "amazon-q",
    name: "Amazon Q Developer",
    website: "https://aws.amazon.com/q/developer",
    categoryId: "coding",
    useCase: "Chat coding, review và tích hợp AWS",
    note: "Amazon",
  },
  {
    id: "coderabbit",
    name: "CodeRabbit",
    website: "https://coderabbit.ai",
    categoryId: "coding",
    useCase: "Review pull request tự động trên GitHub/GitLab",
  },

  // Marketing & Kinh doanh
  {
    id: "adcreative",
    name: "AdCreative.ai",
    website: "https://www.adcreative.ai",
    categoryId: "marketing",
    useCase: "Banner quảng cáo Facebook/Google, A/B creative",
  },
  {
    id: "hubspot-ai",
    name: "HubSpot AI",
    website: "https://www.hubspot.com/products/artificial-intelligence",
    categoryId: "marketing",
    useCase: "Email marketing, CRM và nội dung bán hàng",
  },
  {
    id: "manychat",
    name: "ManyChat",
    website: "https://manychat.com",
    categoryId: "marketing",
    useCase: "Chatbot Messenger, Instagram và automation bán hàng",
  },
  {
    id: "semrush",
    name: "Semrush AI",
    website: "https://www.semrush.com",
    categoryId: "marketing",
    useCase: "SEO, phân tích keyword và nội dung marketing",
  },
  {
    id: "mailchimp",
    name: "Mailchimp AI",
    website: "https://mailchimp.com",
    categoryId: "marketing",
    useCase: "Email campaign, automation và gợi ý nội dung",
  },
  {
    id: "taplio",
    name: "Taplio",
    website: "https://taplio.com",
    categoryId: "marketing",
    useCase: "Viết post LinkedIn, lên lịch và phân tích hiệu quả",
  },
  {
    id: "predis",
    name: "Predis.ai",
    website: "https://predis.ai",
    categoryId: "marketing",
    useCase: "Tạo post social, carousel và caption tự động",
  },
  {
    id: "surfer",
    name: "Surfer SEO",
    website: "https://surferseo.com",
    categoryId: "marketing",
    useCase: "Tối ưu bài viết SEO, outline và content score",
  },

  // Học tập & Nghiên cứu
  {
    id: "notebooklm",
    name: "NotebookLM",
    website: "https://notebooklm.google.com",
    categoryId: "research",
    useCase: "Tóm tắt PDF, slide, podcast từ tài liệu upload",
    note: "Google",
  },
  {
    id: "consensus",
    name: "Consensus",
    website: "https://consensus.app",
    categoryId: "research",
    useCase: "Tìm paper khoa học có trích dẫn và tóm tắt",
  },
  {
    id: "elicit",
    name: "Elicit",
    website: "https://elicit.com",
    categoryId: "research",
    useCase: "Review tài liệu học thuật, trích xuất insight",
  },
  {
    id: "scispace",
    name: "SciSpace",
    website: "https://typeset.io",
    categoryId: "research",
    useCase: "Đọc paper, giải thích công thức và hỏi đáp tài liệu",
  },
  {
    id: "chatpdf",
    name: "ChatPDF",
    website: "https://www.chatpdf.com",
    categoryId: "research",
    useCase: "Chat trực tiếp với file PDF, tóm tắt tài liệu",
  },
  {
    id: "humata",
    name: "Humata",
    website: "https://www.humata.ai",
    categoryId: "research",
    useCase: "Phân tích PDF dài, báo cáo và tài liệu kỹ thuật",
  },
  {
    id: "connected-papers",
    name: "Connected Papers",
    website: "https://www.connectedpapers.com",
    categoryId: "research",
    useCase: "Khám phá mối liên hệ giữa các paper khoa học",
  },
  {
    id: "scholarcy",
    name: "Scholarcy",
    website: "https://www.scholarcy.com",
    categoryId: "research",
    useCase: "Tóm tắt paper, flashcard và trích xuất key points",
  },

  // Năng suất & Văn phòng
  {
    id: "gamma",
    name: "Gamma",
    website: "https://gamma.app",
    categoryId: "productivity",
    useCase: "Tạo slide/presentation từ outline hoặc prompt",
  },
  {
    id: "otter",
    name: "Otter.ai",
    website: "https://otter.ai",
    categoryId: "productivity",
    useCase: "Ghi chú cuộc họp, transcript và tóm tắt",
  },
  {
    id: "fireflies",
    name: "Fireflies.ai",
    website: "https://fireflies.ai",
    categoryId: "productivity",
    useCase: "Ghi âm họp Zoom/Meet, action items tự động",
  },
  {
    id: "tldv",
    name: "tl;dv",
    website: "https://tldv.io",
    categoryId: "productivity",
    useCase: "Ghi hình họp, clip highlight và chia sẻ team",
  },
  {
    id: "monica",
    name: "Monica",
    website: "https://monica.im",
    categoryId: "productivity",
    useCase: "Trợ lý AI trên trình duyệt, đọc trang web và viết nhanh",
  },
  {
    id: "beautiful-ai",
    name: "Beautiful.ai",
    website: "https://www.beautiful.ai",
    categoryId: "productivity",
    useCase: "Slide tự động căn layout, presentation chuyên nghiệp",
  },
  {
    id: "zapier-ai",
    name: "Zapier AI",
    website: "https://zapier.com/ai",
    categoryId: "productivity",
    useCase: "Tự động hóa workflow giữa app, chatbot và agent",
  },
  {
    id: "mem",
    name: "Mem",
    website: "https://mem.ai",
    categoryId: "productivity",
    useCase: "Ghi chú thông minh, tìm kiếm và nhắc việc theo ngữ cảnh",
  },
  {
    id: "motion",
    name: "Motion",
    website: "https://www.usemotion.com",
    categoryId: "productivity",
    useCase: "Lên lịch công việc, calendar AI và quản lý task",
  },
  {
    id: "clickup-ai",
    name: "ClickUp AI",
    website: "https://clickup.com/ai",
    categoryId: "productivity",
    useCase: "Viết task, tóm tắt dự án và quản lý team",
  },
];

/** Slug Simple Icons (jsDelivr SVG — ổn định hơn cdn.simpleicons.org) */
const AI_SIMPLE_ICON_SLUG: Record<string, string> = {
  chatgpt: "openai",
  claude: "anthropic",
  gemini: "googlegemini",
  copilot: "microsoft",
  perplexity: "perplexity",
  grok: "x",
  deepseek: "deepseek",
  "meta-ai": "meta",
  mistral: "mistral",
  poe: "quora",
  qwen: "alibabadotcom",
  "notion-ai": "notion",
  grammarly: "grammarly",
  canva: "canva",
  dalle: "openai",
  sora: "openai",
  firefly: "adobe",
  "bing-image": "microsoft",
  "github-copilot": "githubcopilot",
  v0: "vercel",
  replit: "replit",
  "amazon-q": "amazonaws",
  "hubspot-ai": "hubspot",
  semrush: "semrush",
  mailchimp: "mailchimp",
  notebooklm: "google",
  "zapier-ai": "zapier",
  "clickup-ai": "clickup",
};

/** Domain favicon thay thế khi favicon website chính hay lỗi */
const AI_FAVICON_DOMAIN_OVERRIDES: Record<string, string> = {
  copilot: "microsoft.com",
  dalle: "openai.com",
  sora: "openai.com",
  "bing-image": "microsoft.com",
};

const SIMPLE_ICONS_CDN = "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons";

export function getSimpleIconSvgUrl(slug: string): string {
  return `${SIMPLE_ICONS_CDN}/${slug}.svg`;
}

function getWebsiteHostname(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Favicon Google (128px) — nhận URL đầy đủ hoặc domain (vd. microsoft.com) */
export function getFaviconLogoUrl(websiteOrDomain: string, size = 128): string {
  let host = "";
  const t = websiteOrDomain.trim();
  if (!t) return "";
  if (t.includes("://")) {
    host = getWebsiteHostname(t);
  } else {
    host = t.replace(/^www\./, "");
  }
  if (!host) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}

/** DuckDuckGo favicon — fallback khi logo chính lỗi */
export function getDuckDuckGoLogoUrl(website: string): string {
  const host = getWebsiteHostname(website);
  if (!host) return "";
  return `https://icons.duckduckgo.com/ip3/${host}.ico`;
}

/** Danh sách URL logo theo thứ tự ưu tiên (dùng cho fallback onError) */
export function getAiToolLogoSources(tool: AiTool): string[] {
  const urls: string[] = [];

  const custom = tool.logo?.trim();
  if (custom) urls.push(custom);

  const slug = AI_SIMPLE_ICON_SLUG[tool.id];
  if (slug) urls.push(getSimpleIconSvgUrl(slug));

  const faviconDomain = AI_FAVICON_DOMAIN_OVERRIDES[tool.id];
  if (faviconDomain) urls.push(getFaviconLogoUrl(faviconDomain));

  urls.push(getFaviconLogoUrl(tool.website));
  urls.push(getDuckDuckGoLogoUrl(tool.website));

  if (faviconDomain) {
    urls.push(getDuckDuckGoLogoUrl(`https://${faviconDomain}`));
  }

  return urls.filter((url, i, arr) => url && arr.indexOf(url) === i);
}

/** URL logo hiển thị (ưu tiên đầu tiên trong danh sách) */
export function getAiToolLogoUrl(tool: AiTool): string {
  return getAiToolLogoSources(tool)[0] ?? "";
}

export function getCategoryById(id: string): AiToolCategory | undefined {
  return AI_TOOL_CATEGORIES.find((c) => c.id === id);
}
