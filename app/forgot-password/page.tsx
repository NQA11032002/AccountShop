"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Mail, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset, resetPasswordWithCode } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const handleSendCode = async () => {
    setFormError("");
    if (!email.trim()) {
      setFormError("Vui lòng nhập email đăng ký trước khi gửi mã xác nhận.");
      toast({
        title: "Thiếu email",
        description: "Vui lòng nhập email đăng ký tài khoản.",
        variant: "destructive",
      });
      return;
    }

    setSendingCode(true);
    try {
      const res = await requestPasswordReset(email);
      toast({
        title: "Đã gửi mã xác nhận",
        description: res.message || "Vui lòng kiểm tra email của bạn.",
      });
    } catch (e: any) {
      toast({
        title: "Gửi mã thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !code.trim() || !password || !passwordConfirmation) {
      setFormError("Vui lòng nhập đầy đủ email, mã xác nhận, mật khẩu mới và xác nhận mật khẩu.");
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đủ email, mã xác nhận và mật khẩu mới.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      setFormError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      setFormError("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      toast({
        title: "Xác nhận mật khẩu không khớp",
        description: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
        variant: "destructive",
      });
      return;
    }

    setResetting(true);
    try {
      const res = await resetPasswordWithCode({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: res.message || "Bạn có thể đăng nhập với mật khẩu mới.",
      });
      router.push("/login");
    } catch (e: any) {
      setFormError(e?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container-max section-padding py-10 sm:py-14">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-charcoal flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-brand-blue" />
                Quên mật khẩu
              </CardTitle>
              <CardDescription>
                Nhập email để nhận mã xác nhận, sau đó đặt mật khẩu mới.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email đăng ký</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      placeholder="you@example.com"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="bg-gradient-to-r from-brand-emerald to-brand-blue text-white"
                  >
                    {sendingCode ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi mã"
                    )}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {formError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Mã xác nhận</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Nhập mã 6 số trong email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password-confirmation">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="new-password-confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={resetting}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg"
                >
                  {resetting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                Đã nhớ mật khẩu?{" "}
                <Link href="/login" className="text-brand-blue hover:underline inline-flex items-center gap-1">
                  Quay lại đăng nhập
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

