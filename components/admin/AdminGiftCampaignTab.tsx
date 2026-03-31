"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Users, Timer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminGiftActive, sendAdminGiftWinnerGift, updateAdminGiftCurrent } from "@/lib/api";
import type { AdminGiftActiveData } from "@/types/gift.interface";

function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function AdminGiftCampaignTab() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [giftState, setGiftState] = useState<AdminGiftActiveData | null>(null);
  const [sendGiftOpen, setSendGiftOpen] = useState(false);
  const [sendingGift, setSendingGift] = useState(false);

  const [giftAccountEmail, setGiftAccountEmail] = useState("");
  const [giftAccountPassword, setGiftAccountPassword] = useState("");
  const [gift2fa, setGift2fa] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const [giftName, setGiftName] = useState("");
  const [endAtInput, setEndAtInput] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadActive = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetchAdminGiftActive(sessionId);
      setGiftState(res.data);
      setGiftName(res.data.gift_name || "");
      setEndAtInput(res.data.ends_at ? toDateTimeLocal(res.data.ends_at) : "");
      setDurationMinutes(30);
    } catch (e: any) {
      toast({
        title: "Không tải được quà tặng",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (sessionId) loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, sessionId]);

  const timeLeftMs = useMemo(() => {
    if (!giftState?.ends_at) return 0;
    const endsAtMs = new Date(giftState.ends_at).getTime();
    if (Number.isNaN(endsAtMs)) return 0;
    return Math.max(0, endsAtMs - now);
  }, [giftState?.ends_at, now]);

  const onSave = async () => {
    if (!sessionId) return;
    if (!giftName.trim()) {
      toast({ title: "Thiếu tên quà", variant: "destructive" });
      return;
    }
    if (!endAtInput && (!durationMinutes || durationMinutes <= 0)) {
      toast({
        title: "Thiếu thời gian kết thúc",
        description: "Nhập end_at hoặc duration_minutes",
        variant: "destructive",
      });
      return;
    }

    const payload: any = {
      gift_name: giftName.trim(),
    };

    if (endAtInput) {
      payload.end_at = new Date(endAtInput).toISOString();
    } else {
      payload.duration_minutes = durationMinutes;
    }

    try {
      await updateAdminGiftCurrent(sessionId, payload);
      toast({
        title: "Đã cập nhật chiến dịch quà tặng",
        description: "Danh sách tham gia đã được reset.",
      });
      await loadActive();
    } catch (e: any) {
      toast({
        title: "Cập nhật thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const winnerEmail = giftState?.winner?.email || "";

  const openSendGift = () => {
    setGiftAccountEmail("");
    setGiftAccountPassword("");
    setGift2fa("");
    setGiftNote("");
    setSendGiftOpen(true);
  };

  const onSendGift = async () => {
    if (!sessionId) return;
    if (!giftState?.winner?.name) {
      toast({ title: "Chưa có người trúng thưởng", variant: "destructive" });
      return;
    }
    if (!giftAccountEmail.trim() || !giftAccountPassword.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập Email và Pass của tài khoản quà tặng.",
        variant: "destructive",
      });
      return;
    }

    setSendingGift(true);
    try {
      await sendAdminGiftWinnerGift(sessionId, {
        account_email: giftAccountEmail.trim(),
        account_password: giftAccountPassword.trim(),
        code_2fa: gift2fa.trim() ? gift2fa.trim() : undefined,
        note: giftNote.trim() ? giftNote.trim() : undefined,
      });
      toast({
        title: "Đã gửi quà",
        description: `Đã gửi email cho ${winnerEmail || "khách trúng thưởng"}.`,
      });
      setSendGiftOpen(false);
    } catch (e: any) {
      toast({
        title: "Gửi email thất bại",
        description: e?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSendingGift(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="text-gray-600">
        Bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5">
      <div className="container-max section-padding py-10">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-6 h-6 text-brand-emerald" />
          <h1 className="text-2xl font-bold">Admin - Quà tặng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-800">Tên phần quà</div>
                  <Input value={giftName} onChange={(e) => setGiftName(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-800">End at</div>
                  <Input
                    type="datetime-local"
                    value={endAtInput}
                    onChange={(e) => setEndAtInput(e.target.value)}
                  />
                  <div className="text-xs text-gray-500">
                    Nếu có nhập End at thì hệ thống sẽ ưu tiên dùng nó.
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-800">Duration (phút)</div>
                  <Input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                </div>

                <Button
                  onClick={onSave}
                  className="w-full bg-gradient-to-r from-brand-emerald to-brand-blue hover:from-brand-emerald/90 hover:to-brand-blue/90 text-white"
                >
                  Lưu & bắt đầu lại
                </Button>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-brand-blue" />
                    <span className="font-semibold">Đếm ngược</span>
                  </div>
                  {loading || !giftState ? (
                    <div className="text-gray-500">Đang tải...</div>
                  ) : (
                    <>
                      {!giftState.has_ended ? (
                        <div className="text-3xl font-bold text-brand-charcoal">
                          {formatRemaining(timeLeftMs)}
                        </div>
                      ) : (
                        <Badge className="bg-gray-800 text-white">Đã kết thúc</Badge>
                      )}
                    </>
                  )}

                  {giftState?.winner?.name ? (
                    <div className="pt-2 text-gray-800 font-semibold">
                      Winner: <span className="text-brand-blue">{giftState.winner.name}</span>
                    </div>
                  ) : giftState?.has_ended ? (
                    <div className="text-gray-600">Chưa có khách tham gia</div>
                  ) : null}

                  {giftState?.winner?.name && (
                    <div className="pt-3">
                      <Button
                        onClick={openSendGift}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Gửi quà
                      </Button>
                      {winnerEmail ? (
                        <div className="text-xs text-gray-500 mt-2">
                          Email khách trúng thưởng: <span className="font-medium">{winnerEmail}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 mt-2">
                          Chưa có email trong dữ liệu winner (kiểm tra user.email).
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Danh sách khách tham gia</h2>
                  <Badge variant="secondary" className="bg-rose-500 text-white">
                    <Users className="w-4 h-4 mr-1 inline" />
                    {giftState?.participants?.length ?? 0} người
                  </Badge>
                </div>

                {loading || !giftState ? (
                  <div className="text-gray-500">Đang tải danh sách...</div>
                ) : (giftState.participants || []).length === 0 ? (
                  <div className="text-gray-600">Chưa có ai tham gia.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="py-3 pr-4">STT</th>
                          <th className="py-3 pr-4">Tên</th>
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3">Ngày đăng ký</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(giftState.participants || []).map((p) => (
                          <tr key={p.user_id} className="border-b border-gray-100">
                            <td className="py-3 pr-4 text-gray-700">{p.stt}</td>
                            <td className="py-3 pr-4 text-gray-800 font-medium">{p.name || "—"}</td>
                            <td className="py-3 pr-4 text-gray-700">{p.email || "—"}</td>
                            <td className="py-3 text-gray-600">
                              {p.registered_at ? new Date(p.registered_at).toLocaleDateString("vi-VN") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={sendGiftOpen} onOpenChange={setSendGiftOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-emerald" />
              Gửi quà cho khách trúng thưởng
            </DialogTitle>
            <DialogDescription>
              Email khách sẽ lấy từ danh sách user đã tham gia (winner). Bạn chỉ cần nhập thông tin tài khoản quà tặng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-800">Email khách trúng thưởng</div>
              <Input value={winnerEmail || "—"} disabled />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-800">Email</div>
                <Input value={giftAccountEmail} onChange={(e) => setGiftAccountEmail(e.target.value)} placeholder="Email tài khoản quà tặng" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-800">Pass</div>
                <Input value={giftAccountPassword} onChange={(e) => setGiftAccountPassword(e.target.value)} placeholder="Mật khẩu tài khoản quà tặng" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-800">Mã 2FA (tuỳ chọn)</div>
              <Input value={gift2fa} onChange={(e) => setGift2fa(e.target.value)} placeholder="Ví dụ: 123 456" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-800">Ghi chú (tuỳ chọn)</div>
              <Textarea value={giftNote} onChange={(e) => setGiftNote(e.target.value)} placeholder="Hướng dẫn đăng nhập, lưu ý đổi mật khẩu, thời hạn..." />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setSendGiftOpen(false)} disabled={sendingGift}>
              Hủy
            </Button>
            <Button
              onClick={onSendGift}
              disabled={sendingGift || !giftState?.winner?.name}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
            >
              {sendingGift ? "Đang gửi..." : "Gửi quà"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

