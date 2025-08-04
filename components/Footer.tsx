"use client";

import { Facebook, MessageCircle, Mail, Phone, MapPin, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Footer() {
  console.log("Footer component rendered");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription submitted");
    // Future: Handle newsletter subscription
  };

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Trang chủ', href: '#home' },
    { name: 'Danh mục tài khoản', href: '#categories' },
    { name: 'Cách mua hàng', href: '#how-to-buy' },
    { name: 'Liên hệ', href: '#contact' },
  ];

  const categories = [
    { name: 'Netflix Premium', href: '#netflix' },
    { name: 'Spotify Premium', href: '#spotify' },
    { name: 'ChatGPT Plus', href: '#chatgpt' },
    { name: 'YouTube Premium', href: '#youtube' },
    { name: 'Canva Pro', href: '#canva' },
    { name: 'Adobe Creative', href: '#adobe' },
  ];

  const policies = [
    { name: 'Chính sách bảo hành', href: '#warranty' },
    { name: 'Điều khoản dịch vụ', href: '#terms' },
    { name: 'Chính sách bảo mật', href: '#privacy' },
    { name: 'Chính sách đổi trả', href: '#return' },
  ];

  return (
    <footer className="bg-brand-charcoal text-white">
      {/* Main Footer */}
      <div className="container-max section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Contact */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                {/* <span className="text-white font-bold text-xl">Q</span> */}
                <img src="/images/logo.png" alt="" />
              </div>
              <div>
                <h3 className="text-xl font-bold">QAI STORE</h3>
                <p className="text-gray-400 text-sm">SHOP TÀI KHOẢN</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed">
              Cung cấp tài khoản premium chất lượng cao với giá tốt nhất thị trường.
              Cam kết bảo hành và hỗ trợ khách hàng 24/7.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Uy tín
              </Badge>
              <Badge className="bg-blue-600 text-white">
                <Clock className="w-3 h-3 mr-1" />
                24/7
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-brand-emerald" />
                <span>Hotline: 038.966.0305</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-brand-emerald" />
                <span>Email: qaistore.cskh@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-brand-emerald" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-brand-emerald transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-lg font-semibold pt-4">Chính sách</h4>
            <ul className="space-y-3">
              {policies.map((policy) => (
                <li key={policy.name}>
                  <a
                    href={policy.href}
                    className="text-gray-300 hover:text-brand-emerald transition-colors text-sm"
                  >
                    {policy.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Danh mục sản phẩm</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-gray-300 hover:text-brand-emerald transition-colors text-sm"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Working Hours */}
            <div className="pt-4">
              <h5 className="font-medium mb-3">Giờ hỗ trợ</h5>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Thứ 2 - Chủ nhật:</span>
                  <span>8h30 - 12h, 14h30 - 12h</span>
                </div>
                {/* <div className="flex justify-between">
                  <span>Hỗ trợ khẩn cấp:</span>
                  <span>24/7</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Theo dõi chúng tôi</h4>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/qaistorethegioiai/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/storeqai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                className="w-10 h-10 cursor-default bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="font-medium mb-3">Nhận thông báo khuyến mãi</h5>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-brand-emerald"
                />
                <Button
                  type="submit"
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-white"
                >
                  Đăng ký
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-2">
                Nhận thông báo về các sản phẩm mới và ưu đãi đặc biệt
              </p>
            </div>

            {/* Payment Methods */}
            <div>
              <h5 className="font-medium mb-3">Phương thức thanh toán</h5>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded p-2 text-center text-xs">MoMo</div>
                <div className="bg-gray-800 rounded p-2 text-center text-xs">Banking</div>
                <div className="bg-gray-800 rounded p-2 text-center text-xs">Thẻ cào</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-max section-padding py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} QAI STORE. Tất cả quyền được bảo lưu.
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Thiết kế bởi QAI Team</span>
              <span>•</span>
              <span>Made with ❤️ in Vietnam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}