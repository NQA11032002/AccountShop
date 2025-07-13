"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Heart,
  MessageCircle,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';



export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  const newsCategories = [
    { id: 'all', name: 'Tất cả', count: 24 },
    { id: 'ai', name: 'Trí tuệ nhân tạo', count: 8 },
    { id: 'software', name: 'Phần mềm', count: 6 },
    { id: 'apps', name: 'Ứng dụng', count: 5 },
    { id: 'security', name: 'Bảo mật', count: 3 },
    { id: 'mobile', name: 'Di động', count: 2 }
  ];

  const newsArticles = [
    {
      id: 1,
      title: 'ChatGPT-4 Turbo: Những Cải Tiến Mới Nhất Trong Thế Giới AI',
      excerpt: 'OpenAI vừa công bố phiên bản ChatGPT-4 Turbo với nhiều tính năng mới và tốc độ xử lý nhanh hơn 40% so với phiên bản trước.',
      content: `
        <h2>Giới thiệu về ChatGPT-4 Turbo</h2>
        <p>OpenAI đã chính thức ra mắt ChatGPT-4 Turbo, một bước tiến quan trọng trong lĩnh vực trí tuệ nhân tạo. Phiên bản mới này không chỉ cải thiện đáng kể về tốc độ xử lý mà còn mở rộng khả năng hiểu và phản hồi của AI.</p>
        
        <h3>Những cải tiến đáng chú ý</h3>
        <ul>
          <li><strong>Tốc độ xử lý nhanh hơn 40%:</strong> Thời gian phản hồi giảm đáng kể, giúp trải nghiệm người dùng mượt mà hơn.</li>
          <li><strong>Khả năng hiểu context tốt hơn:</strong> AI có thể duy trì ngữ cảnh cuộc trò chuyện dài hơn và chính xác hơn.</li>
          <li><strong>Hỗ trợ đa ngôn ngữ mở rộng:</strong> Bổ sung thêm 15 ngôn ngữ mới, bao gồm tiếng Việt được cải thiện.</li>
          <li><strong>Tích hợp API mới:</strong> Cho phép các nhà phát triển tạo ra những ứng dụng AI mạnh mẽ hơn.</li>
        </ul>

        <h3>Ứng dụng thực tế</h3>
        <p>ChatGPT-4 Turbo được ứng dụng rộng rãi trong nhiều lĩnh vực:</p>
        <ul>
          <li>Giáo dục: Hỗ trợ học tập và nghiên cứu</li>
          <li>Kinh doanh: Tự động hóa customer service</li>
          <li>Sáng tạo nội dung: Viết blog, copywriting</li>
          <li>Lập trình: Hỗ trợ debug và tối ưu code</li>
        </ul>

        <h3>Tác động đến thị trường</h3>
        <p>Sự ra đời của ChatGPT-4 Turbo dự kiến sẽ thay đổi cảnh quan công nghệ AI và tạo ra những cơ hội mới cho các doanh nghiệp muốn tích hợp AI vào quy trình làm việc của họ.</p>

        <blockquote>
          "ChatGPT-4 Turbo không chỉ là một bước tiến trong công nghệ AI, mà còn là chìa khóa mở ra tương lai của con người và máy móc làm việc cùng nhau hiệu quả hơn." - Sam Altman, CEO OpenAI
        </blockquote>
      `,
      category: 'ai',
      author: 'Nguyễn Văn Tech',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      authorBio: 'Chuyên gia AI với hơn 8 năm kinh nghiệm trong lĩnh vực công nghệ',
      date: '2024-06-20',
      readTime: '5 phút',
      views: 1250,
      likes: 89,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
      featured: true,
      tags: ['ChatGPT', 'OpenAI', 'AI', 'Machine Learning', 'Technology']
    },
    {
      id: 2,
      title: 'Microsoft Office 365 Cập Nhật Tính Năng AI Copilot',
      excerpt: 'Microsoft tích hợp sâu hơn AI Copilot vào Office 365, giúp người dùng tăng hiệu suất làm việc lên 60%.',
      content: `
        <h2>AI Copilot - Trợ lý thông minh cho Office 365</h2>
        <p>Microsoft đã chính thức triển khai AI Copilot trên toàn bộ bộ Office 365, mang đến trải nghiệm làm việc hoàn toàn mới cho hàng triệu người dùng trên toàn thế giới.</p>
        
        <h3>Tính năng nổi bật của AI Copilot</h3>
        <ul>
          <li><strong>Word Copilot:</strong> Hỗ trợ viết văn bản, chỉnh sửa và định dạng tự động</li>
          <li><strong>Excel Copilot:</strong> Phân tích dữ liệu thông minh và tạo biểu đồ tự động</li>
          <li><strong>PowerPoint Copilot:</strong> Thiết kế slide chuyên nghiệp từ ý tưởng</li>
          <li><strong>Outlook Copilot:</strong> Soạn thảo email thông minh và quản lý lịch trình</li>
        </ul>

        <h3>Lợi ích cho doanh nghiệp</h3>
        <p>Theo nghiên cứu của Microsoft, các doanh nghiệp sử dụng AI Copilot đã ghi nhận:</p>
        <ul>
          <li>Tăng 60% hiệu suất làm việc</li>
          <li>Giảm 40% thời gian soạn thảo văn bản</li>
          <li>Cải thiện 75% chất lượng báo cáo</li>
        </ul>
      `,
      category: 'software',
      author: 'Trần Thị Office',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c28c?w=100&h=100&fit=crop&crop=face',
      authorBio: 'Chuyên gia Microsoft Office với chứng chỉ MVP',
      date: '2024-06-18',
      readTime: '4 phút',
      views: 980,
      likes: 67,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
      featured: false,
      tags: ['Microsoft', 'Office 365', 'AI Copilot', 'Productivity', 'Business']
    },
    {
      id: 3,
      title: 'Adobe Creative Cloud 2024: Cách Mạng Trong Thiết Kế',
      excerpt: 'Adobe ra mắt bộ công cụ Creative Cloud 2024 với AI tích hợp, thay đổi hoàn toàn cách thiết kế đồ họa.',
      content: `
        <h2>Adobe Creative Cloud 2024 - Kỷ nguyên mới của thiết kế</h2>
        <p>Adobe đã chính thức giới thiệu Adobe Creative Cloud 2024, một bộ công cụ sáng tạo mạnh mẽ với AI được tích hợp sâu vào từng ứng dụng. Điều này đánh dấu một cuộc cách mạng trong cách chúng ta tiếp cận thiết kế đồ họa.</p>
        
        <h3>Những tính năng AI đột phá</h3>
        <ul>
          <li><strong>Photoshop AI:</strong> Generative Fill và Object Selection thông minh</li>
          <li><strong>Illustrator AI:</strong> Vector tracing tự động và color matching</li>
          <li><strong>After Effects AI:</strong> Animation generation từ text prompts</li>
          <li><strong>Premiere Pro AI:</strong> Auto-editing và smart trimming</li>
        </ul>

        <h3>Tác động đến ngành thiết kế</h3>
        <p>Creative Cloud 2024 đang thay đổi cách các nhà thiết kế làm việc:</p>
        <ul>
          <li>Giảm 70% thời gian thực hiện các tác vụ lặp lại</li>
          <li>Tăng khả năng sáng tạo thông qua AI assistance</li>
          <li>Democratization của thiết kế chuyên nghiệp</li>
          <li>Collaboration tools được cải thiện đáng kể</li>
        </ul>

        <h3>Giá cả và khả năng tiếp cận</h3>
        <p>Adobe đã điều chỉnh pricing model để làm cho Creative Cloud 2024 trở nên accessible hơn với các gói subscription linh hoạt cho cá nhân, team và enterprise.</p>

        <blockquote>
          "AI không thay thế sự sáng tạo của con người, mà amplify nó. Creative Cloud 2024 là minh chứng cho triết lý này." - David Wadhwani, Chief Product Officer tại Adobe
        </blockquote>
      `,
      category: 'software',
      author: 'Lê Minh Design',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      authorBio: 'Creative Director với 10+ năm kinh nghiệm Adobe tools',
      date: '2024-06-15',
      readTime: '6 phút',
      views: 1450,
      likes: 124,
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1200&h=600&fit=crop',
      featured: true,
      tags: ['Adobe', 'Creative Cloud', 'Design', 'AI', 'Photoshop', 'Illustrator']
    },
    {
      id: 4,
      title: 'VPN Premium: Bảo Vệ Quyền Riêng Tư Trong Thời Đại Số',
      excerpt: 'Tại sao VPN premium ngày càng trở nên quan trọng và cách chọn dịch vụ VPN phù hợp.',
      content: `
        <h2>VPN Premium - Sự đầu tư cần thiết cho an toàn mạng</h2>
        <p>Trong thời đại số hóa hiện tại, việc bảo vệ quyền riêng tư trực tuyến đã trở thành ưu tiên hàng đầu. VPN Premium không chỉ là một công cụ bảo mật mà còn là "lá chắn" bảo vệ thông tin cá nhân khỏi những mối đe dọa mạng.</p>
        
        <h3>Tại sao cần VPN Premium?</h3>
        <ul>
          <li><strong>Mã hóa cấp quân sự:</strong> AES-256 encryption bảo vệ dữ liệu tuyệt đối</li>
          <li><strong>No-logs policy:</strong> Không lưu trữ lịch sử duyệt web của người dùng</li>
          <li><strong>Kill Switch:</strong> Tự động ngắt kết nối khi VPN bị lỗi</li>
          <li><strong>Multi-platform support:</strong> Hỗ trợ đồng thời nhiều thiết bị</li>
        </ul>

        <h3>So sánh VPN miễn phí vs Premium</h3>
        <table>
          <tr><th>Tiêu chí</th><th>Miễn phí</th><th>Premium</th></tr>
          <tr><td>Băng thông</td><td>Hạn chế</td><td>Không giới hạn</td></tr>
          <tr><td>Số lượng server</td><td>Ít</td><td>Hàng nghìn server</td></tr>
          <tr><td>Quảng cáo</td><td>Có</td><td>Không</td></tr>
          <tr><td>Hỗ trợ 24/7</td><td>Không</td><td>Có</td></tr>
        </table>

        <h3>Top VPN Premium đáng tin cậy</h3>
        <ul>
          <li><strong>ExpressVPN:</strong> Tốc độ cao, server toàn cầu</li>
          <li><strong>NordVPN:</strong> Bảo mật tối ưu, giá cả hợp lý</li>
          <li><strong>Surfshark:</strong> Unlimited devices, tính năng advanced</li>
          <li><strong>CyberGhost:</strong> User-friendly, streaming optimization</li>
        </ul>

        <blockquote>
          "Privacy không phải là điều bạn cần che giấu, mà là điều bạn cần bảo vệ." - Security Expert
        </blockquote>
      `,
      category: 'security',
      author: 'Phạm Văn Security',
      authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      authorBio: 'Chuyên gia bảo mật mạng với chứng chỉ CISSP',
      date: '2024-06-12',
      readTime: '3 phút',
      views: 750,
      likes: 56,
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop',
      featured: false,
      tags: ['VPN', 'Security', 'Privacy', 'Cyber Security', 'Online Safety']
    },
    {
      id: 5,
      title: 'Spotify Premium vs Apple Music: Cuộc Chiến Streaming 2024',
      excerpt: 'So sánh chi tiết hai dịch vụ streaming hàng đầu và những tính năng mới được cập nhật.',
      content: `
        <h2>Cuộc chiến streaming 2024: Ai sẽ thống trị?</h2>
        <p>Thị trường streaming nhạc số đang chứng kiến cuộc cạnh tranh gay gắt giữa hai ông lớn Spotify và Apple Music. Cả hai đều không ngừng cập nhật tính năng mới để thu hút và giữ chân người dùng.</p>
        
        <h3>Spotify Premium - Những điểm mạnh</h3>
        <ul>
          <li><strong>AI Discover:</strong> Algorithm gợi ý nhạc thông minh nhất thị trường</li>
          <li><strong>Podcast Integration:</strong> Thư viện podcast khổng lồ và exclusive content</li>
          <li><strong>Social Features:</strong> Chia sẻ và collaborative playlists</li>
          <li><strong>Cross-platform:</strong> Hỗ trợ mọi thiết bị và platform</li>
        </ul>

        <h3>Apple Music - Những ưu thế</h3>
        <ul>
          <li><strong>Lossless Audio:</strong> Chất lượng âm thanh Hi-Fi không mất dữ liệu</li>
          <li><strong>Ecosystem Integration:</strong> Tích hợp hoàn hảo với hệ sinh thái Apple</li>
          <li><strong>Exclusive Releases:</strong> Các album và single độc quyền</li>
          <li><strong>Spatial Audio:</strong> Trải nghiệm âm thanh 3D immersive</li>
        </ul>

        <h3>Phân tích chi tiết</h3>
        <table>
          <tr><th>Tiêu chí</th><th>Spotify</th><th>Apple Music</th></tr>
          <tr><td>Thư viện nhạc</td><td>80+ triệu</td><td>75+ triệu</td></tr>
          <tr><td>Giá premium</td><td>159k/tháng</td><td>149k/tháng</td></tr>
          <tr><td>Chất lượng âm thanh</td><td>320kbps</td><td>Lossless</td></tr>
          <tr><td>Free tier</td><td>Có (có quảng cáo)</td><td>Không</td></tr>
        </table>

        <h3>Verdict 2024</h3>
        <p>Cả hai dịch vụ đều có những ưu điểm riêng. Spotify thắng thế ở mặt discovery và social features, trong khi Apple Music vượt trội về chất lượng âm thanh và tích hợp ecosystem.</p>

        <blockquote>
          "Cuộc chiến streaming không chỉ là về số lượng bài hát, mà về trải nghiệm tổng thể mà mỗi platform mang lại." - Music Industry Analyst
        </blockquote>
      `,
      category: 'apps',
      author: 'Hoàng Thị Music',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c28c?w=100&h=100&fit=crop&crop=face',
      authorBio: 'Music blogger và digital content creator',
      date: '2024-06-10',
      readTime: '7 phút',
      views: 2100,
      likes: 178,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
      featured: false,
      tags: ['Spotify', 'Apple Music', 'Streaming', 'Music', 'Premium', 'Comparison']
    },
    {
      id: 6,
      title: 'Midjourney V6: AI Tạo Ảnh Đạt Độ Chân Thực Đáng Kinh Ngạc',
      excerpt: 'Phiên bản mới nhất của Midjourney có thể tạo ra những hình ảnh không thể phân biệt được với ảnh thật.',
      content: `
        <h2>Midjourney V6 - Breakthrough trong AI Image Generation</h2>
        <p>Midjourney V6 đã chính thức ra mắt với những cải tiến đáng kinh ngạc trong việc tạo ra hình ảnh từ text prompts. Phiên bản mới này không chỉ tăng độ chân thực mà còn mở rộng khả năng sáng tạo đến mức chưa từng có.</p>
        
        <h3>Những cải tiến đột phá</h3>
        <ul>
          <li><strong>Photorealism:</strong> Độ chân thực gần như không thể phân biệt với ảnh thật</li>
          <li><strong>Text Rendering:</strong> Khả năng render text trong ảnh chính xác và sắc nét</li>
          <li><strong>Consistency:</strong> Duy trì nhất quán character và style qua nhiều generations</li>
          <li><strong>Fine Details:</strong> Chi tiết cực kỳ tinh xảo ở mọi góc độ</li>
        </ul>

        <h3>Ứng dụng thực tế trong các ngành</h3>
        <ul>
          <li><strong>Marketing & Advertising:</strong> Tạo visual content không giới hạn</li>
          <li><strong>Game Development:</strong> Concept art và asset creation</li>
          <li><strong>Architecture:</strong> Visualization và prototype design</li>
          <li><strong>Fashion:</strong> Virtual try-on và design exploration</li>
          <li><strong>Film & Media:</strong> Storyboarding và pre-visualization</li>
        </ul>

        <h3>So sánh với các đối thủ</h3>
        <table>
          <tr><th>AI Tool</th><th>Realism</th><th>Speed</th><th>Ease of Use</th></tr>
          <tr><td>Midjourney V6</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td></tr>
          <tr><td>DALL-E 3</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td></tr>
          <tr><td>Stable Diffusion</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐</td></tr>
        </table>

        <h3>Thách thức về đạo đức và bản quyền</h3>
        <p>Với khả năng tạo ra hình ảnh cực kỳ chân thực, Midjourney V6 cũng đặt ra những câu hỏi về:</p>
        <ul>
          <li>Deepfake và misinformation</li>
          <li>Bản quyền hình ảnh và intellectual property</li>
          <li>Tác động đến ngành nhiếp ảnh và design</li>
          <li>Regulation và guideline sử dụng</li>
        </ul>

        <blockquote>
          "V6 represents a quantum leap in AI image generation. We're approaching the uncanny valley where AI art becomes indistinguishable from human-created content." - David Holz, Founder của Midjourney
        </blockquote>
      `,
      category: 'ai',
      author: 'Đỗ Minh AI',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      authorBio: 'AI Artist và researcher trong lĩnh vực computer vision',
      date: '2024-06-08',
      readTime: '5 phút',
      views: 1850,
      likes: 203,
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=600&fit=crop',
      featured: true,
      tags: ['Midjourney', 'AI Art', 'Image Generation', 'Computer Vision', 'Creative AI']
    }
  ];



  useEffect(() => {
    const foundArticle = newsArticles.find(a => a.id === parseInt(params.id as string));
    if (foundArticle) {
      setArticle(foundArticle);
      // Set related articles (same category, excluding current article)
      const related = newsArticles.filter(a =>
        a.category === foundArticle.category && a.id !== foundArticle.id
      ).slice(0, 3);
      setRelatedArticles(related);

      // Sample comments
      setComments([
        {
          id: 1,
          author: 'Phạm Minh Đức',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
          content: 'Bài viết rất hữu ích! Cảm ơn tác giả đã chia sẻ.',
          date: '2024-06-21',
          likes: 12
        },
        {
          id: 2,
          author: 'Nguyễn Thị Lan',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
          content: 'Mình đã thử nghiệm và thấy hiệu quả rất tốt. Recommend!',
          date: '2024-06-21',
          likes: 8
        }
      ]);
    }
  }, [params.id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
            <Link href="/news">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Quay lại tin tức
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // async function generateStaticParams() {
  //   return newsArticles.map((article) => ({
  //     id: article.id.toString(),
  //   }));
  // }


  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
              <span>/</span>
              <Link href="/news" className="hover:text-blue-600">Tin tức</Link>
              <span>/</span>
              <span className="text-gray-900">
                {newsCategories.find(cat => cat.id === article.category)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Article Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/news" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại tin tức
            </Link>

            <div className="mb-6">
              <Badge className="bg-blue-100 text-blue-800 mb-4">
                {newsCategories.find(cat => cat.id === article.category)?.name}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Author & Meta Info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={article.authorAvatar} alt={article.author} />
                    <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{article.author}</p>
                    <p className="text-sm text-gray-600">{article.authorBio}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(article.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.views} lượt xem
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Image */}
        <section className="mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Article Content */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Main Content */}
              <div className="lg:w-3/4">
                <div
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-blue-50">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Actions */}
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg mb-8">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      onClick={() => setIsLiked(!isLiked)}
                      className="flex items-center"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {article.likes + (isLiked ? 1 : 0)}
                    </Button>

                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      {isBookmarked ? 'Đã lưu' : 'Lưu bài'}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 mr-2">Chia sẻ:</span>
                    <Button variant="outline" size="sm">
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Bình luận ({comments.length})
                  </h3>

                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={comment.avatar} alt={comment.author} />
                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              Trả lời
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/4">
                <div className="sticky top-8 space-y-6">

                  {/* Author Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Về tác giả</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={article.authorAvatar} alt={article.author} />
                          <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{article.author}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{article.authorBio}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Xem tất cả bài viết
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Related Articles */}
                  {relatedArticles.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bài viết liên quan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {relatedArticles.map((related) => (
                            <Link key={related.id} href={`/news/${related.id}`}>
                              <div className="flex space-x-3 group cursor-pointer">
                                <img
                                  src={related.image}
                                  alt={related.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {related.title}
                                  </h5>
                                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(related.date).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
