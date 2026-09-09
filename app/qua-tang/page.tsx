"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Gift, Trophy, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchGiftStatus, joinGift } from "@/lib/api";
import type { GiftParticipant, GiftStatusData } from "@/types/gift.interface";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import DiscoveryHero from "@/components/discovery/DiscoveryHero";
import DiscoverySteps from "@/components/discovery/DiscoverySteps";

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
  const { user, sessionId, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<GiftStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const endTriggeredRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadStatus = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGiftStatus(sessionId);
      setStatus(res.data);
    } catch (e: any) {
      setError(e?.message || "Vui lòng thử lại sau.");
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
    if (!sessionId || joining || !status?.ends_at) return;
    if (status.has_joined || status.has_ended) return;
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

  const participants: GiftParticipant[] = status?.participants ?? [];
  const winners = status?.winners?.length ? status.winners : status?.winner ? [status.winner] : [];

  return (
    <DiscoveryShell>
      <Header />
      <main>
        <DiscoveryHero theme="gifts" badge="Quà tặng từ QAI" title={<>Cùng kết nối.<span className="discovery-gradient">Cùng đón niềm vui.</span></>} description="Khám phá chương trình quà tặng dành cho cộng đồng QAI. Đăng nhập để xem thông tin, tham gia và theo dõi kết quả.">
          <a href="#gift-campaign" className="discovery-primary">Khám phá chương trình<ArrowRight className="h-4 w-4" /></a>
        </DiscoveryHero>
        <section className="container-max section-padding py-10">
          <SectionReveal><DiscoverySteps steps={[{ title: "Đăng nhập tài khoản", description: "Sử dụng tài khoản QAI của bạn." }, { title: "Tham gia nhận quà", description: "Đăng ký khi chương trình đang mở." }, { title: "Theo dõi kết quả", description: "Xem thông tin khi chương trình kết thúc." }]} /></SectionReveal>
        </section>
        <section id="gift-campaign" className="container-max section-padding scroll-mt-32 pb-16">
          {authLoading ? <div className="discovery-empty" role="status">Đang kiểm tra tài khoản…</div> : !user ? (
            <SectionReveal>
              <div className="discovery-banner mx-auto grid max-w-4xl items-center gap-8 p-7 sm:p-10 md:grid-cols-[180px_1fr]">
                <div className="flex items-center justify-center" aria-hidden="true"><span className="discovery-float flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-xl"><Gift className="h-16 w-16 text-violet-200" strokeWidth={1.25} /></span></div>
                <div><p className="text-xs font-semibold tracking-widest text-violet-300">HẸN GẶP BẠN TRONG CỘNG ĐỒNG</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Đăng nhập để khám phá quà tặng.</h2><p className="mt-4 text-sm leading-6 text-slate-300">Xem chương trình hiện tại, ghi danh tham gia và theo dõi danh sách ngay tại đây.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/login?returnUrl=%2Fqua-tang" className="discovery-secondary">Đăng nhập<ArrowRight className="h-4 w-4" /></Link><Link href="/" className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-violet-200">Về trang chủ</Link></div></div>
              </div>
            </SectionReveal>
          ) : (
            <SectionReveal>
              {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"><p>{error}</p><button type="button" className="discovery-secondary" disabled={loading} onClick={loadStatus}>Thử tải lại</button></div>}
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
                <Card className="discovery-panel overflow-hidden">
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100" aria-hidden="true"><span className="absolute h-36 w-36 rounded-full border border-violet-200" /><span className="discovery-float flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-lg shadow-violet-950/10"><Gift className="h-10 w-10" strokeWidth={1.5} /></span></div>
                  <CardContent className="p-6">
                    <p className="discovery-eyebrow">CHƯƠNG TRÌNH QUÀ TẶNG</p>
                    <h2 className="mb-4 mt-3 text-2xl font-bold">{status?.gift_name || "Quà tặng cộng đồng"}</h2>
                    {loading && !status ? <p role="status" className="text-sm text-slate-500">Đang tải chương trình…</p> : status ? <>
                      <div className="mb-5 flex flex-wrap gap-2">{!status.ends_at ? <Badge variant="secondary">Chưa có chiến dịch</Badge> : status.has_ended ? <Badge className="bg-slate-100 text-slate-600">Đã kết thúc</Badge> : <Badge className="bg-emerald-50 text-emerald-700">Đang diễn ra</Badge>}{status.has_joined && <Badge className="bg-violet-50 text-violet-700">Bạn đã tham gia</Badge>}</div>
                      {!status.has_ended && status.ends_at && <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5"><p className="flex items-center gap-2 text-xs font-medium text-violet-700"><Clock className="h-3.5 w-3.5" />Thời gian còn lại</p><p className="mt-2 font-mono text-4xl font-bold tabular-nums tracking-tight text-slate-900">{formatRemaining(timeLeftMs)}</p></div>}
                      {status.has_ended && <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><p className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800"><Trophy className="h-4 w-4" />Kết quả chương trình</p>{winners.length > 0 ? <ul className="space-y-2">{winners.map(winner => <li key={winner.user_id} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />{winner.name || "Khách hàng"}</li>)}</ul> : <p className="text-sm text-slate-600">Chưa có kết quả trúng thưởng.</p>}</div>}
                      <div className="mt-6">{!status.has_ended && !status.has_joined ? <Button onClick={onJoin} disabled={joining || loading || !status.ends_at} className="discovery-primary w-full"><UserPlus className="h-4 w-4" />{joining ? "Đang đăng ký…" : "Tham gia nhận quà"}</Button> : <Button disabled className="h-12 w-full rounded-xl bg-slate-100 text-slate-500">{status.has_joined ? "Bạn đã tham gia" : "Đã kết thúc"}</Button>}</div>
                    </> : !error && <p className="text-sm text-slate-500">Chưa có thông tin chương trình.</p>}
                  </CardContent>
                </Card>
                <Card className="discovery-panel">
                  <CardContent className="p-5 sm:p-7">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5"><div><p className="discovery-eyebrow">CÙNG NHAU THAM GIA</p><h2 className="mt-2 text-xl font-bold">Thành viên cộng đồng</h2></div><span className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"><Users className="h-3.5 w-3.5" />{participants.length} người</span></div>
                    {loading && !status ? <p role="status" className="text-sm text-slate-500">Đang tải danh sách…</p> : participants.length === 0 ? <div className="py-10 text-center"><Users className="mx-auto mb-4 h-10 w-10 text-violet-200" /><p className="text-sm text-slate-500">Chưa có thành viên trong danh sách.</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Danh sách khách tham gia nhận quà</caption><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th scope="col" className="pb-3 pr-4">STT</th><th scope="col" className="pb-3 pr-4">Thành viên</th><th scope="col" className="pb-3">Ngày tham gia</th></tr></thead><tbody>{participants.map(participant => <tr key={participant.user_id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-4 font-mono text-xs text-violet-500">{String(participant.stt).padStart(2, "0")}</td><td className="py-4 pr-4 font-medium text-slate-700">{participant.name || "—"}</td><td className="whitespace-nowrap py-4 text-xs text-slate-500">{participant.registered_at ? new Date(participant.registered_at).toLocaleDateString("vi-VN") : "—"}</td></tr>)}</tbody></table></div>}
                  </CardContent>
                </Card>
              </div>
            </SectionReveal>
          )}
        </section>
      </main>
      <Footer />
    </DiscoveryShell>
  );
}
