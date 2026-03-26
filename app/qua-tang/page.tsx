"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Gift, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchGiftStatus, joinGift } from "@/lib/api";
import type { GiftParticipant, GiftStatusData } from "@/types/gift.interface";
import Header from "@/components/Header";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function GiftPage() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<GiftStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [now, setNow] = useState(Date.now());
  const endTriggeredRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadStatus = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetchGiftStatus(sessionId);
      setStatus(res.data);
    } catch (e: any) {
      toast({
        title: "Không tải được quà tặng",
        description: e?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !sessionId) return;
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, sessionId]);

  // Auto refresh when countdown reaches 0 (winner selection might happen server-side).
  useEffect(() => {
    if (!status?.ends_at || status.has_ended) return;
    const endsAtMs = new Date(status.ends_at).getTime();
    if (Number.isNaN(endsAtMs)) return;
    if (now >= endsAtMs && !endTriggeredRef.current) {
      endTriggeredRef.current = true;
      loadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, status?.ends_at, status?.has_ended]);

  // Reset the "triggered once" flag when campaign changes.
  useEffect(() => {
    endTriggeredRef.current = false;
  }, [status?.ends_at]);

  const timeLeftMs = useMemo(() => {
    if (!status?.ends_at) return 0;
    const endsAtMs = new Date(status.ends_at).getTime();
    if (Number.isNaN(endsAtMs)) return 0;
    return Math.max(0, endsAtMs - now);
  }, [status?.ends_at, now]);

  const onJoin = async () => {
    if (!sessionId) return;
    if (status?.has_joined || status?.has_ended) return;
    setJoining(true);
    try {
      await joinGift(sessionId);
      toast({
        title: "Bạn đã tham gia nhận quà!",
        description: "Danh sách sẽ được cập nhật ngay.",
      });
      await loadStatus();
    } catch (e: any) {
      toast({
        title: "Tham gia thất bại",
        description: e?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5">
        <div className="container-max section-padding py-10">
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-brand-emerald" />
                <h1 className="text-2xl font-bold">Quà tặng</h1>
              </div>
              <p className="text-gray-600">
                Bạn cần đăng nhập để tham gia nhận quà.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/login" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const participants: GiftParticipant[] = status?.participants ?? [];
  const hasWinner = Boolean(status?.winner?.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5">
      <Header />
      <div className="container-max section-padding py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-6 h-6 text-brand-emerald" />
                  <h1 className="text-2xl font-bold">Quà tặng</h1>
                </div>

                {loading && !status ? (
                  <div className="text-gray-500">Đang tải...</div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {status?.gift_name ? (
                        <Badge variant="secondary" className="bg-rose-500 text-white">
                          {status.gift_name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Chưa có chiến dịch</Badge>
                      )}
                      {!status?.has_ended && status?.ends_at && (
                        <Badge className="bg-emerald-600 text-white">Đang diễn ra</Badge>
                      )}
                      {status?.has_ended && (
                        <Badge className="bg-gray-800 text-white">Đã kết thúc</Badge>
                      )}
                    </div>

                    {!status?.has_ended && status?.ends_at && (
                      <div className="flex items-center gap-2 text-gray-700 mb-4">
                        <Clock className="w-4 h-4 text-brand-blue" />
                        <div className="font-semibold">
                          Đếm ngược: <span className="text-brand-charcoal">{formatRemaining(timeLeftMs)}</span>
                        </div>
                      </div>
                    )}

                    {status?.has_ended && (
                      <div className="mt-2">
                        {hasWinner ? (
                          <div className="text-gray-800 font-semibold">
                            Khách trúng thưởng:{" "}
                            <span className="text-brand-blue">{status?.winner?.name}</span>
                          </div>
                        ) : (
                          <div className="text-gray-600">Chưa có khách tham gia</div>
                        )}
                      </div>
                    )}

                    <div className="mt-6">
                      {!status?.has_ended && !status?.has_joined ? (
                        <Button
                          onClick={onJoin}
                          disabled={joining || !status?.ends_at}
                          className="w-full bg-gradient-to-r from-brand-emerald to-brand-blue hover:from-brand-emerald/90 hover:to-brand-blue/90 text-white h-12 text-lg font-semibold"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Tham gia nhận quà
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full bg-gray-100 text-gray-500 h-12 text-lg font-semibold"
                        >
                          {status?.has_joined ? "Bạn đã tham gia" : "Đã kết thúc"}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Danh sách khách tham gia</h2>
                  <Badge variant="secondary">{participants.length} người</Badge>
                </div>

                {loading && !status ? (
                  <div className="text-gray-500">Đang tải danh sách...</div>
                ) : participants.length === 0 ? (
                  <div className="text-gray-600">Chưa có ai tham gia.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="py-3 pr-4">STT</th>
                          <th className="py-3 pr-4">Tên</th>
                          <th className="py-3">Ngày đăng ký</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p) => (
                          <tr key={p.user_id} className="border-b border-gray-100">
                            <td className="py-3 pr-4 text-gray-700">{p.stt}</td>
                            <td className="py-3 pr-4 text-gray-800 font-medium">
                              {p.name || "—"}
                            </td>
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
    </div>
  );
}

