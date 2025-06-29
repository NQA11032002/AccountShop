"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DataSyncHelper from '@/lib/syncHelper';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("AuthProvider initialized", { user, isLoading });

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔐 Initializing authentication system");

      try {
        // Load users from JSON API first
        const apiUsers = await DataSyncHelper.fetchFromAPI('users');

        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          console.log("👥 Loaded users from JSON API", { count: apiUsers.length });
          localStorage.setItem('qai_users', JSON.stringify(apiUsers));
        } else {
          // Fallback to initialize demo user locally
          const storedUsers = localStorage.getItem('qai_users');
          if (!storedUsers) {
            const demoUsers = [{
              id: "demo",
              email: "demo@qaistore.com",
              password: "123456",
              name: "Demo User",
              avatar: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff",
              joinDate: "2024-01-01T00:00:00.000Z",
              status: "active",
              totalOrders: 0,
              totalSpent: 0,
              points: 0,
              rank: "bronze"
            }];
            localStorage.setItem('qai_users', JSON.stringify(demoUsers));
            console.log("📝 Initialized demo user locally");
          }
        }

        // Check for stored user session
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
      } catch (error) {
        console.warn("⚠️ Auth initialization error, using fallback:", error);
        // Initialize with fallback demo user
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
    console.log("🔐 Login attempt", { email });
    setIsLoading(true);

    try {
      // Try to authenticate with latest user data from API
      const apiUsers = await DataSyncHelper.fetchFromAPI('users');
      let users: any[] = [];

      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        users = apiUsers;
        localStorage.setItem('qai_users', JSON.stringify(users));
        console.log("👥 Using fresh user data from API");
      } else {
        // Fallback to local storage
        const storedUsers = localStorage.getItem('qai_users');
        users = storedUsers ? JSON.parse(storedUsers) : [];
        console.log("💾 Using local user data");
      }

      // Find user with credentials
      const foundUser = users.find((u: any) =>
        u.email === email && u.password === password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          avatar: foundUser.avatar,
          joinDate: foundUser.joinDate
        };

        setUser(userData);
        localStorage.setItem('qai_user', JSON.stringify(userData));

        // Load user-specific data from JSON API with proper error handling
        console.log("📥 Loading user-specific data");
        try {
          await Promise.allSettled([
            DataSyncHelper.loadUserData(userData.id, 'userFavorites'),
            DataSyncHelper.loadUserData(userData.id, 'userCarts'),
            DataSyncHelper.loadUserData(userData.id, 'userWallets'),
            DataSyncHelper.loadUserData(userData.id, 'userRankings'),
            DataSyncHelper.loadUserData(userData.id, 'orders')
          ]);
          console.log("✅ User-specific data loading completed");
        } catch (error) {
          console.warn("⚠️ Some user data failed to load:", error);
        }

        console.log("✅ Login successful", userData);
        return true;
      } else {
        console.log("❌ Login failed - invalid credentials");
        return false;
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log("📝 Registration attempt", { email, name });
    setIsLoading(true);

    try {
      // Get current users from API or local storage
      const apiUsers = await DataSyncHelper.fetchFromAPI('users');
      let users = Array.isArray(apiUsers) ? apiUsers : [];

      if (users.length === 0) {
        const storedUsers = localStorage.getItem('qai_users');
        users = storedUsers ? JSON.parse(storedUsers) : [];
      }

      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        console.log("❌ Registration failed - user already exists");
        return false;
      }

      // Create new user with full profile
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // In real app, this would be hashed
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
        joinDate: new Date().toISOString(),
        status: "active",
        totalOrders: 0,
        totalSpent: 0,
        phone: "",
        address: "",
        points: 0,
        rank: "bronze",
        preferences: {
          categories: [],
          notifications: true,
          currency: "VND"
        }
      };

      // Save to JSON API
      const apiSuccess = await DataSyncHelper.saveToAPI('users', [newUser], 'add');

      // Update local storage
      users.push(newUser);
      localStorage.setItem('qai_users', JSON.stringify(users));

      // Initialize user data structures with proper error handling
      try {
        await Promise.allSettled([
          DataSyncHelper.saveUserData(newUser.id, 'userRankings', {
            id: `ranking_${newUser.id}`,
            userId: newUser.id,
            points: 0,
            rank: "bronze",
            nextRankPoints: 300,
            totalSpent: 0,
            totalOrders: 0,
            joinDate: newUser.joinDate,
            lastUpdated: new Date().toISOString(),
            rewards: []
          }),
          DataSyncHelper.saveUserData(newUser.id, 'userWallets', {
            id: `wallet_${newUser.id}`,
            userId: newUser.id,
            balance: 0,
            currency: "VND",
            lastUpdated: new Date().toISOString(),
            transactions: []
          })
        ]);
        console.log("✅ User data structures initialized");
      } catch (error) {
        console.warn("⚠️ Failed to initialize some user data structures:", error);
      }

      // Auto-login
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        joinDate: newUser.joinDate
      };

      setUser(userData);
      localStorage.setItem('qai_user', JSON.stringify(userData));

      console.log("✅ Registration successful", { userId: userData.id, apiSynced: apiSuccess });
      return true;
    } catch (error) {
      console.error("❌ Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("User logging out", { userId: user?.id });
    const currentUserId = user?.id;
    setUser(null);
    localStorage.removeItem('qai_user');

    // Clear all user-specific data using sync helper
    if (currentUserId) {
      DataSyncHelper.clearUserData(currentUserId);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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