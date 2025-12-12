"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatgptPayload } from '@/types/chatgpt.interface';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { getAccountsByChatgptId } from '@/lib/api';
import { CustomerAccount } from "@/types/CustomerAccount"; // hoặc đúng type bạn đang dùng

interface UserChatGPTDialogProps {
    account: ChatgptPayload | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (account: ChatgptPayload) => void;

}


export function UserChatGPTDialog({
    account,
    open,
    onOpenChange,
    onSave
}: UserChatGPTDialogProps) {
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
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    // Use useEffect to update formData when account changes
    useEffect(() => {
        const run = async () => {
            // dialog chưa mở thì không làm gì
            if (!open) return;

            // nếu không có account thì reset
            if (!account?.id) {
                setAccounts([]);
                return;
            }

            setIsFetching(true);
            try {
                // set form
                setFormData({
                    ...account,
                    start_date: account.start_date ? new Date(account.start_date).toISOString().slice(0, 10) : '',
                    end_date: account.end_date ? new Date(account.end_date).toISOString().slice(0, 10) : '',
                });

                // load accounts
                if (sessionId) {
                    const res = await getAccountsByChatgptId(sessionId, account.id);
                    setAccounts(res.data || []);
                } else {
                    setAccounts([]);
                }
            } catch (e) {
                console.error("Load accounts by chatgpt_id failed:", e);
                setAccounts([]);
            } finally {
                setIsFetching(false);
            }
        };

        run();
    }, [open, account?.id, sessionId]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("vi-VN");
    };


    const statusBadge = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s === "active") return { text: "Hoạt động", cls: "bg-green-100 text-green-700 border-green-300" };
        if (s === "expired") return { text: "Hết hạn", cls: "bg-red-100 text-red-700 border-red-300" };
        if (s === "suspended") return { text: "Tạm ngưng", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" };
        return { text: status, cls: "bg-gray-100 text-gray-700 border-gray-300" };
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {account ? 'Thông tin khách hàng' : 'Thêm tài khoản mới'}
                    </DialogTitle>
                </DialogHeader>

                {isFetching ? (
                    <div className="py-10 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-gray-600">
                            <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" />
                                <path d="M4 12a8 8 0 1 0 16 0" stroke="currentColor" />
                            </svg>
                            Đang tải dữ liệu...
                        </div>
                    </div>
                ) : (
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead>Liên lạc</TableHead>
                                    <TableHead>Ngày mua</TableHead>
                                    <TableHead>Hết hạn</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {accounts.length > 0 ? (
                                    accounts.map((row) => {
                                        const st = statusBadge(row.status || "");
                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell className="font-medium">{row.id}</TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900">
                                                            {row.customer_name || "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    {row.link ? (
                                                        <a
                                                            href={row.link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                            title={row.link}
                                                        >
                                                            Xem ngay
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <span className="text-sm text-gray-600">
                                                        {row.customer_phone || "-"}
                                                    </span>
                                                </TableCell>

                                                <TableCell>{formatDate(row.purchase_date)}</TableCell>
                                                <TableCell>{formatDate(row.expiry_date)}</TableCell>

                                                <TableCell>
                                                    <Badge variant="outline" className={st.cls}>
                                                        {st.text}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}


            </DialogContent>
        </Dialog>
    );
}
