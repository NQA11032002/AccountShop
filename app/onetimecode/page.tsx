"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getOnetimeCode } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Prompt() {
    const [status, setStatus] = useState(false);
    const [code, setCode] = useState('');
    const { toast } = useToast();
    const [expiresIn, setExpiresIn] = useState(0); // seconds left
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isCopying, setIsCopying] = useState(false);

    const [formData, setFormData] = useState({
        emailAccount: '',
        emailUser: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn reload trang

        if (expiresIn > 0) {
            toast({
                title: "⏳ Vui lòng đợi",
                description: `Vui lòng đợi ${expiresIn} giây nữa trước khi nhận mã mới.`,
                variant: "default",
            });
            return;
        }

        try {
            const result = await getOnetimeCode(formData.emailAccount, formData.emailUser);

            if (result.status) {
                setStatus(result.status);

                setCode(result.otp);

                setExpiresIn(result.expires_in);

                // Optional: clear any old timer
                if (timerRef.current) clearInterval(timerRef.current);

                // Start countdown
                timerRef.current = setInterval(() => {
                    setExpiresIn(prev => {
                        if (prev <= 1) {
                            if (timerRef.current !== null) clearInterval(timerRef.current);
                            setIsCopying(false);
                            setStatus(false); // Expired!
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
            else {
                toast({
                    title: "⚠️ Không nhận được mã",
                    description: `Hệ thống chưa ghi nhận email đặt dịch vụ này. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ qua Zalo/Telegram.`,
                    variant: "destructive",
                });
            }
        } catch (e) {
            toast({
                title: "⚠️ Không nhận được mã",
                description: `Đã có lỗi xảy ra trong quá trình cấp mã. Vui lòng thử lại sau.`,
                variant: "destructive",
            });
        }


    };

    const copyPrompt = () => {
        if (isCopying) return; // Ngăn bấm nhiều lần
        navigator.clipboard.writeText(code);
        setIsCopying(true);
    };

    // Clean up timer when component unmounts (important!!)
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Page Header */}
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-14">
                <div className="container-max section-padding">
                    <div className="text-center text-white">
                        <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-2">
                            🌟 Mã xác thực đơn hàng
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Kích hoạt dịch vụ
                            <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent p-1">
                                Nhanh chóng & An toàn
                            </span>
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Hệ thống tự động cấp mã xác thực dùng một lần, giúp Anh/Chị kích hoạt nhanh các dịch vụ đã đặt mua tại QAI STORE.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content with Sidebar */}
            <section className="py-8">
                <div className="container-max section-padding">
                    <div>
                        <Card className="shadow-xl border-0 bg-white">
                            <CardHeader className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white rounded-t-lg">
                                <CardTitle className="text-2xl font-bold flex items-center">
                                    <Send className="w-6 h-6 mr-2" />
                                    Nhận mã xác thực tự động
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Email */}
                                    <div>
                                        <Label htmlFor="emailAccount" className="text-gray-700 font-medium">
                                            Email đã đặt dịch vụ *
                                        </Label>
                                        <Input
                                            id="emailAccount"
                                            name="emailAccount"
                                            type="email"
                                            value={formData.emailAccount}
                                            onChange={handleInputChange}
                                            placeholder="example@gmail.com"
                                            required
                                            className="mt-2 border-gray-300 focus:border-brand-blue focus:via-purple-600"
                                        />
                                    </div>

                                    {/* Problem */}
                                    <div>
                                        <Label htmlFor="emailUser" className="text-gray-700 font-medium">
                                            Email liên hệ của bạn *
                                        </Label>
                                        <Input
                                            id="emailUser"
                                            name="emailUser"
                                            value={formData.emailUser}
                                            onChange={handleInputChange}
                                            placeholder="example@gmail.com"
                                            required
                                            className="mt-2 border-gray-300 focus:border-brand-blue focus:via-purple-600"
                                        />
                                    </div>

                                    <div>
                                        {status && (
                                            <div className='flex gap-3 items-center'>
                                                <Label htmlFor="problem" className="text-gray-700 font-medium">
                                                    Mã xác thực của bạn: <span className='bg-violet-500 text-white p-3 rounded-md'>{code}</span>
                                                </Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-gray-900 border-gray-300 hover:bg-gray-50 text-xs h-7"
                                                    onClick={copyPrompt}
                                                    disabled={isCopying} // <- Disable nút khi đang copy
                                                >
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    {isCopying ? "Đã sao chép!" : "Sao chép"}
                                                </Button>
                                                <p className="text-sm text-red-500 mt-1">
                                                    Mã sẽ hết hạn sau: {expiresIn} giây
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={expiresIn > 0}
                                        className="w-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white hover:from-blue-700 hover:to-purple-700 t font-semibold py-3 text-lg"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        {expiresIn > 0 ? `Vui lòng đợi ${expiresIn}s` : 'Nhận mã xác thực'}
                                    </Button>
                                </form>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Lưu ý:</strong> Mã xác thực chỉ có hiệu lực trong thời gian ngắn và được cấp cho từng yêu cầu. Vui lòng nhập đúng email đã đặt dịch vụ để được xử lý chính xác. <br></br>
                                        Vì lý do bảo mật, Anh/Chị không nên chia sẻ mã cho người khác. <br></br>
                                        Cần hỗ trợ nhanh, vui lòng liên hệ Zalo/điện thoại <strong>038.966.0305</strong> hoặc Telegram <strong>@qaistore</strong>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}