"use client";

import { useRef, useState, type FormEvent } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendEmailToAllUsers } from '@/lib/api';

export function SendUsersEmailDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const { sessionId } = useAuth();
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!sessionId) { setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'); return; }
    if (!subject.trim() || !content.trim()) { setError('Vui lòng nhập tiêu đề và nội dung.'); return; }
    submitting.current = true;
    setSending(true);
    setError('');
    try {
      const result = await sendEmailToAllUsers(sessionId, { subject: subject.trim(), content: content.trim() });
      toast({ title: 'Đã lên lịch gửi email', description: `${result.queued_count} email đã vào hàng đợi và sẽ được gửi lần lượt.` });
      setSubject('');
      setContent('');
      setOpen(false);
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
        <Button variant="outline" className="w-full sm:w-auto"><Mail className="mr-2 h-4 w-4" />Gửi email tất cả</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl" aria-busy={sending}>
        <DialogHeader>
          <DialogTitle>Gửi email cho tất cả người dùng</DialogTitle>
          <DialogDescription>
            Gửi đến toàn bộ người dùng có email hợp lệ, kể cả ngoài trang và bộ lọc hiện tại. Mỗi địa chỉ nhận một email riêng.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={sending || !subject.trim() || !content.trim()}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {sending ? 'Đang lên lịch gửi...' : 'Gửi cho tất cả người dùng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
