"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

/** Khoảng cách giữa các lần gọi API lấy coins (2 giây) — admin cập nhật thì khách thấy trong vòng 2s */
const COINS_SYNC_INTERVAL_MS = 2_000;

/**
 * Đồng bộ số coins từ server để giao diện khách hàng hiển thị đúng khi admin cập nhật coins:
 * - Gọi API định kỳ mỗi 2 giây (chỉ khi tab đang hiển thị).
 * - Khi khách quay lại tab cũng refresh ngay.
 */
export default function CoinsSync() {
  const { user, sessionId, refreshUserCoins } = useAuth();
  const { syncBalanceFromServer } = useWallet();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user || !sessionId || user.role === 'admin') return;

    const sync = async () => {
      const newCoins = await refreshUserCoins();
      if (typeof newCoins === 'number') {
        syncBalanceFromServer(newCoins);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sync();
        intervalRef.current = setInterval(sync, COINS_SYNC_INTERVAL_MS);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Tab đang mở: bắt đầu polling; tab ẩn: dừng polling
    if (document.visibilityState === 'visible') {
      sync();
      intervalRef.current = setInterval(sync, COINS_SYNC_INTERVAL_MS);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  // Chỉ chạy khi user/session thay đổi
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, sessionId, user?.role]);

  return null;
}
