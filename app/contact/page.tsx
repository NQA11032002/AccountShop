"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MessageCircle, Send, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    problem: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Here you would normally send the data to your backend
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    setFormData({ email: '', problem: '', description: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-blue to-brand-purple text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Hỗ trợ 24/7 - Luôn sẵn sàng giải đáp mọi thắc mắc của bạn
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Thông Tin Liên Hệ
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh sau:
                </p>
              </div>

              <div className="space-y-6">
                {/* Phone */}
                <Card className="border-l-4 border-l-brand-blue hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-brand-blue/10 p-3 rounded-full">
                        <Phone className="w-6 h-6 text-brand-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Số Điện Thoại</h3>
                        <p className="text-brand-blue font-medium text-lg">0389660305</p>
                        <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Zalo */}
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Zalo</h3>
                        <p className="text-green-600 font-medium text-lg">0389660305</p>
                        <p className="text-sm text-gray-500">Chat trực tiếp nhanh chóng</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-100 p-3 rounded-full">
                        <Mail className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Hỗ Trợ</h3>
                        <p className="text-red-600 font-medium text-lg">qaistore.cskh@gmail.com</p>
                        <p className="text-sm text-gray-500">Phản hồi trong 2-4 giờ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Working Hours */}
                <Card className="border-l-4 border-l-brand-purple hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-brand-purple/10 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-brand-purple" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Giờ Làm Việc</h3>
                        <p className="text-brand-purple font-medium">24/7 - Tự Động</p>
                        <p className="text-sm text-gray-500">Hệ thống giao hàng tự động</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <Send className="w-6 h-6 mr-2" />
                    Gửi Tin Nhắn Cho Chúng Tôi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email của bạn *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@gmail.com"
                        required
                        className="mt-2 border-gray-300 focus:border-brand-blue focus:ring-brand-blue"
                      />
                    </div>

                    {/* Problem */}
                    <div>
                      <Label htmlFor="problem" className="text-gray-700 font-medium">
                        Vấn đề gặp phải *
                      </Label>
                      <Input
                        id="problem"
                        name="problem"
                        value={formData.problem}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Lỗi đăng nhập tài khoản Netflix"
                        required
                        className="mt-2 border-gray-300 focus:border-brand-blue focus:ring-brand-blue"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Mô tả chi tiết *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi có thể hỗ trợ tốt nhất..."
                        rows={5}
                        required
                        className="mt-2 border-gray-300 focus:border-brand-blue focus:ring-brand-blue resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Gửi Tin Nhắn
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Để được hỗ trợ nhanh nhất, vui lòng liên hệ trực tiếp qua Zalo hoặc điện thoại. 
                      Chúng tôi cam kết phản hồi email trong vòng 2-4 giờ.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}