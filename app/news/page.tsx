"use client";

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Eye, Share2, Heart, MessageCircle } from 'lucide-react';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      category: 'ai',
      author: 'Nguyễn Văn Tech',
      date: '2024-06-20',
      readTime: '5 phút',
      views: 1250,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop',
      featured: true
    },
    {
      id: 2,
      title: 'Microsoft Office 365 Cập Nhật Tính Năng AI Copilot',
      excerpt: 'Microsoft tích hợp sâu hơn AI Copilot vào Office 365, giúp người dùng tăng hiệu suất làm việc lên 60%.',
      category: 'software',
      author: 'Trần Thị Office',
      date: '2024-06-18',
      readTime: '4 phút',
      views: 980,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=300&fit=crop',
      featured: false
    },
    {
      id: 3,
      title: 'Adobe Creative Cloud 2024: Cách Mạng Trong Thiết Kế',
      excerpt: 'Adobe ra mắt bộ công cụ Creative Cloud 2024 với AI tích hợp, thay đổi hoàn toàn cách thiết kế đồ họa.',
      category: 'software',
      author: 'Lê Minh Design',
      date: '2024-06-15',
      readTime: '6 phút',
      views: 1450,
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=300&fit=crop',
      featured: true
    },
    {
      id: 4,
      title: 'VPN Premium: Bảo Vệ Quyền Riêng Tư Trong Thời Đại Số',
      excerpt: 'Tại sao VPN premium ngày càng trở nên quan trọng và cách chọn dịch vụ VPN phù hợp.',
      category: 'security',
      author: 'Phạm Văn Security',
      date: '2024-06-12',
      readTime: '3 phút',
      views: 750,
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=300&fit=crop',
      featured: false
    },
    {
      id: 5,
      title: 'Spotify Premium vs Apple Music: Cuộc Chiến Streaming 2024',
      excerpt: 'So sánh chi tiết hai dịch vụ streaming hàng đầu và những tính năng mới được cập nhật.',
      category: 'apps',
      author: 'Hoàng Thị Music',
      date: '2024-06-10',
      readTime: '7 phút',
      views: 2100,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
      featured: false
    },
    {
      id: 6,
      title: 'Midjourney V6: AI Tạo Ảnh Đạt Độ Chân Thực Đáng Kinh Ngạc',
      excerpt: 'Phiên bản mới nhất của Midjourney có thể tạo ra những hình ảnh không thể phân biệt được với ảnh thật.',
      category: 'ai',
      author: 'Đỗ Minh AI',
      date: '2024-06-08',
      readTime: '5 phút',
      views: 1850,
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=300&fit=crop',
      featured: true
    }
  ];



  const filteredArticles = selectedCategory === 'all'
    ? newsArticles
    : newsArticles.filter(article => article.category === selectedCategory);

  const featuredArticles = newsArticles.filter(article => article.featured);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Tin Tức Công Nghệ
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Cập nhật những tin tức mới nhất về công nghệ, phần mềm, và các dịch vụ số
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  🔥 Hot News
                </Badge>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  🚀 Tech Updates
                </Badge>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  💡 AI Trends
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Tin Nổi Bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                      Nổi bật
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {newsCategories.find(cat => cat.id === article.category)?.name}
                      </Badge>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views}
                      </div>
                    </div>
                    <Link href={`/news/${article.id}`}>
                      <CardTitle className="text-xl hover:text-blue-600 transition-colors cursor-pointer">
                        {article.title}
                      </CardTitle>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(article.date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {article.readTime}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="p-1">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Sidebar */}
              <div className="lg:w-1/4">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Danh Mục Tin Tức</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {newsCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          <span>{category.name}</span>
                          <Badge variant={selectedCategory === category.id ? "secondary" : "outline"}>
                            {category.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Articles List */}
              <div className="lg:w-3/4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === 'all' ? 'Tất Cả Tin Tức' : newsCategories.find(cat => cat.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-600">{filteredArticles.length} bài viết</p>
                </div>

                <div className="space-y-8">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-1/3">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-44 sm:h-52 md:h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Content */}
                        <div className="md:w-2/3 p-4 sm:p-6">
                          {/* Top row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {newsCategories.find((cat) => cat.id === article.category)?.name}
                            </Badge>

                            <div className="flex items-center gap-3 sm:gap-4 text-gray-500 text-sm">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {article.views}
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {Math.floor(Math.random() * 20) + 1}
                              </div>
                            </div>
                          </div>

                          {/* Title */}
                          <Link href={`/news/${article.id}`} className="block">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                              {article.title}
                            </h3>
                          </Link>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-2 sm:line-clamp-3">
                            {article.excerpt}
                          </p>

                          {/* Bottom */}
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                              <span>Bởi {article.author}</span>

                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(article.date).toLocaleDateString("vi-VN")}
                              </div>

                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {article.readTime}
                              </div>
                            </div>

                            <div className="flex flex-row sm:flex-row gap-2 sm:items-center sm:justify-end">
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-center">
                                <Heart className="w-4 h-4 mr-1" />
                                Thích
                              </Button>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-center">
                                <Share2 className="w-4 h-4 mr-1" />
                                Chia sẻ
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                  ))}
                </div>

                {/* Load More Button */}
                <div className="text-center mt-12">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Xem Thêm Tin Tức
                  </Button>
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