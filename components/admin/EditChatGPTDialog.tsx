"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatgptPayload } from '@/types/chatgpt.interface';
import { useAuth } from '@/contexts/AuthContext';

interface EditChatGPTDialogProps {
    account: ChatgptPayload | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (account: ChatgptPayload) => void;
}

export function EditChatGPTDialog({
    account,
    open,
    onOpenChange,
    onSave
}: EditChatGPTDialogProps) {
    const [formData, setFormData] = useState<ChatgptPayload>({
        id: 0,
        email: '',
        password: '',
        two_fa: null,
        start_date: null,
        end_date: null,
        count_user: 0,
        category: '', // Default to empty, you can set it based on selection
        status: 1, // Assuming 1 is active, 0 is inactive
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { sessionId } = useAuth();
    const [categories] = useState(["Plus", "Business"]); // Predefined categories
    const [statusOptions] = useState([
        { value: 1, label: "Hoạt động" },
        { value: 0, label: "Hết hạn" },
        { value: 2, label: "Gia hạn" }
    ]); // Predefined status options

    // Use useEffect to update formData when account changes
    useEffect(() => {
        if (account) {
            setFormData({
                ...account,
                start_date: account.start_date ? new Date(account.start_date).toISOString().slice(0, 10) : '',
                end_date: account.end_date ? new Date(account.end_date).toISOString().slice(0, 10) : '',
            });
        } else {
            setFormData({
                id: Date.now(),
                email: '',
                password: '',
                two_fa: null,
                start_date: '',
                end_date: '',
                count_user: 0,
                category: '', // Default category to empty
                status: 1,
            });
        }
    }, [account]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const updatedAccount: ChatgptPayload = { ...formData };

        try {
            onSave(updatedAccount);
            onOpenChange(false); // Close modal after saving
        } catch (err: any) {
            setError('There was an error saving the account');
        } finally {
            setLoading(false);
        }
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: password }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {account ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin tài khoản</h3>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Mật khẩu *</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="password"
                                        value={formData.password || ''}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Password123!"
                                        required
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateRandomPassword}
                                        className="whitespace-nowrap"
                                    >
                                        Tạo ngẫu nhiên
                                    </Button>
                                </div>
                            </div>

                            {/* Category Field */}
                            <div>
                                <Label htmlFor="category">Danh mục *</Label>
                                <Select
                                    value={formData.category || ''}
                                    onValueChange={(value) =>
                                        setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category, index) => (
                                            <SelectItem key={index} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="two_fa">Mã 2FA</Label>
                                <Input
                                    id="two_fa"
                                    value={formData.two_fa || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, two_fa: e.target.value }))}
                                    placeholder="Mã 2FA"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin khác</h3>

                            <div>
                                <Label>Ngày bắt đầu</Label>
                                <Input
                                    type="date"
                                    value={formData.start_date || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label>Ngày kết thúc</Label>
                                <Input
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="count_user">Số người dùng</Label>
                                <Input
                                    id="count_user"
                                    type="number"
                                    value={formData.count_user}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            count_user: Number(e.target.value)
                                        }))}
                                    min="0"
                                />
                            </div>

                            {/* Status Field */}
                            <div>
                                <Label htmlFor="status">Trạng thái *</Label>
                                <Select
                                    value={String(formData.status) || '1'} // Đảm bảo giá trị luôn là chuỗi
                                    onValueChange={(value) => {
                                        const statusValue = Number(value); // Chuyển giá trị từ chuỗi sang số
                                        setFormData(prev => ({
                                            ...prev,
                                            status: statusValue
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status, index) => (

                                            <SelectItem key={status.value} value={String(status.value)}> {/* Đảm bảo giá trị trong SelectItem là chuỗi */}
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                            </div>

                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : account ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>

            </DialogContent>
        </Dialog>
    );
}
