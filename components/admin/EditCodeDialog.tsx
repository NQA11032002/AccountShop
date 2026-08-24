"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { userOnetimecode, Onetimecode } from '@/types/Onetimecode';
import { getListOnetimecodes } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface EditCodeDialogProps {
    code: userOnetimecode | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (code: userOnetimecode) => void;
}



export function EditCodeDialog({ code, open, onOpenChange, onSave }: EditCodeDialogProps) {
    const defaultCode: Onetimecode = {
        id: 0,
        email: '',
        secret: ''
    };

    const defaultUserOnetimecode: userOnetimecode = {
        id: 0,
        id_onetimecode: 0,
        email: '',
        name: '',
        ip: '',
        count_logined: '',
        date_logined: '',
        current_date_login: '',
        status: '1',          // 👈 cho mặc định là "Hoạt động"
        onetimecode: defaultCode
    };

    const [formData, setFormData] = useState<userOnetimecode>(code || defaultUserOnetimecode);
    const [onetimecodes, setOnetimecode] = useState<Onetimecode[]>([]);;
    const [onetimecodeEmail, setOnetimecodeEmail] = useState('');

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { sessionId } = useAuth();


    // Reset form data when user prop changes or dialog opens
    useEffect(() => {
        if (open) {
            setError('');
            if (code) {
                setFormData({
                    ...code,
                    status: code.status == '1' || code.status === '1' ? '1' : '0', // 👈 chuẩn hoá
                } as userOnetimecode);
                setOnetimecodeEmail(code.onetimecode?.email ?? '');
            } else {
                setFormData(defaultUserOnetimecode);
                setOnetimecodeEmail('');
            }
            loadOnetimecode();
        }
    }, [code, open]);

    const loadOnetimecode = async () => {
        if (!sessionId) {
            setError('Session ID is missing.');
            return;
        }
        try {
            setLoading(true); // (tùy chọn) đặt loading khi fetch
            const data = await getListOnetimecodes(sessionId);
            setOnetimecode(data.data);
            // ❌ KHÔNG đóng dialog ở đây
            // onOpenChange(false);
        } catch (err: any) {
            setError(err.message || 'Error loading onetime codes');
        } finally {
            setLoading(false);
        }
    };


    const handleSave = async () => {
        setLoading(true);
        setError("");

        if (!sessionId) {
            setError("Session ID is missing.");
            setLoading(false);
            return;
        }

        const normalizedEmail = onetimecodeEmail.trim().toLowerCase();
        const selectedOnetimecode = onetimecodes.find(
            (item) => item.email.trim().toLowerCase() === normalizedEmail
        );

        if (!normalizedEmail) {
            setError("Vui lòng nhập email One-time code.");
            setLoading(false);
            return;
        }

        if (!selectedOnetimecode) {
            setError("Email One-time code không tồn tại trong danh sách 2FA.");
            setLoading(false);
            return;
        }

        try {
            onSave({
                ...formData,
                id_onetimecode: selectedOnetimecode.id,
                onetimecode: selectedOnetimecode,
            });
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {code ? 'Chỉnh sửa mail lấy code' : 'Thêm mail lấy code'}
                    </DialogTitle>
                    <DialogDescription>
                        {code ? 'Cập nhật thông tin code' : 'Nhập thông tin để tạo code'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    {/* Points */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="col-span-3"
                            placeholder="example@xxx.com"
                        />
                    </div>


                    {/* Tên khách hàng */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">khách hàng</Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>


                    {/* Email One-time code */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="onetimecode-email" className="text-right">One-time code</Label>
                        <Input
                            id="onetimecode-email"
                            type="email"
                            value={onetimecodeEmail}
                            onChange={(event) => {
                                setOnetimecodeEmail(event.target.value);
                                setError('');
                            }}
                            disabled={loading}
                            className="col-span-3"
                            placeholder={loading ? "Đang tải..." : "Nhập email One-time code"}
                            autoComplete="off"
                        />
                        {error && (
                            <p className="col-start-2 col-span-3 text-sm text-red-600">{error}</p>
                        )}
                    </div>


                    {/* Status */}
                    {/* Status */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Trạng thái</Label>
                        <Select
                            value={formData.status?.toString() ?? ""}   // 👈 ép về string
                            onValueChange={(value) =>
                                setFormData({ ...formData, status: value as '0' | '1' })
                            }
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Hoạt động</SelectItem>
                                <SelectItem value="0">Tạm dừng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        {code ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
