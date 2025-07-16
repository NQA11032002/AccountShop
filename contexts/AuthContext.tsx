"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, logoutUser } from '@/lib/api';  // Import các hàm API từ api.ts

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
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: string) => void; // ✅ thêm dòng này
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setSessionId: (sessionId: string | null) => void; // ✅ thêm dòng này
  role: string; // role luôn phải là string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // Khởi tạo sessionId là null hoặc giá trị hợp lệ
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>('user');  // Khởi tạo role với giá trị mặc định 'user'

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
        role: res.user.role || 'user',
      };

      setRole(userData.role);

      setUser(userData);
      setSessionId(res.session_id);

      localStorage.setItem('qai_user', JSON.stringify(userData));

      localStorage.setItem('qai_session', res.session_id);

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        joinDate: data.user.join_date,
        coins: data.user.coins,
        phone: data.user.phone,
        role: data.user.role || 'user',  // Đảm bảo role có giá trị hợp lệ
      };

      setUser(userData);
      setRole(userData.role); // Set role từ dữ liệu đăng ký
      localStorage.setItem('qai_user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("❌ Registration error:", error);
      return false;
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

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      sessionId,
      setSessionId, // ✅ thêm dòng này
      login,
      logout,
      register,
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
