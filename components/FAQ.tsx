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
      question: 'Dịch vụ có ổn định không?',
      answer: 'Tất cả gói dịch vụ đều được kiểm tra kỹ trước khi bàn giao và có bảo hành. Nếu gặp vấn đề, chúng tôi sẽ hỗ trợ xử lý theo chính sách hoặc hoàn tiền 100%.'
    },
    {
      question: 'Làm sao để nhận thông tin sử dụng sau khi thanh toán?',
      answer: 'Sau khi hoàn tất thanh toán, hệ thống sẽ gửi hướng dẫn và thông tin truy cập qua email hoặc Telegram/Zalo (thường trong vòng 1–5 phút). Nếu quá thời gian này bạn chưa nhận được, hãy liên hệ hỗ trợ để được xử lý.'
    },
    {
      question: 'Có những hình thức thanh toán nào?',
      answer: 'Chúng tôi chấp nhận thanh toán qua Momo, chuyển khoản ngân hàng (Vietcombank, Techcombank, BIDV), thẻ cào điện thoại và các ví điện tử khác.'
    },
    {
      question: 'Có cần thay đổi thông tin đăng nhập không?',
      answer: 'Bạn sẽ nhận được hướng dẫn/thông tin cần thiết để sử dụng ngay. Để đảm bảo ổn định, vui lòng làm theo hướng dẫn kèm theo (nếu có).'
    },
    {
      question: 'Có được sử dụng đồng thời trên nhiều thiết bị?',
      answer: 'Tùy từng gói dịch vụ sẽ có giới hạn thiết bị khác nhau. Chi tiết sẽ được ghi rõ trong mô tả sản phẩm.'
    },
    {
      question: 'Chính sách bảo hành như thế nào?',
      answer: 'Tất cả gói dịch vụ đều có bảo hành theo thời hạn gói mua. Nếu phát sinh sự cố, chúng tôi sẽ hỗ trợ xử lý hoặc hoàn tiền trong vòng 24h theo chính sách.'
    },
    {
      question: 'Có cần cung cấp thông tin cá nhân không?',
      answer: 'Chỉ cần email hoặc số điện thoại để nhận hướng dẫn/thông tin sử dụng. Chúng tôi cam kết bảo mật thông tin khách hàng tuyệt đối.'
    },
    {
      question: 'Làm sao liên hệ hỗ trợ khi cần?',
      answer: 'Bạn có thể liên hệ qua Telegram: @qaistore hoặc Zalo: 038.966.0305. Đội ngũ hỗ trợ làm việc 24/7, phản hồi trong vòng 5 phút.'
    },
    {
      question: 'Có được đổi trả nếu không hài lòng?',
      answer: 'Trong vòng 24h đầu, nếu dịch vụ không hoạt động hoặc không đúng mô tả, chúng tôi sẽ hỗ trợ xử lý hoặc hoàn tiền 100%.'
    },
    {
      question: 'Vì sao giá có thể tối ưu hơn?',
      answer: 'Chúng tôi tối ưu quy trình vận hành và chi phí triển khai nên có thể đưa ra mức giá tốt hơn, đồng thời vẫn đảm bảo nội dung và quyền lợi đúng theo mô tả.'
    }
  ];

  return (
    <section className="section-spacing-home bg-white">
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