"use client";

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  console.log("FAQ component rendered");

  const faqs = [
    {
      question: 'Dịch vụ có chất lượng và ổn định không?',
      answer: 'Tất cả các gói (thiết kế Website, hỗ trợ AI, làm Video AI, khóa học AI) đều được kiểm duyệt nội dung và quy trình kỹ trước khi bàn giao. Nếu phát sinh vấn đề trong thời hạn bảo hành, chúng tôi sẽ hỗ trợ xử lý theo chính sách hoặc hoàn phí theo cam kết.'
    },
    {
      question: 'Sau khi thanh toán, tôi nhận tài liệu/khóa học/dịch vụ như thế nào?',
      answer: 'Sau khi hoàn tất thanh toán, hệ thống sẽ gửi link tài liệu, khóa học hoặc lịch triển khai dịch vụ qua email/Zalo/Telegram (thường trong vòng 1–5 phút). Nếu quá thời gian này bạn chưa nhận được, vui lòng liên hệ kênh hỗ trợ để được xử lý ngay.'
    },
    {
      question: 'Có những hình thức thanh toán nào?',
      answer: 'Chúng tôi nhận thanh toán qua chuyển khoản ngân hàng và các ví điện tử phổ biến (Momo, ZaloPay…). Thông tin tài khoản và mã đơn sẽ được gửi trực tiếp cho bạn khi đặt dịch vụ, kèm xác nhận giao dịch qua Zalo/Telegram.'
    },
    {
      question: 'Tôi không rành công nghệ thì có dùng được không?',
      answer: 'Có. Mỗi gói đều đi kèm hướng dẫn chi tiết, dễ làm theo cho cả người mới bắt đầu. Riêng gói thiết kế Website và làm Video AI sẽ được đội ngũ hỗ trợ triển khai trực tiếp theo yêu cầu của bạn.'
    },
    {
      question: 'Thời gian triển khai mất bao lâu?',
      answer: 'Khóa học AI và tài liệu hỗ trợ AI được bàn giao ngay sau khi thanh toán. Với gói thiết kế Website và làm Video AI, thời gian triển khai sẽ được thống nhất theo phạm vi công việc – thường từ 1–7 ngày tùy mức độ.'
    },
    {
      question: 'Chính sách bảo hành như thế nào?',
      answer: 'Mỗi gói có thời hạn bảo hành riêng được ghi rõ trong mô tả. Trong thời hạn này, nếu phát sinh lỗi thuộc phạm vi cam kết, chúng tôi sẽ xử lý miễn phí hoặc hoàn phí theo chính sách trong vòng 24h.'
    },
    {
      question: 'Có cần cung cấp thông tin cá nhân không?',
      answer: 'Chúng tôi chỉ cần email hoặc số điện thoại để bàn giao tài liệu, khóa học hoặc liên hệ trao đổi yêu cầu dịch vụ. Mọi thông tin khách hàng đều được bảo mật và không chia sẻ cho bên thứ ba.'
    },
    {
      question: 'Làm sao liên hệ hỗ trợ khi cần?',
      answer: 'Bạn có thể liên hệ qua Telegram: @qaistore hoặc Zalo: 038.966.0305. Đội ngũ hỗ trợ làm việc 24/7, phản hồi trung bình trong vòng 5 phút.'
    },
    {
      question: 'Có được hoàn phí nếu không hài lòng?',
      answer: 'Trong vòng 24h đầu, nếu dịch vụ chưa được triển khai hoặc không đúng mô tả công khai, chúng tôi sẵn sàng hỗ trợ điều chỉnh hoặc hoàn phí theo chính sách đã công bố.'
    },
    {
      question: 'Vì sao mức giá có thể tối ưu hơn?',
      answer: 'Chúng tôi tối ưu quy trình vận hành, công cụ AI và quy mô triển khai nên có thể đưa ra mức giá hợp lý hơn, đồng thời vẫn đảm bảo chất lượng và quyền lợi đúng như mô tả.'
    }
  ];

  return (
    <section className="section-spacing-home">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16 animate-fade-in">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-3 sm:mb-4 text-xs sm:text-sm">
            Câu hỏi thường gặp
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 sm:mb-4 px-2">
            Giải đáp mọi
            <span className="gradient-text"> thắc mắc</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 text-balance px-2">
            Tìm hiểu thêm về dịch vụ và quy trình mua hàng tại QAI STORE
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={`bg-gray-50 rounded-lg border border-gray-200 px-4 sm:px-6 animate-fade-in animation-delay-${index * 50}`}
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-6 text-sm sm:text-base text-brand-charcoal font-medium hover:text-brand-blue transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 sm:pb-6 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-10 sm:mt-14 lg:mt-16 text-center bg-gradient-to-r from-brand-blue to-brand-emerald rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 animate-fade-in animation-delay-500">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
            Vẫn còn thắc mắc?
          </h3>
          <p className="text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="https://t.me/storeqai"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-blue hover:bg-gray-100 font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center text-sm sm:text-base"
            >
              📱 Chat Telegram
            </a>
            <a
              href="tel:0389660305"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 backdrop-blur-sm inline-flex items-center justify-center text-sm sm:text-base"
            >
              📞 Gọi Zalo: 038.966.0305
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}