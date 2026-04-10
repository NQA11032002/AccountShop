"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Users, Timer, Send, Trophy } from "lucide-react";
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
  const [winnerCount, setWinnerCount] = useState<number>(1);

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
      setWinnerCount(
        typeof res.data.winner_count === "number" && res.data.winner_count >= 1
          ? res.data.winner_count
          : 1
      );
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

    const payload: {
      gift_name: string;
      end_at?: string;
      duration_minutes?: number;
      winner_count: number;
    } = {
      gift_name: giftName.trim(),
      winner_count: Math.min(500, Math.max(1, Math.floor(winnerCount) || 1)),
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

  const winnersList =
    giftState?.winners?.length
      ? giftState.winners
      : giftState?.winner
        ? [giftState.winner]
        : [];

  const winnerEmailsText = winnersList
    .map((w) => w.email)
    .filter(Boolean)
    .join(", ");

  const openSendGift = () => {
    setGiftAccountEmail("");
    setGiftAccountPassword("");
    setGift2fa("");
    setGiftNote("");
    setSendGiftOpen(true);
  };

  const onSendGift = async () => {
    if (!sessionId) return;
    if (!winnersList.length) {
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
      const sendRes = await sendAdminGiftWinnerGift(sessionId, {
        account_email: giftAccountEmail.trim(),
        account_password: giftAccountPassword.trim(),
        code_2fa: gift2fa.trim() ? gift2fa.trim() : undefined,
        note: giftNote.trim() ? giftNote.trim() : undefined,
      });
      const sent = sendRes.data?.sent ?? winnersList.length;
      const skipped = sendRes.data?.skipped_no_email ?? 0;
      toast({
        title: "Đã gửi quà",
        description:
          skipped > 0
            ? `Đã gửi ${sent} email. Bỏ qua ${skipped} tài khoản không có email.`
            : `Đã gửi email cho ${sent} người trúng thưởng.`,
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

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-800">Số người trúng thưởng</div>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={winnerCount}
                    onChange={(e) => setWinnerCount(Number(e.target.value))}
                  />
                  <div className="text-xs text-gray-500">
                    Khi hết giờ, hệ thống chọn ngẫu nhiên tối đa số này (không trùng, không vượt quá số người tham gia).
                  </div>
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

                  {winnersList.length > 0 ? (
                    <div className="pt-2 text-gray-800 font-semibold">
                      Đã chọn{" "}
                      <span className="text-brand-blue">{winnersList.length}</span> người trúng
                    </div>
                  ) : giftState?.has_ended ? (
                    <div className="text-gray-600">Chưa có khách tham gia</div>
                  ) : null}

                  {winnersList.length > 0 && (
                    <div className="pt-3">
                      <Button
                        onClick={openSendGift}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Gửi email quà ({winnersList.length} người)
                      </Button>
                      {winnerEmailsText ? (
                        <div className="text-xs text-gray-500 mt-2 break-all">
                          Email nhận quà: <span className="font-medium">{winnerEmailsText}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 mt-2">
                          Một số tài khoản chưa có email — kiểm tra user.email trước khi gửi.
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
                        {(giftState.participants || []).map((p) => {
                          const isWinner = winnersList.some((w) => w.user_id === p.user_id);
                          return (
                            <tr
                              key={p.user_id}
                              className={`border-b border-gray-100 ${isWinner ? "bg-amber-50/80" : ""}`}
                            >
                              <td className="py-3 pr-4 text-gray-700">{p.stt}</td>
                              <td className="py-3 pr-4 text-gray-800 font-medium">{p.name || "—"}</td>
                              <td className="py-3 pr-4 text-gray-700">{p.email || "—"}</td>
                              <td className="py-3 text-gray-600">
                                {p.registered_at ? new Date(p.registered_at).toLocaleDateString("vi-VN") : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {winnersList.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Danh sách trúng thưởng
                    </h2>
                    <Badge className="bg-amber-500 text-white">{winnersList.length} người</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="py-3 pr-4">STT</th>
                          <th className="py-3 pr-4">Tên</th>
                          <th className="py-3">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {winnersList.map((w, idx) => (
                          <tr key={w.user_id} className="border-b border-gray-100">
                            <td className="py-3 pr-4 text-gray-700">{idx + 1}</td>
                            <td className="py-3 pr-4 text-gray-800 font-medium">{w.name || "—"}</td>
                            <td className="py-3 text-gray-700">{w.email || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={sendGiftOpen} onOpenChange={setSendGiftOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-emerald" />
              Gửi quà cho người trúng thưởng
            </DialogTitle>
            <DialogDescription>
              Hệ thống gửi cùng nội dung quà (email / pass tài khoản bạn nhập bên dưới) tới từng email khách trong danh sách trúng thưởng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-800">
                Email khách trúng thưởng ({winnersList.length} người)
              </div>
              <Textarea
                value={winnerEmailsText || "—"}
                disabled
                className="min-h-[72px] resize-none text-sm"
                readOnly
              />
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
              disabled={sendingGift || winnersList.length === 0}
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

