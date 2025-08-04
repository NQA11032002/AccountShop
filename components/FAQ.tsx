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
      question: 'Tài khoản có hoạt động ổn định không?',
      answer: 'Tất cả tài khoản đều được kiểm tra kỹ trước khi bán và có bảo hành. Nếu gặp vấn đề, chúng tôi sẽ hỗ trợ đổi tài khoản mới hoặc hoàn tiền 100%.'
    },
    {
      question: 'Làm sao để nhận tài khoản sau khi thanh toán?',
      answer: 'Sau khi thanh toán thành công, hệ thống sẽ tự động gửi thông tin tài khoản qua email hoặc Telegram/Zalo trong vòng 1-5 phút. Không cần chờ đợi.'
    },
    {
      question: 'Có những hình thức thanh toán nào?',
      answer: 'Chúng tôi chấp nhận thanh toán qua Momo, chuyển khoản ngân hàng (Vietcombank, Techcombank, BIDV), thẻ cào điện thoại và các ví điện tử khác.'
    },
    {
      question: 'Tài khoản có bị đổi mật khẩu không?',
      answer: 'Không, bạn sẽ nhận được thông tin đăng nhập hoàn chỉnh và có thể sử dụng ngay. Tuy nhiên, không nên thay đổi thông tin tài khoản để đảm bảo hoạt động ổn định.'
    },
    {
      question: 'Có được sử dụng đồng thời trên nhiều thiết bị?',
      answer: 'Tùy từng loại tài khoản sẽ có giới hạn thiết bị khác nhau. Netflix Premium cho phép 4 màn hình, Spotify Premium 1 thiết bị cùng lúc. Chi tiết sẽ được ghi rõ trong mô tả sản phẩm.'
    },
    {
      question: 'Chính sách bảo hành như thế nào?',
      answer: 'Tất cả tài khoản đều có bảo hành theo thời hạn gói mua. Nếu tài khoản gặp sự cố, chúng tôi sẽ đổi tài khoản mới hoặc hoàn tiền trong vòng 24h.'
    },
    {
      question: 'Có cần cung cấp thông tin cá nhân không?',
      answer: 'Chỉ cần email hoặc số điện thoại để nhận thông tin tài khoản. Chúng tôi cam kết bảo mật thông tin khách hàng tuyệt đối.'
    },
    {
      question: 'Làm sao liên hệ hỗ trợ khi cần?',
      answer: 'Bạn có thể liên hệ qua Telegram: @qaistore hoặc Zalo: 0123456789. Đội ngũ hỗ trợ làm việc 24/7, phản hồi trong vòng 5 phút.'
    },
    {
      question: 'Có được đổi trả nếu không hài lòng?',
      answer: 'Trong vòng 24h đầu, nếu tài khoản không hoạt động hoặc không đúng mô tả, chúng tôi sẽ đổi tài khoản mới hoặc hoàn tiền 100%.'
    },
    {
      question: 'Tại sao giá rẻ hơn mua chính hãng?',
      answer: 'Chúng tôi có nguồn cung ổn định và bán với số lượng lớn nên có thể đưa ra giá tốt nhất cho khách hàng. Tài khoản vẫn đảm bảo chất lượng như chính hãng.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-4">
            Câu hỏi thường gặp
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
            Giải đáp mọi
            <span className="gradient-text"> thắc mắc</span>
          </h2>
          <p className="text-lg text-gray-600 text-balance">
            Tìm hiểu thêm về dịch vụ và quy trình mua tài khoản tại QAI STORE
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={`bg-gray-50 rounded-lg border border-gray-200 px-6 animate-fade-in animation-delay-${index * 50}`}
              >
                <AccordionTrigger className="text-left hover:no-underline py-6 text-brand-charcoal font-medium hover:text-brand-blue transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-brand-blue to-brand-emerald rounded-2xl p-8 md:p-12 animate-fade-in animation-delay-500">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Vẫn còn thắc mắc?
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/storeqai"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-blue hover:bg-gray-100 font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              📱 Chat Telegram
            </a>
            <a
              className="bg-white/20 cursor-default text-white border border-white/30 hover:bg-white hover:text-brand-blue font-medium px-6 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm inline-flex items-center justify-center"
            >
              📞 Gọi Zalo: 038.966.0305
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}