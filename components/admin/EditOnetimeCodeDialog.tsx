"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Onetimecode } from '@/types/Onetimecode';
import { updateOnetimecode, getListOnetimecodes, insertOnetimecode } from '@/lib/api'; // Import hàm updateUser
import { useAuth } from '@/contexts/AuthContext';

interface EditOnetimeCodeDialogProps {
    code: Onetimecode | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (code: Onetimecode) => void;
}



export function EditOnetimeCodeDialog({ code, open, onOpenChange, onSave }: EditOnetimeCodeDialogProps) {
    const defaultCode: Onetimecode = {
        id: 0,
        email: '',
        secret: ''
    };

    const defaultUserOnetimecode: Onetimecode = {
        id: 0,
        email: '',
        secret: '',
    };

    const [formData, setFormData] = useState<Onetimecode>(code || defaultUserOnetimecode);
    const [onetimecodes, setOnetimecode] = useState<Onetimecode[]>([]);;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [searchTerm, setSearchTerm] = useState("");
    const [editingCode, setEditingCode] = useState<Onetimecode | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { sessionId, role } = useAuth(); // ví dụ


    // Reset form data when user prop changes or dialog opens
    useEffect(() => {
        if (open) {
            if (code) {
                setFormData({
                    ...code,
                    email: code.email,
                    secret: code.secret
                } as Onetimecode);
            } else {
                setFormData(defaultUserOnetimecode);
            }
        }
    }, [code, open]);

    const handleSave = async () => {
        setLoading(true);
        setError("");

        if (!sessionId) {
            setError("Session ID is missing.");
            setLoading(false);
            return;
        }

        try {
            onSave(formData);
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
                        <Label htmlFor="name" className="text-right">Secret</Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.secret}
                            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                            className="col-span-3"
                            placeholder="Nhập key secret"
                        />
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
