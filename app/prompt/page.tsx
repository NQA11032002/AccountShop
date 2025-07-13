"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, MessageCircle, Sparkles, Copy, ChevronRight, Zap, Target, Lightbulb, Globe, Brain, Cpu, Bot, Filter } from 'lucide-react';

export default function Prompt() {
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const copyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    const techniques = [
        {
            title: "Clarity and Specificity",
            description: "Use explicit, detailed instructions to minimize ambiguity",
            example: "Write a 300-word product description for a wireless bluetooth headphone targeting fitness enthusiasts, highlighting durability and sweat resistance.",
            icon: <Target className="w-5 h-5" />
        },
        {
            title: "Structured Exploration",
            description: "Apply guided exploration for complex topics",
            example: "Explain quantum computing. Start with a definition, then cover key principles, real-world applications, and current limitations.",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            title: "Comparative Analysis",
            description: "Direct comparisons using specific criteria",
            example: "Compare solar and wind energy using cost efficiency, scalability, and environmental impact. List pros/cons for each.",
            icon: <Zap className="w-5 h-5" />
        },
        {
            title: "Task Decomposition",
            description: "Break complex requests into subtasks",
            example: "Step 1: Summarize this article. Step 2: Extract three key statistics. Step 3: Debate their implications.",
            icon: <Lightbulb className="w-5 h-5" />
        }
    ];

    const promptCategories = [
        {
            genre: "Creative Writing",
            id: "creative",
            color: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
            borderColor: "border-purple-400/30",
            textColor: "text-purple-100",
            badgeColor: "bg-purple-500/20 text-purple-100",
            prompts: [
                "Write a short story about a character who discovers they can communicate with household objects",
                "Create a dialogue between two characters stuck in an elevator - one is optimistic, the other pessimistic",
                "Describe a futuristic city through the eyes of a time traveler from the 1800s",
                "Write a poem about the last bookstore on Earth"
            ]
        },
        {
            genre: "Business & Marketing",
            id: "business",
            color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
            borderColor: "border-blue-400/30",
            textColor: "text-blue-100",
            badgeColor: "bg-blue-500/20 text-blue-100",
            prompts: [
                "Create a comprehensive social media strategy for a sustainable fashion brand targeting Gen Z",
                "Write a cold email template for B2B software sales that feels personal and engaging",
                "Generate 10 creative taglines for a plant-based protein company",
                "Develop a crisis communication plan for a tech startup facing data breach concerns"
            ]
        },
        {
            genre: "Learning & Education",
            id: "education",
            color: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
            borderColor: "border-green-400/30",
            textColor: "text-green-100",
            badgeColor: "bg-green-500/20 text-green-100",
            prompts: [
                "Explain machine learning to a 10-year-old using analogies from cooking",
                "Create a study schedule for learning Spanish in 6 months with specific daily activities",
                "Design a lesson plan teaching financial literacy to teenagers",
                "Break down the causes of World War I into 5 easy-to-understand factors"
            ]
        },
        {
            genre: "Technical & Coding",
            id: "technical",
            color: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
            borderColor: "border-indigo-400/30",
            textColor: "text-indigo-100",
            badgeColor: "bg-indigo-500/20 text-indigo-100",
            prompts: [
                "Explain the difference between REST and GraphQL APIs with practical examples",
                "Review this JavaScript code and suggest improvements for performance and readability",
                "Create a beginner-friendly guide to setting up a React development environment",
                "Write a Python script that analyzes CSV data and generates summary statistics"
            ]
        }
    ];

    const vietnamesePrompts = [
        {
            genre: "Viết lách sáng tạo",
            id: "creative-vn",
            color: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
            borderColor: "border-rose-400/30",
            textColor: "text-rose-100",
            badgeColor: "bg-rose-500/20 text-rose-100",
            prompts: [
                "Viết một câu chuyện ngắn về một người có thể nghe được suy nghĩ của động vật",
                "Tạo một đoạn hội thoại giữa hai người bạn gặp nhau sau 10 năm xa cách",
                "Miêu tả khung cảnh Hà Nội vào một buổi sáng mùa thu qua góc nhìn của một du khách nước ngoài",
                "Viết một bài thơ về tình yêu quê hương trong lòng người xa xứ",
                "Sáng tác một câu chuyện về một chiếc áo dài có phép màu",
                "Viết một lá thư gửi cho bản thân 10 năm sau",
                "Tạo một câu chuyện về một quán cà phê có thể thực hiện ước mơ của khách hàng",
                "Miêu tả cảm xúc của một cây cổ thụ chứng kiến sự thay đổi của thành phố"
            ]
        },
        {
            genre: "Kinh doanh & Marketing",
            id: "business-vn",
            color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
            borderColor: "border-blue-400/30",
            textColor: "text-blue-100",
            badgeColor: "bg-blue-500/20 text-blue-100",
            prompts: [
                "Tạo chiến lược marketing cho một thương hiệu thời trang bền vững tại Việt Nam",
                "Viết email giới thiệu sản phẩm mới đến khách hàng tiềm năng một cách thân thiện",
                "Lập kế hoạch kinh doanh chi tiết cho một quán cà phê take-away",
                "Tạo 10 slogan sáng tạo cho một ứng dụng giao đồ ăn tại Việt Nam",
                "Phát triển kế hoạch truyền thông khủng hoảng cho một công ty công nghệ",
                "Viết nội dung mô tả sản phẩm cho một shop online bán đồ handmade",
                "Tạo chiến lược bán hàng cho một startup EdTech Việt Nam",
                "Lập kế hoạch ra mắt sản phẩm mới trên thị trường Việt Nam"
            ]
        },
        {
            genre: "Giáo dục & Học tập",
            id: "education-vn",
            color: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
            borderColor: "border-green-400/30",
            textColor: "text-green-100",
            badgeColor: "bg-green-500/20 text-green-100",
            prompts: [
                "Tạo bài học về lịch sử Việt Nam cho học sinh cấp 2 một cách sinh động",
                "Giải thích khái niệm trí tuệ nhân tạo cho người mới bắt đầu",
                "Thiết kế chương trình học tiếng Anh cho người đi làm trong 6 tháng",
                "Tạo kế hoạch ôn thi đại học môn Toán hiệu quả",
                "Giải thích các khái niệm kinh tế cơ bản bằng ví dụ thực tế",
                "Tạo bài tập thực hành kỹ năng thuyết trình cho sinh viên",
                "Lập kế hoạch học một kỹ năng mới trong 30 ngày",
                "Thiết kế khóa học online về kỹ năng mềm cho sinh viên"
            ]
        },
        {
            genre: "Công nghệ & Lập trình",
            id: "tech-vn",
            color: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
            borderColor: "border-indigo-400/30",
            textColor: "text-indigo-100",
            badgeColor: "bg-indigo-500/20 text-indigo-100",
            prompts: [
                "Giải thích blockchain một cách đơn giản cho người không chuyên",
                "Tạo hướng dẫn học lập trình Python cho người mới bắt đầu",
                "Giải thích sự khác biệt giữa AI, Machine Learning và Deep Learning",
                "Tạo kế hoạch học full-stack development trong 12 tháng",
                "Hướng dẫn tối ưu hóa hiệu suất website một cách chi tiết",
                "Giải thích cách hoạt động của internet bằng ví dụ thực tế",
                "Tạo checklist bảo mật cho một ứng dụng web",
                "Hướng dẫn sử dụng Git và GitHub cho team development"
            ]
        },
        {
            genre: "Phát triển bản thân",
            id: "personal-vn",
            color: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
            borderColor: "border-pink-400/30",
            textColor: "text-pink-100",
            badgeColor: "bg-pink-500/20 text-pink-100",
            prompts: [
                "Tạo thói quen tích cực để bắt đầu ngày mới đầy năng lượng",
                "Lập kế hoạch phát triển kỹ năng giao tiếp trong 3 tháng",
                "Hướng dẫn xây dựng tự tin khi nói trước đám đông",
                "Tạo kế hoạch đọc sách để mở rộng kiến thức trong năm",
                "Phát triển kỹ năng quản lý cảm xúc trong công việc",
                "Lập kế hoạch tập thể dục phù hợp với lịch trình bận rộn",
                "Hướng dẫn xây dựng network chuyên nghiệp hiệu quả",
                "Tạo thói quen mindfulness cho cuộc sống cân bằng"
            ]
        },
        {
            genre: "Sức khỏe & Thể thao",
            id: "health-vn",
            color: "bg-gradient-to-br from-emerald-500/20 to-green-500/20",
            borderColor: "border-emerald-400/30",
            textColor: "text-emerald-100",
            badgeColor: "bg-emerald-500/20 text-emerald-100",
            prompts: [
                "Lập thực đơn ăn uống lành mạnh cho người bận rộn",
                "Tạo chương trình tập luyện tại nhà không cần dụng cụ",
                "Hướng dẫn cách ngủ ngon và đủ giấc cho người thức khuya",
                "Tạo kế hoạch detox cơ thể một cách tự nhiên",
                "Lập chế độ ăn uống cho người muốn tăng cân khỏe mạnh",
                "Hướng dẫn các bài tập giảm stress hiệu quả",
                "Tạo thói quen chăm sóc sức khỏe tinh thần hàng ngày",
                "Lập kế hoạch tập yoga cho người mới bắt đầu"
            ]
        },
        {
            genre: "Du lịch & Khám phá",
            id: "travel-vn",
            color: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20",
            borderColor: "border-cyan-400/30",
            textColor: "text-cyan-100",
            badgeColor: "bg-cyan-500/20 text-cyan-100",
            prompts: [
                "Tạo lịch trình du lịch Sapa 3 ngày 2 đêm với ngân sách tiết kiệm",
                "Lập kế hoạch khám phá ẩm thực đường phố Sài Gòn",
                "Hướng dẫn du lịch bụi Đà Lạt cho người lần đầu",
                "Tạo danh sách check-in Instagram worthy tại Hà Nội",
                "Lập kế hoạch du lịch Phú Quốc cho gia đình có trẻ nhỏ",
                "Hướng dẫn chuẩn bị hành lý du lịch hiệu quả",
                "Tạo lịch trình khám phá văn hóa truyền thống Việt Nam",
                "Lập kế hoạch du lịch eco-friendly tại Việt Nam"
            ]
        }
    ];

    const filteredEnglishPrompts = selectedCategory === 'all'
        ? promptCategories
        : promptCategories.filter(cat => cat.id === selectedCategory);

    const filteredVietnamesePrompts = selectedCategory === 'all'
        ? vietnamesePrompts
        : vietnamesePrompts.filter(cat => cat.id === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Enhanced animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),transparent)] animate-pulse"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent)] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(119,198,255,0.15),transparent)] animate-pulse delay-1000"></div>
            </div>

            {/* Floating AI particles */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-500"></div>
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping delay-1000"></div>
            <div className="absolute bottom-10 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-1500"></div>

            <div className="container mx-auto px-4 py-6 relative z-10">
                {/* Compact Header */}
                <header className="text-center mb-12">
                    <div className="relative mb-6">
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src="https://images.pexels.com/photos/17483868/pexels-photo-17483868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                                alt="AI Brain Visualization"
                                className="w-full h-48 object-cover"
                                data-macaly="hero-image"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="flex items-center justify-center mb-3">
                                        <Brain className="w-8 h-8 mr-2 text-blue-200" />
                                        <h1 className="text-4xl font-extralight tracking-wide" data-macaly="hero-title">
                                            AI Chat Master
                                        </h1>
                                    </div>
                                    <p className="text-lg font-light opacity-90 max-w-2xl mx-auto" data-macaly="hero-subtitle">
                                        Khám phá nghệ thuật giao tiếp với AI và bộ sưu tập 100+ prompt tiếng Việt
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 mb-6">
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20 backdrop-blur-sm">
                            <Bot className="w-3 h-3 mr-1" />
                            AI Conversations
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20 backdrop-blur-sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Prompt Engineering
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20 backdrop-blur-sm">
                            <Globe className="w-3 h-3 mr-1" />
                            100+ Templates
                        </Badge>
                    </div>
                </header>

                {/* Main Content */}
                <Tabs defaultValue="prompts" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/10 backdrop-blur-sm border-white/20">
                        <TabsTrigger value="guide" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Guide
                        </TabsTrigger>
                        <TabsTrigger value="prompts" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            <Sparkles className="w-4 h-4 mr-2" />
                            English
                        </TabsTrigger>
                        <TabsTrigger value="vietnamese" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            <Globe className="w-4 h-4 mr-2" />
                            Tiếng Việt
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="guide" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Target className="w-5 h-5 text-blue-400" />
                                        Getting Started
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-medium mb-1">1. Be Clear and Specific</h4>
                                        <p className="text-gray-300 text-xs">Use explicit instructions separated by ### or """ for clarity.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">2. Specify Output Format</h4>
                                        <p className="text-gray-300 text-xs">Define desired length, format, and style clearly.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">3. Use Latest Models</h4>
                                        <p className="text-gray-300 text-xs">Leverage GPT-4+ for improved accuracy.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Lightbulb className="w-5 h-5 text-emerald-400" />
                                        Advanced Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-medium mb-1">Dynamic Prompting</h4>
                                        <p className="text-gray-300 text-xs">Adjust follow-ups based on responses.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">Recursive Prompting</h4>
                                        <p className="text-gray-300 text-xs">Build on previous outputs systematically.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">Reference Integration</h4>
                                        <p className="text-gray-300 text-xs">Provide source material to reduce errors.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {techniques.map((technique, index) => (
                                <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            {technique.icon}
                                            {technique.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                                            <p className="text-xs text-gray-300 mb-2 line-clamp-2">"{technique.example}"</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7"
                                                onClick={() => copyPrompt(technique.example)}
                                            >
                                                <Copy className="w-3 h-3 mr-1" />
                                                {copiedPrompt === technique.example ? "Copied!" : "Copy"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="prompts" className="space-y-6">
                        {/* Category Filter */}
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-white text-lg">
                                    <Filter className="w-5 h-5" />
                                    Filter by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        className={selectedCategory === 'all'
                                            ? 'bg-white/20 text-white border-white/20'
                                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                        }
                                        onClick={() => setSelectedCategory('all')}
                                    >
                                        All Categories
                                    </Button>
                                    {promptCategories.map((category) => (
                                        <Button
                                            key={category.id}
                                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                                            size="sm"
                                            className={selectedCategory === category.id
                                                ? 'bg-white/20 text-white border-white/20'
                                                : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                            }
                                            onClick={() => setSelectedCategory(category.id)}
                                        >
                                            {category.genre}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compact Prompt Display */}
                        <div className="grid gap-4">
                            {filteredEnglishPrompts.map((category, index) => (
                                <Card key={index} className={`${category.color} ${category.borderColor} border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className={`flex items-center gap-2 ${category.textColor} text-lg`}>
                                                <Sparkles className="w-5 h-5" />
                                                {category.genre}
                                            </CardTitle>
                                            <Badge className={`${category.badgeColor} text-xs`}>
                                                {category.prompts.length} prompts
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-2">
                                            {category.prompts.map((prompt, promptIndex) => (
                                                <div key={promptIndex} className="bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-white/20 hover:bg-white/95 transition-all duration-300">
                                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">"{prompt}"</p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-gray-900 border-gray-300 hover:bg-gray-50 text-xs h-7"
                                                            onClick={() => copyPrompt(prompt)}
                                                        >
                                                            <Copy className="w-3 h-3 mr-1" />
                                                            {copiedPrompt === prompt ? "Copied!" : "Copy"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="vietnamese" className="space-y-6">
                        {/* Category Filter */}
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-white text-lg">
                                    <Filter className="w-5 h-5" />
                                    Lọc theo danh mục
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        className={selectedCategory === 'all'
                                            ? 'bg-white/20 text-white border-white/20'
                                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                        }
                                        onClick={() => setSelectedCategory('all')}
                                    >
                                        Tất cả danh mục
                                    </Button>
                                    {vietnamesePrompts.map((category) => (
                                        <Button
                                            key={category.id}
                                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                                            size="sm"
                                            className={selectedCategory === category.id
                                                ? 'bg-white/20 text-white border-white/20'
                                                : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                            }
                                            onClick={() => setSelectedCategory(category.id)}
                                        >
                                            {category.genre}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compact Vietnamese Prompt Display */}
                        <div className="grid gap-4">
                            {filteredVietnamesePrompts.map((category, index) => (
                                <Card key={index} className={`${category.color} ${category.borderColor} border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className={`flex items-center gap-2 ${category.textColor} text-lg`}>
                                                <Sparkles className="w-5 h-5" />
                                                {category.genre}
                                            </CardTitle>
                                            <Badge className={`${category.badgeColor} text-xs`}>
                                                {category.prompts.length} mẫu
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-2">
                                            {category.prompts.map((prompt, promptIndex) => (
                                                <div key={promptIndex} className="bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-white/20 hover:bg-white/95 transition-all duration-300">
                                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">"{prompt}"</p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-gray-900 border-gray-300 hover:bg-gray-50 text-xs h-7"
                                                            onClick={() => copyPrompt(prompt)}
                                                        >
                                                            <Copy className="w-3 h-3 mr-1" />
                                                            {copiedPrompt === prompt ? "Đã sao chép!" : "Sao chép"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <footer className="mt-12 text-center text-gray-400">
                    <p className="text-sm">Được xây dựng với ❤️ để giúp bạn thành thạo nghệ thuật giao tiếp AI</p>
                </footer>
            </div>
        </div>
    );
}