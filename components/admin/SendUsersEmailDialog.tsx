"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchEmailRecipients, sendEmailToAllUsers } from '@/lib/api';

export function SendUsersEmailDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const { sessionId } = useAuth();
  const { toast } = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const storageKey = `admin-email-sent:${sessionId}`;

  useEffect(() => {
    setSelected([]);
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
      setSent(Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string') : []);
    } catch { setSent([]); }
  }, [storageKey]);

  useEffect(() => {
    if (!open || !sessionId) return;
    let active = true;
    setLoading(true);
    fetchEmailRecipients(sessionId).then((result) => {
      if (!active) return;
      setEmails(result.emails);
      setSelected((current) => current.filter((email) => result.emails.includes(email)));
    }).catch((err) => {
      if (active) { setEmails([]); setError(err instanceof Error ? err.message : 'Không thể tải email.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, sessionId, reload]);

  const remaining = emails.filter((email) => !sent.includes(email));
  const visible = remaining.filter((email) => email.includes(query.trim().toLowerCase()));

  function rememberSent(next: string[]) {
    setSent(next);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the current dialog state if storage is unavailable. */ }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!sessionId) { setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'); return; }
    if (!subject.trim() || !content.trim()) { setError('Vui lòng nhập tiêu đề và nội dung.'); return; }
    if (selected.length === 0 || selected.length > 100) { setError('Chọn từ 1 đến 100 email mỗi lần gửi.'); return; }
    submitting.current = true;
    setSending(true);
    setError('');
    try {
      const result = await sendEmailToAllUsers(sessionId, { subject: subject.trim(), content: content.trim(), emails: selected });
      toast({ title: 'Đã gửi email', description: `Email đã được gửi đến ${result.sent_count} địa chỉ.` });
      rememberSent(Array.from(new Set([...sent, ...result.sent_emails])));
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi email.');
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!submitting.current) { setOpen(value); setError(''); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto"><Mail className="mr-2 h-4 w-4" />Gửi email</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl" aria-busy={sending}>
        <DialogHeader>
          <DialogTitle>Chọn người dùng nhận email</DialogTitle>
          <DialogDescription>
            Chọn tối đa 100 email mỗi lần. Email gửi thành công sẽ được ẩn trong đợt này; các địa chỉ được giữ kín bằng BCC.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-search">Người nhận · Đã chọn {selected.length}/100 · Còn {remaining.length}</Label>
            <Input id="email-search" placeholder="Tìm email..." value={query} onChange={(event) => setQuery(event.target.value)} disabled={sending} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" disabled={sending || loading} onClick={() => setSelected(visible.slice(0, 100))}>Chọn tối đa 100</Button>
              <Button type="button" size="sm" variant="outline" disabled={sending} onClick={() => setSelected([])}>Bỏ chọn</Button>
              <Button type="button" size="sm" variant="outline" disabled={sending || loading} onClick={() => setReload((value) => value + 1)}>Tải lại</Button>
            </div>
            <div className="max-h-52 overflow-y-auto rounded-md border p-2" aria-busy={loading}>
              {loading ? <p className="p-2 text-sm">Đang tải email...</p> : visible.length === 0 ? <p className="p-2 text-sm">Không còn email phù hợp.</p> : visible.map((email) => (
                <label key={email} className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm hover:bg-muted">
                  <input type="checkbox" checked={selected.includes(email)} disabled={sending || (!selected.includes(email) && selected.length >= 100)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, email].slice(0, 100) : current.filter((item) => item !== email))} />
                  <span className="break-all">{email}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Đã loại {sent.length} email đã gửi. Danh sách được nhớ khi tải lại trang trong tab này.</p>
            {sent.length > 0 && <Button type="button" size="sm" variant="outline" disabled={sending} onClick={() => { if (window.confirm('Bắt đầu đợt mới và đưa các email đã gửi trở lại danh sách?')) { rememberSent([]); setSelected([]); } }}>Bắt đầu đợt mới</Button>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcast-subject">Tiêu đề</Label>
            <Input id="broadcast-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Nhập tiêu đề email" required maxLength={200} disabled={sending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcast-content">Nội dung</Label>
            <Textarea id="broadcast-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nhập nội dung email..." required maxLength={20000} rows={10} disabled={sending} />
            <p className="text-xs text-muted-foreground">Nội dung dạng văn bản, giữ nguyên xuống dòng. {content.length.toLocaleString('vi-VN')}/20.000 ký tự.</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={sending} onClick={() => setOpen(false)}>Đóng</Button>
            <Button type="submit" disabled={sending || loading || selected.length === 0 || !subject.trim() || !content.trim()}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {sending ? 'Đang gửi email...' : `Gửi ${selected.length} email đã chọn`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
