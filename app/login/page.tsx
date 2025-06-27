"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  console.log("LoginPage rendered", { email: email ? "provided" : "empty" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted", { email });
    
    if (!email || !password) {
      toast({
        title: "Lỗi đăng nhập",
        description: "Vui lòng nhập đầy đủ email và mật khẩu.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại QAI STORE.",
      });
      router.push('/');
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description: "Email hoặc mật khẩu không đúng.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-purple to-brand-blue rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại QAI STORE</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-brand-charcoal">Đăng nhập tài khoản</CardTitle>
            <CardDescription>
              Nhập thông tin để truy cập vào tài khoản của bạn
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-brand-charcoal">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10 h-12 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-brand-charcoal">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue/20" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="#" className="text-brand-blue hover:text-brand-purple transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link 
                  href="/register" 
                  className="text-brand-blue hover:text-brand-purple font-medium transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Demo Account */}
            <div className="mt-4 p-4 bg-brand-blue/5 rounded-lg border border-brand-blue/10">
              <p className="text-xs text-gray-600 text-center">
                <strong>Demo:</strong> Email: demo@qaistore.com | Mật khẩu: 123456
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-brand-blue transition-colors text-sm"
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}