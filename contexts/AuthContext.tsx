"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DataSyncHelper from '@/lib/syncHelper';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinDate: string;
  coins: number;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const apiUsers = await DataSyncHelper.fetchFromAPI('users');

        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          localStorage.setItem('qai_users', JSON.stringify(apiUsers));
        } else {
          const storedUsers = localStorage.getItem('qai_users');
          if (!storedUsers) {
            const demoUsers = [{
              id: "demo",
              email: "demo@qaistore.com",
              password: "123456",
              name: "Demo User",
              avatar: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff",
              joinDate: "2024-01-01T00:00:00.000Z"
            }];
            localStorage.setItem('qai_users', JSON.stringify(demoUsers));
          }
        }

        // ✅ Restore user from localStorage
        const storedUser = localStorage.getItem('qai_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("👤 User restored from session", userData);
          } catch (error) {
            console.error("❌ Error parsing stored user data:", error);
            localStorage.removeItem('qai_user');
          }
        }

        // ✅ Restore sessionId
        const storedSession = localStorage.getItem('qai_session');
        if (storedSession) {
          setSessionId(storedSession);
        }
      } catch (error) {
        console.warn("⚠️ Auth initialization error, using fallback:", error);
        // Fallback
        const storedUsers = localStorage.getItem('qai_users');
        if (!storedUsers) {
          const demoUsers = [{
            id: "demo",
            email: "demo@qaistore.com",
            password: "123456",
            name: "Demo User",
            avatar: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff",
            joinDate: "2024-01-01T00:00:00.000Z"
          }];
          localStorage.setItem('qai_users', JSON.stringify(demoUsers));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      console.log("login roif" + data.coins);

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        joinDate: data.user.join_date,
        coins: data.user.coins,
        phone: data.user.phone
      };


      setUser(userData);
      setSessionId(data.session_id); // ✅ Set sessionId vào state
      localStorage.setItem('qai_user', JSON.stringify(userData));
      localStorage.setItem('qai_session', data.session_id);

      return true;
    } catch (error) {
      console.error("❌ Login error:", error);
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
        phone: data.user.phone
      };

      setUser(userData);
      localStorage.setItem('qai_user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("❌ Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSessionId(null);
    localStorage.removeItem('qai_user');
    localStorage.removeItem('qai_session');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, sessionId, login, logout, register, isLoading }}>
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
