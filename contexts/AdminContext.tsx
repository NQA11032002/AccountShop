"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  loginDate: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("AdminProvider initialized", { adminUser: adminUser?.email, isLoading });

  useEffect(() => {
    // Check for stored admin session
    const storedAdmin = localStorage.getItem('qai_admin');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setAdminUser(adminData);
        console.log("Admin restored from storage", adminData);
      } catch (error) {
        console.error("Error parsing stored admin data:", error);
        localStorage.removeItem('qai_admin');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Admin login attempt", { email });
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Predefined admin accounts
      const adminAccounts = [
        {
          id: 'admin1',
          email: 'admin@qaistore.com',
          password: 'admin123',
          name: 'QAI Admin',
          role: 'super_admin' as const,
          permissions: ['users_manage', 'products_manage', 'orders_manage', 'analytics_view', 'settings_manage']
        },
        {
          id: 'admin2',
          email: 'manager@qaistore.com',
          password: 'manager123',
          name: 'Store Manager',
          role: 'admin' as const,
          permissions: ['users_view', 'products_manage', 'orders_manage', 'analytics_view']
        }
      ];
      
      // Find admin account
      const foundAdmin = adminAccounts.find(admin => 
        admin.email === email && admin.password === password
      );
      
      if (foundAdmin) {
        const adminData: AdminUser = {
          id: foundAdmin.id,
          email: foundAdmin.email,
          name: foundAdmin.name,
          role: foundAdmin.role,
          permissions: foundAdmin.permissions,
          loginDate: new Date().toISOString()
        };
        
        setAdminUser(adminData);
        localStorage.setItem('qai_admin', JSON.stringify(adminData));
        console.log("Admin login successful", adminData);
        return true;
      } else {
        console.log("Admin login failed - invalid credentials");
        return false;
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Admin logging out");
    setAdminUser(null);
    localStorage.removeItem('qai_admin');
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    return adminUser.permissions.includes(permission);
  };

  return (
    <AdminContext.Provider value={{ adminUser, login, logout, isLoading, hasPermission }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}