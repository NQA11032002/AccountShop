"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, logoutUser, registerUser, getUserCoins } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinDate: string;
  coins: number;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; status: number; message?: string }>;
  logout: () => void;
  setRole: (role: string) => void;
  setUser: (user: User | null) => void;
  /** Làm mới số coins từ server (khi admin cập nhật), cập nhật user + localStorage, trả về coins mới. */
  refreshUserCoins: () => Promise<number | undefined>;
  isLoading: boolean;
  setSessionId: (sessionId: string | null) => void;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // Khởi tạo sessionId là null hoặc giá trị hợp lệ
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>('user');  // Khởi tạo role với giá trị mặc định 'user'
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        // ✅ Restore user from localStorage (đã login trước đó)
        const storedUser = localStorage.getItem('qai_user');
        const storedSession = localStorage.getItem('qai_session');

        if (storedUser && storedSession) {
          const parsed = JSON.parse(storedUser);

          const userData: User = {
            id: parsed.id || '',
            email: parsed.email || '',
            name: parsed.name || '',
            avatar: parsed.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name || 'User')}&background=6366f1&color=fff`,
            joinDate: parsed.joinDate || new Date().toISOString(),
            coins: parsed.coins ?? 0,
            phone: parsed.phone || '',
            role: parsed.role || 'user',  // Đảm bảo role có giá trị hợp lệ
          };

          setUser(userData);
          setSessionId(storedSession);
          setRole(userData.role); // Đảm bảo role có giá trị hợp lệ từ localStorage
        }
      } catch (error) {
        localStorage.removeItem('qai_user');
        localStorage.removeItem('qai_session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {

      const res = await loginUser({ email, password });

      // const data = await res.json();
      const userData: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        avatar: res.user.avatar,
        joinDate: res.user.join_date,
        coins: res.user.coins,
        phone: res.user.phone,
        role: res.user.role,
      };

      setRole(userData.role);
      setUser(userData);
      setSessionId(res.session_id);

      localStorage.setItem('qai_user', JSON.stringify(userData));
      localStorage.setItem('qai_session', res.session_id);

      if (res.user.role == 'admin')
        router.push('/admin');
      else
        router.push('/');

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; status: number; message?: string }> => {
    setIsLoading(true);
    try {
      const data = await registerUser(name, email, password);

      router.push('/login');

      return {
        success: true,
        status: 200,
        message: 'Đăng ký thành công',
      };
    } catch (error: any) {
      // Nếu registerUser throw error => error.message
      return {
        success: false,
        status: 400, // hoặc lấy thêm status từ error nếu muốn
        message: 'Email đã tồn tại vui lòng đổi email khác!',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (sessionId) {
      try {
        await logoutUser(sessionId);
        setUser(null);
        setSessionId(null);
        setRole('user');

        localStorage.removeItem('qai_user');
        localStorage.removeItem('qai_session');
      } catch (error) {
        console.error("Logout error:", error);
      }
    } else {
      console.error("Token is null, cannot logout");
    }
  };

  const refreshUserCoins = async (): Promise<number | undefined> => {
    if (!sessionId || !user) return undefined;
    try {
      const data = await getUserCoins(sessionId);
      const newCoins = typeof data?.coins === 'number' ? data.coins : undefined;
      if (newCoins === undefined) return undefined;
      setUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
      const stored = localStorage.getItem('qai_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.coins = newCoins;
        localStorage.setItem('qai_user', JSON.stringify(parsed));
      }
      return newCoins;
    } catch {
      return undefined;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      sessionId,
      setSessionId,
      login,
      logout,
      register,
      refreshUserCoins,
      isLoading,
      role,
      setRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
