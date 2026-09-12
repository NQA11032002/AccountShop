import type { AiTool } from './ai-tools';

// Official product pages checked on 2026-09-12. Avoid pricing and plan promises.
export const ADDITIONAL_AI_TOOLS: AiTool[] = [
  {
    "id": "meshy",
    "name": "Meshy",
    "website": "https://www.meshy.ai",
    "categoryId": "3d",
    "useCase": "Tạo mô hình 3D từ ảnh hoặc mô tả, tạo texture cho game và in 3D."
  },
  {
    "id": "tripo",
    "name": "Tripo AI",
    "website": "https://www.tripo3d.ai",
    "categoryId": "3d",
    "useCase": "Chuyển ảnh và ý tưởng thành mô hình 3D để dựng cảnh, tạo nhân vật."
  },
  {
    "id": "spline",
    "name": "Spline AI",
    "website": "https://spline.design/ai-generate",
    "categoryId": "3d",
    "useCase": "Tạo đối tượng 3D bằng AI và thiết kế cảnh tương tác cho website."
  },
  {
    "id": "scenario",
    "name": "Scenario",
    "website": "https://www.scenario.com",
    "categoryId": "3d",
    "useCase": "Tạo hình ảnh và tài nguyên game theo phong cách riêng của dự án."
  },
  {
    "id": "kaedim",
    "name": "Kaedim",
    "website": "https://www.kaedim3d.com",
    "categoryId": "3d",
    "useCase": "Chuyển ý tưởng hình ảnh thành tài nguyên 3D cho studio game và sản phẩm."
  },
  {
    "id": "ludo",
    "name": "Ludo.ai",
    "website": "https://ludo.ai",
    "categoryId": "3d",
    "useCase": "Lên ý tưởng trò chơi, tạo sprite và tài nguyên hình ảnh để thử nghiệm game."
  },
  {
    "id": "aiva",
    "name": "AIVA",
    "website": "https://www.aiva.ai",
    "categoryId": "audio",
    "useCase": "Sáng tác nhạc bằng AI theo phong cách mong muốn cho video và game."
  },
  {
    "id": "soundraw",
    "name": "SOUNDRAW",
    "website": "https://soundraw.io",
    "categoryId": "audio",
    "useCase": "Tạo nhạc nền theo thể loại, nhịp điệu và cảm xúc cho nội dung sáng tạo."
  },
  {
    "id": "beatoven",
    "name": "Beatoven.ai",
    "website": "https://www.beatoven.ai",
    "categoryId": "audio",
    "useCase": "Tạo nhạc nền theo mô tả để dùng trong podcast, video và kể chuyện."
  },
  {
    "id": "krisp",
    "name": "Krisp",
    "website": "https://krisp.ai",
    "categoryId": "audio",
    "useCase": "Khử tiếng ồn bằng AI, cải thiện giọng nói khi họp trực tuyến và ghi chú cuộc gọi."
  },
  {
    "id": "adobe-podcast",
    "name": "Adobe Podcast",
    "website": "https://podcast.adobe.com",
    "categoryId": "audio",
    "useCase": "Làm rõ giọng nói, xử lý bản thu và chỉnh sửa âm thanh podcast trên trình duyệt."
  },
  {
    "id": "n8n",
    "name": "n8n",
    "website": "https://n8n.io",
    "categoryId": "automation",
    "useCase": "Kết nối ứng dụng và AI bằng workflow trực quan; tự động xử lý dữ liệu, email và công việc."
  },
  {
    "id": "make",
    "name": "Make",
    "website": "https://www.make.com/en",
    "categoryId": "automation",
    "useCase": "Thiết kế quy trình tự động hóa bằng kéo thả, kết hợp AI với ứng dụng kinh doanh."
  },
  {
    "id": "gumloop",
    "name": "Gumloop",
    "website": "https://www.gumloop.com",
    "categoryId": "automation",
    "useCase": "Xây dựng AI agent và quy trình đọc tài liệu, tổng hợp dữ liệu, xử lý việc lặp lại."
  },
  {
    "id": "lindy",
    "name": "Lindy",
    "website": "https://www.lindy.ai",
    "categoryId": "automation",
    "useCase": "Tạo trợ lý AI hỗ trợ hộp thư, lịch hẹn và các tác vụ vận hành theo quy trình."
  },
  {
    "id": "relevance-ai",
    "name": "Relevance AI",
    "website": "https://relevanceai.com",
    "categoryId": "automation",
    "useCase": "Xây dựng AI agent chuyên trách để hỗ trợ nghiên cứu khách hàng, bán hàng và vận hành."
  },
  {
    "id": "activepieces",
    "name": "Activepieces",
    "website": "https://www.activepieces.com",
    "categoryId": "automation",
    "useCase": "Tạo luồng tự động hóa và kết nối AI với các công cụ làm việc bằng giao diện trực quan."
  },
  {
    "id": "julius",
    "name": "Julius AI",
    "website": "https://julius.ai",
    "categoryId": "data",
    "useCase": "Phân tích bảng tính bằng hội thoại, khám phá dữ liệu và tạo biểu đồ cho báo cáo."
  },
  {
    "id": "hex",
    "name": "Hex",
    "website": "https://hex.tech",
    "categoryId": "data",
    "useCase": "Phân tích dữ liệu với trợ lý AI, SQL và notebook để xây báo cáo cho nhóm dữ liệu."
  },
  {
    "id": "numerous",
    "name": "Numerous.ai",
    "website": "https://numerous.ai",
    "categoryId": "data",
    "useCase": "Dùng AI trong Excel và Google Sheets để phân loại, viết công thức, xử lý nội dung hàng loạt."
  },
  {
    "id": "better-analyst",
    "name": "Better Analyst",
    "website": "https://betteranalyst.com",
    "categoryId": "data",
    "useCase": "Phân tích dữ liệu bằng ngôn ngữ tự nhiên, tạo công thức bảng tính và báo cáo.",
    "note": "Trước đây: Formula Bot"
  },
  {
    "id": "deepl",
    "name": "DeepL",
    "website": "https://www.deepl.com/en",
    "categoryId": "translation",
    "useCase": "Dịch văn bản và tài liệu đa ngôn ngữ, chỉnh cách diễn đạt cho giao tiếp và công việc."
  },
  {
    "id": "smartcat",
    "name": "Smartcat",
    "website": "https://www.smartcat.com",
    "categoryId": "translation",
    "useCase": "Dịch và bản địa hóa nội dung bằng AI, phối hợp biên tập viên kiểm duyệt bản dịch."
  },
  {
    "id": "lokalise",
    "name": "Lokalise",
    "website": "https://lokalise.com",
    "categoryId": "translation",
    "useCase": "Quản lý bản dịch ứng dụng, website và tài liệu với AI hỗ trợ bản địa hóa."
  },
  {
    "id": "khanmigo",
    "name": "Khanmigo",
    "website": "https://www.khanmigo.ai",
    "categoryId": "education",
    "useCase": "Trợ giảng AI của Khan Academy, gợi mở cách giải bài và hỗ trợ giáo viên chuẩn bị bài học."
  },
  {
    "id": "magicschool",
    "name": "MagicSchool",
    "website": "https://www.magicschool.ai",
    "categoryId": "education",
    "useCase": "Hỗ trợ giáo viên soạn giáo án, câu hỏi và học liệu theo mục tiêu giảng dạy."
  },
  {
    "id": "diffit",
    "name": "Diffit",
    "website": "https://web.diffit.me",
    "categoryId": "education",
    "useCase": "Biến tài liệu hoặc chủ đề thành bài đọc và hoạt động phù hợp trình độ học sinh."
  },
  {
    "id": "elsa",
    "name": "ELSA Speak",
    "website": "https://elsaspeak.com/en",
    "categoryId": "education",
    "useCase": "Luyện phát âm và giao tiếp tiếng Anh với phản hồi từ AI theo bài luyện cá nhân."
  },
  {
    "id": "speak",
    "name": "Speak",
    "website": "https://www.speak.com",
    "categoryId": "education",
    "useCase": "Luyện nói ngoại ngữ qua hội thoại với gia sư AI và nhận phản hồi về cách diễn đạt."
  },
  {
    "id": "framer",
    "name": "Framer AI",
    "website": "https://www.framer.com/ai/",
    "categoryId": "webdesign",
    "useCase": "Tạo và chỉnh sửa giao diện website bằng mô tả, tinh chỉnh thiết kế trên canvas trực quan."
  },
  {
    "id": "uizard",
    "name": "Uizard",
    "website": "https://uizard.io",
    "categoryId": "webdesign",
    "useCase": "Tạo wireframe và giao diện ứng dụng từ ý tưởng, bản phác thảo hoặc ảnh tham khảo."
  },
  {
    "id": "relume",
    "name": "Relume",
    "website": "https://www.relume.ai",
    "categoryId": "webdesign",
    "useCase": "Lập sitemap, wireframe và bố cục website marketing bằng AI để khởi đầu thiết kế."
  },
  {
    "id": "durable",
    "name": "Durable",
    "website": "https://durable.com",
    "categoryId": "webdesign",
    "useCase": "Tạo website giới thiệu doanh nghiệp cùng nội dung khởi đầu bằng AI."
  },
  {
    "id": "10web",
    "name": "10Web",
    "website": "https://10web.io",
    "categoryId": "webdesign",
    "useCase": "Xây website WordPress có AI hỗ trợ tạo trang, nội dung và bố cục cho doanh nghiệp."
  },
  {
    "id": "fin",
    "name": "Fin",
    "website": "https://fin.ai",
    "categoryId": "support",
    "useCase": "AI agent hỗ trợ khách hàng dựa trên nguồn kiến thức doanh nghiệp và chuyển tiếp cho nhân viên.",
    "note": "Intercom"
  },
  {
    "id": "tidio",
    "name": "Tidio",
    "website": "https://www.tidio.com",
    "categoryId": "support",
    "useCase": "Kết hợp live chat và trợ lý AI để trả lời câu hỏi của khách trên website, cửa hàng."
  },
  {
    "id": "botpress",
    "name": "Botpress",
    "website": "https://botpress.com",
    "categoryId": "support",
    "useCase": "Xây chatbot và AI agent hỗ trợ khách hàng với kho kiến thức và luồng hội thoại."
  },
  {
    "id": "voiceflow",
    "name": "Voiceflow",
    "website": "https://www.voiceflow.com",
    "categoryId": "support",
    "useCase": "Thiết kế trợ lý hội thoại và giọng nói, thử nghiệm kịch bản chăm sóc khách hàng."
  },
  {
    "id": "teal",
    "name": "Teal",
    "website": "https://www.tealhq.com",
    "categoryId": "career",
    "useCase": "Viết CV bằng AI theo mô tả công việc và quản lý các vị trí đã ứng tuyển."
  },
  {
    "id": "kickresume",
    "name": "Kickresume",
    "website": "https://www.kickresume.com/en/",
    "categoryId": "career",
    "useCase": "Soạn CV và thư ứng tuyển với AI, lựa chọn mẫu trình bày hồ sơ nghề nghiệp."
  },
  {
    "id": "rezi",
    "name": "Rezi",
    "website": "https://www.rezi.ai",
    "categoryId": "career",
    "useCase": "Hỗ trợ viết CV theo từ khóa công việc và kiểm tra cấu trúc hồ sơ ứng tuyển."
  },
  {
    "id": "huntr",
    "name": "Huntr",
    "website": "https://huntr.co",
    "categoryId": "career",
    "useCase": "Tạo CV phù hợp từng vị trí bằng AI và theo dõi tiến độ tìm việc."
  },
  {
    "id": "flair",
    "name": "Flair.ai",
    "website": "https://flair.ai",
    "categoryId": "ecommerce",
    "useCase": "Dàn dựng ảnh chụp sản phẩm và hình thời trang bằng AI cho thương hiệu, shop online."
  },
  {
    "id": "pebblely",
    "name": "Pebblely",
    "website": "https://pebblely.com",
    "categoryId": "ecommerce",
    "useCase": "Tạo bối cảnh và ảnh quảng bá sản phẩm từ ảnh có sẵn cho gian hàng thương mại điện tử."
  },
  {
    "id": "claid",
    "name": "Claid",
    "website": "https://claid.ai",
    "categoryId": "ecommerce",
    "useCase": "Cải thiện ảnh sản phẩm, thay nền và tạo hình ảnh thời trang cho catalog bán hàng."
  },
  {
    "id": "interior-ai",
    "name": "Interior AI",
    "website": "https://interiorai.com",
    "categoryId": "interior",
    "useCase": "Biến ảnh căn phòng thành ý tưởng trang trí nội thất và bố trí không gian ảo."
  },
  {
    "id": "reimaginehome",
    "name": "REimagineHome",
    "website": "https://www.reimaginehome.ai",
    "categoryId": "interior",
    "useCase": "Thử phong cách nội thất và dàn dựng phòng từ ảnh để hình dung phương án cải tạo."
  },
  {
    "id": "homestyler",
    "name": "Homestyler",
    "website": "https://www.homestyler.com",
    "categoryId": "interior",
    "useCase": "Thiết kế phòng và phối cảnh 3D, dùng AI khám phá các ý tưởng nội thất."
  },
  {
    "id": "planner5d",
    "name": "Planner 5D",
    "website": "https://planner5d.com",
    "categoryId": "interior",
    "useCase": "Lập mặt bằng và thiết kế nhà 3D, sử dụng AI hỗ trợ bố trí và gợi ý không gian."
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "website": "https://ollama.com",
    "categoryId": "local",
    "useCase": "Chạy mô hình AI trên máy cá nhân, thử nghiệm chatbot và kết nối ứng dụng qua API."
  },
  {
    "id": "lmstudio",
    "name": "LM Studio",
    "website": "https://lmstudio.ai",
    "categoryId": "local",
    "useCase": "Tải và chạy mô hình ngôn ngữ trên máy, trò chuyện và thử nghiệm bằng giao diện desktop."
  },
  {
    "id": "jan",
    "name": "Jan",
    "website": "https://www.jan.ai",
    "categoryId": "local",
    "useCase": "Trợ lý AI trên máy tính, hỗ trợ mô hình chạy cục bộ hoặc dịch vụ kết nối."
  },
  {
    "id": "gpt4all",
    "name": "GPT4All",
    "website": "https://www.nomic.ai/gpt4all",
    "categoryId": "local",
    "useCase": "Chạy chatbot AI cục bộ và hỏi đáp tài liệu trên máy với các mô hình tương thích."
  },
  {
    "id": "cline",
    "name": "Cline",
    "website": "https://cline.bot",
    "categoryId": "coding",
    "useCase": "Trợ lý lập trình AI hỗ trợ đọc dự án, sửa code và thực hiện tác vụ phát triển trong IDE."
  },
  {
    "id": "aider",
    "name": "Aider",
    "website": "https://aider.chat",
    "categoryId": "coding",
    "useCase": "Lập trình cùng AI ngay trong terminal, sửa nhiều file và làm việc với kho mã Git."
  },
  {
    "id": "scite",
    "name": "Scite",
    "website": "https://scite.ai",
    "categoryId": "research",
    "useCase": "Tìm tài liệu khoa học và xem ngữ cảnh trích dẫn để hỗ trợ đánh giá bằng chứng nghiên cứu."
  },
  {
    "id": "researchrabbit",
    "name": "ResearchRabbit",
    "website": "https://www.researchrabbit.ai",
    "categoryId": "research",
    "useCase": "Khám phá bài báo liên quan, theo dõi tác giả và xây mạng lưới tài liệu học thuật."
  },
  {
    "id": "opusclip",
    "name": "OpusClip",
    "website": "https://www.opus.pro",
    "categoryId": "video",
    "useCase": "Chọn đoạn nổi bật từ video dài, dựng clip ngắn và phụ đề cho mạng xã hội."
  },
  {
    "id": "veed",
    "name": "VEED",
    "website": "https://www.veed.io",
    "categoryId": "video",
    "useCase": "Tạo, chỉnh sửa video và phụ đề bằng các công cụ AI trên trình duyệt."
  },
  {
    "id": "magnific",
    "name": "Magnific",
    "website": "https://www.magnific.com",
    "categoryId": "image",
    "useCase": "Tạo hình ảnh, chỉnh sửa và nâng cấp chất lượng ảnh trong quy trình sáng tạo bằng AI."
  }
];

