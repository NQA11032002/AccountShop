"use client";

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

function useItemsPerSlide() {
  const [items, setItems] = useState(3);
  useEffect(() => {
    const mq = (w: number) => window.matchMedia(`(min-width: ${w}px)`);
    const update = () => {
      if (mq(1024).matches) setItems(3);
      else if (mq(768).matches) setItems(2);
      else setItems(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return items;
}
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = useItemsPerSlide();

  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      role: 'Sinh viên',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Mình đã mua Netflix Premium từ QAI Store được 3 tháng rồi, tài khoản vẫn hoạt động tốt. Giá rẻ hơn mua chính hãng rất nhiều và có bảo hành nữa. Rất uy tín!',
      product: 'Netflix Premium',
      date: '2 ngày trước',
      verified: true
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      role: 'Nhân viên văn phòng',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Spotify Premium mua ở đây rất OK. Giao hàng tự động ngay sau khi chuyển khoản, không phải chờ đợi. Âm thanh chất lượng cao, không có quảng cáo nào cả.',
      product: 'Spotify Premium',
      date: '1 tuần trước',
      verified: true
    },
    {
      id: 3,
      name: 'Lê Minh Cường',
      role: 'Freelancer',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'ChatGPT Plus ở QAI Store giá tốt lắm. Mình dùng để làm việc hàng ngày, GPT-4 nhanh và mượt. Hỗ trợ khách hàng qua Telegram rất nhanh, có vấn đề gì là giải quyết liền.',
      product: 'ChatGPT Plus',
      date: '3 ngày trước',
      verified: true
    },
    {
      id: 4,
      name: 'Phạm Thu Hương',
      role: 'Content Creator',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Canva Pro mua ở đây rất tiện, có đầy đủ template premium và font chữ đẹp. Giá chỉ bằng 1/3 so với mua chính hãng. Đã mua lần 2 rồi, sẽ tiếp tục ủng hộ shop.',
      product: 'Canva Pro',
      date: '5 ngày trước',
      verified: true
    },
    {
      id: 5,
      name: 'Hoàng Đức Nam',
      role: 'Designer',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Adobe Creative Suite đầy đủ các app, dùng Photoshop, Illustrator mượt mà. Tài khoản ổn định, chưa gặp vấn đề gì. Sẽ giới thiệu cho bạn bè cùng nghề.',
      product: 'Adobe Creative',
      date: '1 ngày trước',
      verified: true
    },
    {
      id: 6,
      name: 'Vũ Thị Mai',
      role: 'Học sinh',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'YouTube Premium không quảng cáo rất tuyệt. Xem video học tập không bị gián đoạn, còn có YouTube Music nữa. Shop bán giá sinh viên, rất hợp lý.',
      product: 'YouTube Premium',
      date: '4 ngày trước',
      verified: true
    }
  ];

  const totalSlides = Math.max(1, Math.ceil(testimonials.length / itemsPerSlide));

  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, totalSlides - 1));
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const currentTestimonials = testimonials.slice(
    currentSlide * itemsPerSlide,
    (currentSlide + 1) * itemsPerSlide
  );

  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 to-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16 animate-fade-in">
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mb-3 sm:mb-4 text-xs sm:text-sm">
            Khách hàng nói gì?
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 sm:mb-4 px-2">
            Đánh giá từ 
            <span className="gradient-text"> khách hàng thực</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 text-balance px-2">
            Hàng nghìn khách hàng đã tin tưởng và hài lòng với dịch vụ của chúng tôi
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {currentTestimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className={`product-card h-full animate-fade-in animation-delay-${index * 100}`}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-brand-blue/20" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <blockquote className="text-gray-700 text-sm leading-relaxed mb-6 flex-grow">
                    "{testimonial.comment}"
                  </blockquote>

                  {/* Product Badge */}
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs border-brand-blue text-brand-blue">
                      {testimonial.product}
                    </Badge>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-brand-blue text-white text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-brand-charcoal text-sm">{testimonial.name}</p>
                          {testimonial.verified && (
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">{testimonial.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0 border-gray-300 hover:border-brand-blue hover:text-brand-blue shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Slide Indicators */}
            <div className="flex gap-1.5 sm:gap-2">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-brand-blue w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0 border-gray-300 hover:border-brand-blue hover:text-brand-blue shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="mt-10 sm:mt-14 lg:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in animation-delay-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-blue mb-0.5 sm:mb-1">4.9</div>
              <div className="text-xs sm:text-sm text-gray-600">Đánh giá trung bình</div>
              <div className="flex justify-center mt-1 sm:mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-blue mb-0.5 sm:mb-1">2,450</div>
              <div className="text-xs sm:text-sm text-gray-600">Đánh giá tổng</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-blue mb-0.5 sm:mb-1">98%</div>
              <div className="text-xs sm:text-sm text-gray-600">Khách hàng hài lòng</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-blue mb-0.5 sm:mb-1">5,000+</div>
              <div className="text-xs sm:text-sm text-gray-600">Khách hàng tin tưởng</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}