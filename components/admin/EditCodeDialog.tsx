"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { userOnetimecode, Onetimecode } from '@/types/Onetimecode';
import { updateOnetimecode, getListOnetimecodes } from '@/lib/api'; // Import hàm updateUser
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
        status: '',
        onetimecode: defaultCode
    };

    const [formData, setFormData] = useState<userOnetimecode>(code || defaultUserOnetimecode);
    const [onetimecodes, setOnetimecode] = useState<Onetimecode[]>([]);;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { sessionId } = useAuth();

    // Reset form data when user prop changes or dialog opens
    useEffect(() => {
        if (open) {
            setFormData(code || defaultUserOnetimecode);
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
        setError('');

        if (!sessionId) {
            setError('Session ID is missing.');
            setLoading(false);
            return;
        }

        try {
            // Call updateAdminUser API to update user
            const updatedUser = await updateOnetimecode(sessionId, formData);


            onSave(updatedUser); // Call onSave to update the user in the parent component

            onOpenChange(false); // Close the dialog after update
        } catch (err: any) {
            setError(err.message || 'Error saving user');
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


                    {/* Rank */}
                    {/* One-time code (từ API) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">One-time code</Label>
                        <Select
                            value={formData.id_onetimecode ? String(formData.id_onetimecode) : ""}
                            onValueChange={(value) => {
                                const selected = onetimecodes.find((x) => String(x.id) === value);
                                setFormData((prev) => ({
                                    ...prev,
                                    id_onetimecode: selected ? selected.id : 0,
                                    onetimecode: selected ?? prev.onetimecode, // cập nhật object lồng bên trong
                                }));
                            }}
                            disabled={loading || !!error}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue
                                    placeholder={
                                        loading ? "Đang tải..." : (onetimecodes.length ? "Chọn onetimecode" : "Không có onetimecode")
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {onetimecodes.map((otc) => (
                                    <SelectItem key={otc.id} value={String(otc.id)}>
                                        {otc.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    {/* Status */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Trạng thái</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: '0' | '1') =>
                                setFormData({ ...formData, status: value })
                            }
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="inactive">Không hoạt động</SelectItem>
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
