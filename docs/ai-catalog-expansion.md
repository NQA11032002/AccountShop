# Mở rộng danh mục AI — 12/09/2026

Thêm 60 công cụ với mô tả tiếng Việt, 12 nhóm mới; tách âm nhạc/giọng nói khỏi video và đưa Zapier vào tự động hóa. Không gắn cam kết giá, miễn phí hoặc hạn mức.

Trang /cong-cu-ai có bộ lọc mục mới, tìm kiếm không dấu và phân trang 24 mục. Trang chủ chọn 12 công cụ đại diện thay vì chỉ lấy 12 trợ lý trò chuyện đầu tiên. Tổng số công cụ/nhóm được tính trực tiếp từ dữ liệu.

## Nguồn

Trang chính thức được đối chiếu qua web ngày 12/09/2026; nội dung và liên kết của 60 mục mới dựa trên các nguồn dưới đây. Botpress được đối chiếu thêm tại https://botpress.com/solutions/customer-support-chatbot. Không đưa Relay.app vào vì trang chính thức thông báo đóng cửa; dùng tên Better Analyst sau chuyển hướng từ Formula Bot, và đích chính thức mới của Relume, Durable, Fin, Magnific. Không kiểm toán lại toàn bộ nội dung của các mục cũ trong đợt này.

- [Meshy](https://www.meshy.ai) — 3d
- [Tripo AI](https://www.tripo3d.ai) — 3d
- [Spline AI](https://spline.design/ai-generate) — 3d
- [Scenario](https://www.scenario.com) — 3d
- [Kaedim](https://www.kaedim3d.com) — 3d
- [Ludo.ai](https://ludo.ai) — 3d
- [AIVA](https://www.aiva.ai) — audio
- [SOUNDRAW](https://soundraw.io) — audio
- [Beatoven.ai](https://www.beatoven.ai) — audio
- [Krisp](https://krisp.ai) — audio
- [Adobe Podcast](https://podcast.adobe.com) — audio
- [n8n](https://n8n.io) — automation
- [Make](https://www.make.com/en) — automation
- [Gumloop](https://www.gumloop.com) — automation
- [Lindy](https://www.lindy.ai) — automation
- [Relevance AI](https://relevanceai.com) — automation
- [Activepieces](https://www.activepieces.com) — automation
- [Julius AI](https://julius.ai) — data
- [Hex](https://hex.tech) — data
- [Numerous.ai](https://numerous.ai) — data
- [Better Analyst](https://betteranalyst.com) — data
- [DeepL](https://www.deepl.com/en) — translation
- [Smartcat](https://www.smartcat.com) — translation
- [Lokalise](https://lokalise.com) — translation
- [Khanmigo](https://www.khanmigo.ai) — education
- [MagicSchool](https://www.magicschool.ai) — education
- [Diffit](https://web.diffit.me) — education
- [ELSA Speak](https://elsaspeak.com/en) — education
- [Speak](https://www.speak.com) — education
- [Framer AI](https://www.framer.com/ai/) — webdesign
- [Uizard](https://uizard.io) — webdesign
- [Relume](https://www.relume.ai) — webdesign
- [Durable](https://durable.com) — webdesign
- [10Web](https://10web.io) — webdesign
- [Fin](https://fin.ai) — support
- [Tidio](https://www.tidio.com) — support
- [Botpress](https://botpress.com) — support
- [Voiceflow](https://www.voiceflow.com) — support
- [Teal](https://www.tealhq.com) — career
- [Kickresume](https://www.kickresume.com/en/) — career
- [Rezi](https://www.rezi.ai) — career
- [Huntr](https://huntr.co) — career
- [Flair.ai](https://flair.ai) — ecommerce
- [Pebblely](https://pebblely.com) — ecommerce
- [Claid](https://claid.ai) — ecommerce
- [Interior AI](https://interiorai.com) — interior
- [REimagineHome](https://www.reimaginehome.ai) — interior
- [Homestyler](https://www.homestyler.com) — interior
- [Planner 5D](https://planner5d.com) — interior
- [Ollama](https://ollama.com) — local
- [LM Studio](https://lmstudio.ai) — local
- [Jan](https://www.jan.ai) — local
- [GPT4All](https://www.nomic.ai/gpt4all) — local
- [Cline](https://cline.bot) — coding
- [Aider](https://aider.chat) — coding
- [Scite](https://scite.ai) — research
- [ResearchRabbit](https://www.researchrabbit.ai) — research
- [OpusClip](https://www.opus.pro) — video
- [VEED](https://www.veed.io) — video
- [Magnific](https://www.magnific.com) — image

## Kiểm tra và triển khai

`node_modules/.bin/vitest run --config tests/ai-catalog.config.mjs` kiểm tra danh mục, tìm kiếm, lọc và phân trang. Triển khai frontend là đủ; không cần migration hoặc seed backend.
