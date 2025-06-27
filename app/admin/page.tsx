"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  DollarSign,
  UserCheck,
  Shield,
  UserX,
  Phone,
  Mail,
  Calendar,
  Clock,
  Monitor,
  Link,
  CheckCircle,
  AlertCircle,
  XCircle,
  Copy,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  SortAsc,
  SortDesc,
  Activity,
  MousePointer,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { EditProductDialog } from '@/components/admin/EditProductDialog';
import { EditOrderDialog } from '@/components/admin/EditOrderDialog';
import { EditCustomerAccountDialog } from '@/components/admin/EditCustomerAccountDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import DepositApprovals from '@/components/admin/DepositApprovals';
import { exportUsersToExcel, exportProductsToExcel, exportOrdersToExcel, exportDetailedOrdersToExcel } from '@/lib/excelExport';
import DataSyncHelper from '@/lib/syncHelper';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  calculateCustomerRank, 
  calculateNextRankProgress, 
  CustomerRankDisplay,
  customerRanks,
  type CustomerRank 
} from '@/components/CustomerRankingSystem';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'banned';
  totalOrders: number;
  totalSpent: number;
  coins?: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  sales: number;
  rating: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

interface CustomerAccount {
  id: string;
  accountEmail: string;
  accountPassword: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productType: string;
  productIcon: string;
  productColor: string;
  purchaseDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended';
  link?: string;
  orderId: string;
  duration: string;
  purchasePrice: number;
  // New ranking fields
  totalSpent?: number;
  totalOrders?: number;
  customerRank?: CustomerRank;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>([]);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  
  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [editProductDialog, setEditProductDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [editOrderDialog, setEditOrderDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [editAccountDialog, setEditAccountDialog] = useState<{ open: boolean; account: CustomerAccount | null }>({ open: false, account: null });
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    type: 'user' | 'product' | 'order' | 'account'; 
    item: any; 
    onConfirm: () => void 
  }>({ open: false, type: 'user', item: null, onConfirm: () => {} });
  
  // Customer Accounts State
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [accountFilterType, setAccountFilterType] = useState<string>('all');
  const [accountSortBy, setAccountSortBy] = useState<'purchaseDate' | 'expiryDate' | 'customerName' | 'productType'>('purchaseDate');
  const [accountSortOrder, setAccountSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { adminUser, logout, hasPermission } = useAdmin();
  const { toast } = useToast();
  const router = useRouter();

  // Data generation functions moved outside component to avoid errors
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [revenueComparisonData, setRevenueComparisonData] = useState<any[]>([]);

  useEffect(() => {
    // Generate analytics data
    const generateAnalyticsData = () => {
      const currentDate = new Date();
      const months: any[] = [];
      
      // Generate last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
        
        months.push({
          name: monthName,
          revenue: Math.floor(Math.random() * 50000000) + 20000000,
          orders: Math.floor(Math.random() * 200) + 50,
          users: Math.floor(Math.random() * 100) + 20,
          traffic: Math.floor(Math.random() * 10000) + 2000
        });
      }
      
      return months;
    };

    const generateDailyTrafficData = () => {
      const days: any[] = [];
      
      // Generate last 7 days of traffic data
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
        
        days.push({
          name: dayName,
          visitors: Math.floor(Math.random() * 800) + 200,
          pageViews: Math.floor(Math.random() * 2000) + 500,
          bounceRate: Math.floor(Math.random() * 30) + 20
        });
      }
      
      return days;
    };

    const generateRevenueComparisonData = () => {
      const currentMonth = orders.reduce((sum, order) => sum + order.total, 0);
      const previousMonth = Math.floor(currentMonth * (0.8 + Math.random() * 0.4));
      const nextMonthProjection = Math.floor(currentMonth * (1.1 + Math.random() * 0.2));
      
      return [
        { name: 'Tháng trước', value: previousMonth, color: '#8884d8' },
        { name: 'Tháng này', value: currentMonth, color: '#00C49F' },
        { name: 'Dự báo tháng sau', value: nextMonthProjection, color: '#FFBB28' }
      ];
    };

    setAnalyticsData(generateAnalyticsData());
    setTrafficData(generateDailyTrafficData());
    setRevenueComparisonData(generateRevenueComparisonData());
  }, [orders, users, products]);

  console.log("AdminDashboard rendered", { adminUser: adminUser?.email, activeTab });

  // Redirect if not logged in
  useEffect(() => {
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }
  }, [adminUser, router]);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh data from JSON API every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      console.log('🔄 Auto-refreshing admin data from JSON API');
      await loadDashboardData(true); // Force API refresh
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Subscribe to data synchronization changes
  useEffect(() => {
    const unsubscribe = DataSyncHelper.subscribeToAdminChanges((type, data) => {
      console.log(`🔄 Admin data sync received for ${type}`, { count: data.length });
      
      switch (type) {
        case 'users':
          setUsers(data);
          break;
        case 'products':
          setProducts(data);
          break;
        case 'orders':
          setOrders(data);
          break;
        case 'accounts':
          setCustomerAccounts(data);
          break;
      }
    });

    // Subscribe to order completion events for real-time updates
    const unsubscribeOrderCompletion = DataSyncHelper.subscribeToOrderCompletion(async (orderData) => {
      console.log(`🛒 Real-time order completion received:`, orderData);
      
      // Force reload orders from enhanced Orders API to get the latest data immediately
      try {
        const ordersResponse = await fetch('/api/orders?includeProducts=true');
        const ordersResult = await ordersResponse.json();
        
        if (ordersResult.success && ordersResult.data.length > 0) {
          setOrders(ordersResult.data);
          console.log("📊 Orders refreshed from enhanced API after completion", { count: ordersResult.data.length });
        } else {
          // Fallback to legacy API
          const syncedOrders = await DataSyncHelper.loadAdminData('orders', true);
          if (syncedOrders.length > 0) {
            setOrders(syncedOrders);
            console.log("📊 Orders refreshed from legacy API after completion");
          }
        }
      } catch (error) {
        console.warn("⚠️ Error refreshing orders after completion:", error);
      }
      
      // Also reload customer accounts to reflect ranking updates
      const syncedAccounts = await DataSyncHelper.loadAdminData('accounts', true);
      if (syncedAccounts.length > 0) {
        const accountsWithDates = syncedAccounts.map((account: any) => ({
          ...account,
          purchaseDate: new Date(account.purchaseDate),
          expiryDate: new Date(account.expiryDate)
        }));
        setCustomerAccounts(accountsWithDates);
        console.log("🔄 Customer accounts refreshed after order completion");
      }
    });

    // Subscribe to admin-specific order completion events for immediate updates
    const handleAdminOrderCompleted = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("🚨 Admin order completion event received:", customEvent.detail);
      
      const { orderId, orderData } = customEvent.detail;
      
      // Update orders immediately if we have the full order data
      if (orderData) {
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => 
            order.id === orderId ? { ...order, ...orderData, status: 'completed' } : order
          );
          
          // If order not found, add it
          if (!updatedOrders.find(o => o.id === orderId)) {
            updatedOrders.unshift(orderData);
          }
          
          return updatedOrders;
        });
      }
      
      // Trigger full data reload after short delay to ensure API sync
      setTimeout(() => {
        loadDashboardData(true);
      }, 2000);
    };
    
    window.addEventListener('admin-order-completed', handleAdminOrderCompleted);

    // Subscribe to global order sync events
    const unsubscribeGlobalSync = DataSyncHelper.subscribeToGlobalOrderSync((eventData) => {
      console.log(`🌐 Global order sync event received:`, eventData);
      
      if (eventData.type === 'completion') {
        // Force refresh all order-related data
        setTimeout(() => {
          loadDashboardData();
        }, 1000);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeOrderCompletion();
      unsubscribeGlobalSync();
      window.removeEventListener('admin-order-completed', handleAdminOrderCompleted);
    };
  }, []);

  const loadDashboardData = async (forceAPI = false) => {
    console.log("Loading dashboard data with JSON API sync", { forceAPI });
    
    try {
      // Load user wallets first using direct API call
      const syncedWallets = await DataSyncHelper.fetchFromAPI('userWallets') || [];
      setUserWallets(syncedWallets);

      // Load users with JSON API support
      const syncedUsers = await DataSyncHelper.loadAdminData('users', forceAPI);
      if (syncedUsers.length > 0) {
        const usersWithStats = syncedUsers.map((user: any) => {
          // Find user's wallet data
          const userWallet = syncedWallets.find((wallet: any) => wallet.userId === user.id);
          
          return {
            ...user,
            status: user.status || 'active',
            totalOrders: user.totalOrders || Math.floor(Math.random() * 20),
            totalSpent: user.totalSpent || Math.floor(Math.random() * 5000000),
            coins: userWallet?.balance || 0
          };
        });
        setUsers(usersWithStats);
      } else {
        // Fallback to localStorage
        const storedUsers = localStorage.getItem('qai_users');
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          const usersWithStats = parsedUsers.map((user: any) => {
            // Find user's wallet data
            const userWallet = syncedWallets.find((wallet: any) => wallet.userId === user.id);
            
            return {
              ...user,
              status: 'active',
              totalOrders: Math.floor(Math.random() * 20),
              totalSpent: Math.floor(Math.random() * 5000000),
              coins: userWallet?.balance || 0
            };
          });
          setUsers(usersWithStats);
          // Sync to new system
          await DataSyncHelper.syncAdminData('users', usersWithStats);
        }
      }

      // Load orders with enhanced JSON API support using dedicated Orders API
      try {
        console.log("📊 Loading orders from enhanced Orders API");
        const ordersResponse = await fetch('/api/orders?includeProducts=true');
        const ordersResult = await ordersResponse.json();
        
        if (ordersResult.success && ordersResult.data.length > 0) {
          setOrders(ordersResult.data);
          console.log("✅ Orders loaded from enhanced API", { count: ordersResult.data.length });
        } else {
          // Fallback to legacy data API
          const syncedOrders = await DataSyncHelper.loadAdminData('orders', forceAPI);
          if (syncedOrders.length > 0) {
            setOrders(syncedOrders);
            console.log("🔄 Orders loaded from legacy API", { count: syncedOrders.length });
          } else {
            const storedOrders = localStorage.getItem('qai_orders');
            if (storedOrders) {
              const orders = JSON.parse(storedOrders);
              setOrders(orders);
              await DataSyncHelper.syncAdminData('orders', orders);
              console.log("💾 Orders loaded from localStorage", { count: orders.length });
            }
          }
        }
      } catch (ordersApiError) {
        console.warn("⚠️ Enhanced Orders API failed, using fallback:", ordersApiError);
        // Fallback to legacy API
        const syncedOrders = await DataSyncHelper.loadAdminData('orders', forceAPI);
        if (syncedOrders.length > 0) {
          setOrders(syncedOrders);
        }
      }

      // Load products with JSON API support
      const syncedProducts = await DataSyncHelper.loadAdminData('products', forceAPI);
      if (syncedProducts.length > 0) {
        setProducts(syncedProducts);
      } else {
        // Fallback to sample products data from JSON
        const apiData = await DataSyncHelper.fetchFromAPI('products');
        if (Array.isArray(apiData) && apiData.length > 0) {
          setProducts(apiData);
        } else {
          // Last resort: sample data
          const sampleProducts: Product[] = [
            {
              id: 1,
              name: "Netflix Premium",
              category: "Streaming",
              price: 50000,
              originalPrice: 80000,
              stock: 50,
              status: 'active',
              sales: 1250,
              rating: 4.8
            },
            {
              id: 2,
              name: "Spotify Premium",
              category: "Music",
              price: 39000,
              originalPrice: 59000,
              stock: 100,
              status: 'active',
              sales: 890,
              rating: 4.9
            },
            {
              id: 3,
              name: "ChatGPT Plus",
              category: "AI Tools",
              price: 120000,
              originalPrice: 200000,
              stock: 25,
              status: 'active',
              sales: 634,
              rating: 4.9
            }
          ];
          setProducts(sampleProducts);
          await DataSyncHelper.syncAdminData('products', sampleProducts);
        }
      }

      // Load customer accounts with JSON API support
      await loadCustomerAccounts(forceAPI);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  };

  const loadCustomerAccounts = async (forceAPI = false) => {
    console.log("Loading customer accounts with JSON API sync", { forceAPI });
    
    try {
      // Load from JSON API first
      const syncedAccounts = await DataSyncHelper.loadAdminData('accounts', forceAPI);
      if (syncedAccounts.length > 0) {
        const accountsWithDates = syncedAccounts.map((account: any) => ({
          ...account,
          purchaseDate: new Date(account.purchaseDate),
          expiryDate: new Date(account.expiryDate)
        }));
        setCustomerAccounts(accountsWithDates);
        return;
      }
    } catch (error) {
      console.error('❌ Error loading customer accounts from API:', error);
    }
    
    // Generate sample customer accounts data
    const sampleAccounts: CustomerAccount[] = [
      {
        id: 'acc_001',
        accountEmail: 'netflix_user@example.com',
        accountPassword: 'SecurePass123!',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'nguyenvana@gmail.com',
        customerPhone: '0901234567',
        productType: 'Netflix Premium',
        productIcon: '🎬',
        productColor: 'bg-red-500',
        purchaseDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-07-15'),
        status: 'active',
        link: 'https://netflix.com',
        orderId: 'ORD_001',
        duration: '6 tháng',
        purchasePrice: 89000
      },
      {
        id: 'acc_002',
        accountEmail: 'spotify_user@example.com',
        accountPassword: 'MusicLover2024',
        customerName: 'Trần Thị B',
        customerEmail: 'tranthib@gmail.com',
        customerPhone: '0907654321',
        productType: 'Spotify Premium',
        productIcon: '🎵',
        productColor: 'bg-green-500',
        purchaseDate: new Date('2024-02-01'),
        expiryDate: new Date('2024-05-01'),
        status: 'expired',
        link: 'https://spotify.com',
        orderId: 'ORD_002',
        duration: '3 tháng',
        purchasePrice: 39000
      },
      {
        id: 'acc_003',
        accountEmail: 'chatgpt_user@example.com',
        accountPassword: 'AI_Power2024',
        customerName: 'Lê Văn C',
        customerEmail: 'levanc@gmail.com',
        customerPhone: '0912345678',
        productType: 'ChatGPT Plus',
        productIcon: '🤖',
        productColor: 'bg-purple-500',
        purchaseDate: new Date('2024-03-10'),
        expiryDate: new Date('2024-04-10'),
        status: 'expired',
        link: 'https://chat.openai.com',
        orderId: 'ORD_003',
        duration: '1 tháng',
        purchasePrice: 120000
      },
      {
        id: 'acc_004',
        accountEmail: 'youtube_user@example.com',
        accountPassword: 'VideoTime123',
        customerName: 'Phạm Thị D',
        customerEmail: 'phamthid@gmail.com',
        customerPhone: '0934567890',
        productType: 'YouTube Premium',
        productIcon: '📺',
        productColor: 'bg-red-600',
        purchaseDate: new Date('2024-04-01'),
        expiryDate: new Date('2024-10-01'),
        status: 'active',
        link: 'https://youtube.com',
        orderId: 'ORD_004',
        duration: '6 tháng',
        purchasePrice: 67000
      },
      {
        id: 'acc_005',
        accountEmail: 'adobe_user@example.com',
        accountPassword: 'Creative2024!',
        customerName: 'Hoàng Văn E',
        customerEmail: 'hoangvane@gmail.com',
        customerPhone: '0923456789',
        productType: 'Adobe Creative Cloud',
        productIcon: '🎨',
        productColor: 'bg-orange-500',
        purchaseDate: new Date('2024-01-20'),
        expiryDate: new Date('2024-07-20'),
        status: 'active',
        link: 'https://adobe.com',
        orderId: 'ORD_005',
        duration: '6 tháng',
        purchasePrice: 145000
      }
    ];
    
    setCustomerAccounts(sampleAccounts);
    // Sync to new system
    await DataSyncHelper.syncAdminData('accounts', sampleAccounts);
  };

  const handleLogout = () => {
    console.log("Admin logout clicked");
    logout();
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi Admin Panel.",
    });
    router.push('/admin/login');
  };

  const getStatusBadge = (status: string, type: 'user' | 'product' | 'order') => {
    const variants: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      banned: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    activeProducts: products.filter(product => product.status === 'active').length,
    totalCustomerAccounts: customerAccounts.length,
    activeCustomerAccounts: customerAccounts.filter(acc => acc.status === 'active').length,
    expiredCustomerAccounts: customerAccounts.filter(acc => acc.status === 'expired').length
  };

  // CRUD Operations
  const handleEditUser = (user: User | null) => {
    console.log("Edit user clicked", { userId: user?.id });
    setEditUserDialog({ open: true, user });
  };

  const handleSaveUser = (userData: User) => {
    console.log("Saving user with sync", userData);
    let updatedUsers: User[];
    
    if (editUserDialog.user) {
      // Update existing user
      updatedUsers = users.map(u => u.id === userData.id ? userData : u);
      setUsers(updatedUsers);
      
      // Also update localStorage for existing users
      const storedUsers = localStorage.getItem('qai_users');
      if (storedUsers) {
        const legacyUsers = JSON.parse(storedUsers);
        const updatedLegacyUsers = legacyUsers.map((u: any) => 
          u.id === userData.id ? { ...u, ...userData } : u
        );
        localStorage.setItem('qai_users', JSON.stringify(updatedLegacyUsers));
      }
      
      toast({
        title: "Cập nhật thành công",
        description: `Thông tin người dùng ${userData.name} đã được cập nhật.`,
      });
    } else {
      // Add new user
      const newUser = { ...userData, id: Date.now().toString() };
      updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      
      toast({
        title: "Tạo mới thành công",
        description: `Người dùng ${userData.name} đã được tạo.`,
      });
      
      // Save to localStorage
      const storedUsers = localStorage.getItem('qai_users');
      const legacyUsers = storedUsers ? JSON.parse(storedUsers) : [];
      legacyUsers.push({
        ...newUser,
        password: 'default123', // Default password
        joinDate: new Date().toISOString()
      });
      localStorage.setItem('qai_users', JSON.stringify(legacyUsers));
    }
    
    // Sync changes across all admin tabs
    DataSyncHelper.syncAdminData('users', updatedUsers);
  };

  const handleDeleteUser = (user: User) => {
    console.log("Delete user clicked", { userId: user.id });
    setDeleteDialog({
      open: true,
      type: 'user',
      item: user,
      onConfirm: () => {
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers(updatedUsers);
        
        // Remove from localStorage
        const storedUsers = localStorage.getItem('qai_users');
        if (storedUsers) {
          const legacyUsers = JSON.parse(storedUsers);
          const updatedLegacyUsers = legacyUsers.filter((u: any) => u.id !== user.id);
          localStorage.setItem('qai_users', JSON.stringify(updatedLegacyUsers));
        }
        
        toast({
          title: "Xóa thành công",
          description: `Người dùng ${user.name} đã được xóa.`,
          variant: "destructive",
        });
        
        // Sync changes across all admin tabs
        DataSyncHelper.syncAdminData('users', updatedUsers);
      }
    });
  };

  const handleEditProduct = (product: Product | null) => {
    console.log("Edit product clicked", { productId: product?.id });
    setEditProductDialog({ open: true, product });
  };

  const handleSaveProduct = (productData: Product) => {
    console.log("Saving product with sync", productData);
    let updatedProducts: Product[];
    
    if (editProductDialog.product) {
      // Update existing product
      updatedProducts = products.map(p => p.id === productData.id ? productData : p);
      setProducts(updatedProducts);
      toast({
        title: "Cập nhật thành công",
        description: `Sản phẩm ${productData.name} đã được cập nhật.`,
      });
    } else {
      // Add new product
      const newProduct = { ...productData, id: Date.now() };
      updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      toast({
        title: "Tạo mới thành công",
        description: `Sản phẩm ${productData.name} đã được tạo.`,
      });
    }
    
    // Sync changes across all admin tabs
    DataSyncHelper.syncAdminData('products', updatedProducts);
  };

  const handleDeleteProduct = (product: Product) => {
    console.log("Delete product clicked", { productId: product.id });
    setDeleteDialog({
      open: true,
      type: 'product',
      item: product,
      onConfirm: () => {
        const updatedProducts = products.filter(p => p.id !== product.id);
        setProducts(updatedProducts);
        toast({
          title: "Xóa thành công",
          description: `Sản phẩm ${product.name} đã được xóa.`,
          variant: "destructive",
        });
        
        // Sync changes across all admin tabs
        DataSyncHelper.syncAdminData('products', updatedProducts);
      }
    });
  };

  const handleEditOrder = (order: Order | null) => {
    console.log("Edit order clicked", { orderId: order?.id });
    setEditOrderDialog({ open: true, order });
  };

  const handleSaveOrder = (orderData: Order) => {
    console.log("Saving order with sync", orderData);
    let updatedOrders: Order[];
    
    if (editOrderDialog.order) {
      // Update existing order
      updatedOrders = orders.map(o => o.id === orderData.id ? orderData : o);
      setOrders(updatedOrders);
      
      // Also update localStorage
      const storedOrders = localStorage.getItem('qai_orders');
      if (storedOrders) {
        const legacyOrders = JSON.parse(storedOrders);
        const updatedLegacyOrders = legacyOrders.map((o: any) => o.id === orderData.id ? orderData : o);
        localStorage.setItem('qai_orders', JSON.stringify(updatedLegacyOrders));
      }
      
      toast({
        title: "Cập nhật thành công",
        description: `Đơn hàng #${orderData.id} đã được cập nhật.`,
      });
    } else {
      // Add new order
      updatedOrders = [...orders, orderData];
      setOrders(updatedOrders);
      
      // Save to localStorage
      const storedOrders = localStorage.getItem('qai_orders');
      const legacyOrders = storedOrders ? JSON.parse(storedOrders) : [];
      legacyOrders.push(orderData);
      localStorage.setItem('qai_orders', JSON.stringify(legacyOrders));
      
      toast({
        title: "Tạo mới thành công",
        description: `Đơn hàng #${orderData.id} đã được tạo.`,
      });
    }
    
    // Sync changes across all admin tabs
    DataSyncHelper.syncAdminData('orders', updatedOrders);
  };

  const handleDeleteOrder = (order: Order) => {
    console.log("Delete order clicked", { orderId: order.id });
    setDeleteDialog({
      open: true,
      type: 'order',
      item: order,
      onConfirm: () => {
        const updatedOrders = orders.filter(o => o.id !== order.id);
        setOrders(updatedOrders);
        
        // Remove from localStorage
        const storedOrders = localStorage.getItem('qai_orders');
        if (storedOrders) {
          const legacyOrders = JSON.parse(storedOrders);
          const updatedLegacyOrders = legacyOrders.filter((o: any) => o.id !== order.id);
          localStorage.setItem('qai_orders', JSON.stringify(updatedLegacyOrders));
        }
        
        toast({
          title: "Xóa thành công",
          description: `Đơn hàng #${order.id} đã được xóa.`,
          variant: "destructive",
        });
        
        // Sync changes across all admin tabs
        DataSyncHelper.syncAdminData('orders', updatedOrders);
      }
    });
  };

  // Export functions
  const handleExportUsers = () => {
    console.log("Exporting users to Excel");
    const success = exportUsersToExcel(users);
    if (success) {
      toast({
        title: "Xuất Excel thành công",
        description: "Danh sách người dùng đã được xuất ra file Excel.",
      });
    } else {
      toast({
        title: "Lỗi xuất Excel",
        description: "Có lỗi xảy ra khi xuất file Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportProducts = () => {
    console.log("Exporting products to Excel");
    const success = exportProductsToExcel(products);
    if (success) {
      toast({
        title: "Xuất Excel thành công",
        description: "Danh sách sản phẩm đã được xuất ra file Excel.",
      });
    } else {
      toast({
        title: "Lỗi xuất Excel",
        description: "Có lỗi xảy ra khi xuất file Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportOrders = () => {
    console.log("Exporting orders to Excel");
    const success = exportOrdersToExcel(orders);
    if (success) {
      toast({
        title: "Xuất Excel thành công",
        description: "Danh sách đơn hàng đã được xuất ra file Excel.",
      });
    } else {
      toast({
        title: "Lỗi xuất Excel",
        description: "Có lỗi xảy ra khi xuất file Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportDetailedOrders = () => {
    console.log("Exporting detailed orders to Excel");
    const success = exportDetailedOrdersToExcel(orders);
    if (success) {
      toast({
        title: "Xuất Excel thành công",
        description: "Chi tiết đơn hàng đã được xuất ra file Excel.",
      });
    } else {
      toast({
        title: "Lỗi xuất Excel",
        description: "Có lỗi xảy ra khi xuất file Excel.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get user coin balance
  const getUserCoins = (userId: string): number => {
    const userWallet = userWallets.find(wallet => wallet.userId === userId);
    return userWallet?.balance || 0;
  };

  // Helper functions for customer accounts
  const handleCopyCredential = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép!",
      description: "Thông tin đã được sao chép vào clipboard.",
    });
  };

  const getAccountStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Hoạt động</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white">Hết hạn</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500 text-white">Tạm ngưng</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getAccountStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    // Reset time parts to avoid issues with time zones and partial days
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    
    const timeDiff = expiryDateOnly.getTime() - nowDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // Customer Account Management Functions
  const handleEditAccount = (account: CustomerAccount | null) => {
    console.log("Edit account clicked", { accountId: account?.id });
    setEditAccountDialog({ open: true, account });
  };

  const handleSaveAccount = (accountData: CustomerAccount) => {
    console.log("Saving account with sync", accountData);
    let updatedAccounts: CustomerAccount[];
    
    if (editAccountDialog.account) {
      // Update existing account
      updatedAccounts = customerAccounts.map(a => a.id === accountData.id ? accountData : a);
      setCustomerAccounts(updatedAccounts);
      toast({
        title: "Cập nhật thành công",
        description: `Tài khoản ${accountData.accountEmail} đã được cập nhật.`,
      });
    } else {
      // Add new account
      const newAccount = { ...accountData, id: Date.now().toString() };
      updatedAccounts = [...customerAccounts, newAccount];
      setCustomerAccounts(updatedAccounts);
      toast({
        title: "Tạo mới thành công",
        description: `Tài khoản ${accountData.accountEmail} đã được tạo.`,
      });
    }
    
    // Sync changes across all admin tabs
    DataSyncHelper.syncAdminData('accounts', updatedAccounts);
  };

  const handleDeleteAccount = (account: CustomerAccount) => {
    console.log("Delete account clicked", { accountId: account.id });
    setDeleteDialog({
      open: true,
      type: 'account',
      item: account,
      onConfirm: () => {
        const updatedAccounts = customerAccounts.filter(a => a.id !== account.id);
        setCustomerAccounts(updatedAccounts);
        toast({
          title: "Xóa thành công",
          description: `Tài khoản ${account.accountEmail} đã được xóa.`,
          variant: "destructive",
        });
        
        // Sync changes across all admin tabs
        DataSyncHelper.syncAdminData('accounts', updatedAccounts);
      }
    });
  };

  const handleViewAccountDetail = (account: CustomerAccount) => {
    console.log("View account detail", { accountId: account.id });
    // You can implement a detailed view modal here if needed
    toast({
      title: "Chi tiết tài khoản",
      description: `Xem chi tiết tài khoản ${account.accountEmail}`,
    });
  };

  // Filtering, Sorting and Pagination Functions
  const getFilteredAndSortedAccounts = () => {
    let filtered = customerAccounts.filter(account => {
      const matchesSearch = 
        account.customerName.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
        account.customerEmail.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
        account.productType.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
        account.accountEmail.toLowerCase().includes(accountSearchTerm.toLowerCase());
      
      const matchesFilter = accountFilterType === 'all' || account.productType === accountFilterType;
      
      return matchesSearch && matchesFilter;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (accountSortBy) {
        case 'purchaseDate':
          aValue = new Date(a.purchaseDate).getTime();
          bValue = new Date(b.purchaseDate).getTime();
          break;
        case 'expiryDate':
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'productType':
          aValue = a.productType.toLowerCase();
          bValue = b.productType.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (accountSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getPaginatedAccounts = () => {
    const filtered = getFilteredAndSortedAccounts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      accounts: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const getUniqueProductTypes = () => {
    return Array.from(new Set(customerAccounts.map(acc => acc.productType)));
  };

  const handleSort = (column: 'purchaseDate' | 'expiryDate' | 'customerName' | 'productType') => {
    if (accountSortBy === column) {
      setAccountSortOrder(accountSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAccountSortBy(column);
      setAccountSortOrder('asc');
    }
  };

  if (!adminUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QAI Admin Panel</h1>
                <p className="text-sm text-gray-500">Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{adminUser.role.replace('_', ' ')}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {adminUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2" disabled={!hasPermission('users_manage') && !hasPermission('users_view')}>
              <Users className="w-4 h-4" />
              <span>Người dùng</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2" disabled={!hasPermission('products_manage')}>
              <Package className="w-4 h-4" />
              <span>Sản phẩm</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2" disabled={!hasPermission('orders_manage')}>
              <ShoppingCart className="w-4 h-4" />
              <span>Đơn hàng</span>
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Nạp tiền</span>
            </TabsTrigger>
            <TabsTrigger value="customer-accounts" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Tài khoản KH</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Tổng người dùng</p>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        <p className="text-sm text-blue-200 mt-1">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          +12% từ tháng trước
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Tổng doanh thu</p>
                        <p className="text-3xl font-bold">{(stats.totalRevenue).toLocaleString('vi-VN')}đ</p>
                        <p className="text-sm text-green-200 mt-1">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          +8% từ tháng trước
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Sản phẩm hoạt động</p>
                        <p className="text-3xl font-bold">{stats.activeProducts}</p>
                        <p className="text-sm text-purple-200 mt-1">
                          <Activity className="w-3 h-3 inline mr-1" />
                          Đang bán
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Đơn hàng chờ</p>
                        <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                        <p className="text-sm text-orange-200 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Cần xử lý
                        </p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>Doanh thu 6 tháng gần đây</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Doanh thu",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-64"
                    >
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => `${Math.floor(value/1000000)}M`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(value) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                          />} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Monthly Comparison */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span>So sánh doanh thu theo tháng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: {
                          label: "Doanh thu",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-64"
                    >
                      <BarChart data={revenueComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => `${Math.floor(value/1000000)}M`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            formatter={(value) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                          />} 
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {revenueComparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                    
                    {/* Comparison metrics */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {revenueComparisonData.map((item, index) => (
                        <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">{item.name}</div>
                          <div className="text-lg font-bold" style={{ color: item.color }}>
                            {item.value.toLocaleString('vi-VN')}đ
                          </div>
                          {index === 1 && (
                            <div className="text-xs text-green-600 mt-1">
                              +{(((item.value - revenueComparisonData[0].value) / revenueComparisonData[0].value) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <span>Lưu lượng truy cập 7 ngày gần đây</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        visitors: {
                          label: "Lượt truy cập",
                          color: "hsl(var(--chart-3))",
                        },
                        pageViews: {
                          label: "Lượt xem trang",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="h-64"
                    >
                      <LineChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="visitors" 
                          stroke="#8B5CF6" 
                          strokeWidth={3}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pageViews" 
                          stroke="#06B6D4" 
                          strokeWidth={3}
                          dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Traffic Metrics */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MousePointer className="w-5 h-5 text-indigo-600" />
                      <span>Thống kê truy cập</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Tổng lượt truy cập hôm nay</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {trafficData[trafficData.length - 1]?.visitors || 0}
                          </p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Lượt xem trang hôm nay</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {trafficData[trafficData.length - 1]?.pageViews || 0}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-purple-500" />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Tỷ lệ thoát trung bình</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {Math.round(trafficData.reduce((sum, day) => sum + day.bounceRate, 0) / trafficData.length)}%
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100">
                  <CardHeader>
                    <CardTitle className="text-blue-800">Đơn hàng gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">#{order.id}</p>
                              <p className="text-sm text-gray-600">{order.userEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{order.total.toLocaleString('vi-VN')}đ</p>
                            {getStatusBadge(order.status, 'order')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-purple-50 border border-purple-100">
                  <CardHeader>
                    <CardTitle className="text-purple-800">Sản phẩm bán chạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{product.sales} đã bán</p>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">★{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quản lý người dùng</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                    <Button onClick={handleExportUsers}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                    <Button onClick={() => handleEditUser(null)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm người dùng
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead>Đơn hàng</TableHead>
                      <TableHead>Tổng chi tiêu</TableHead>
                      <TableHead className="text-center">
                        <span className="font-semibold text-gray-700">Coins</span>
                      </TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user => 
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.joinDate).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{user.totalOrders}</TableCell>
                        <TableCell>{user.totalSpent.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-gray-800">
                            {(user.coins || 0).toLocaleString('vi-VN')}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status, 'user')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {hasPermission('users_manage') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteUser(user)}
                                title="Xóa người dùng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quản lý sản phẩm</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleExportProducts}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                    <Button onClick={() => handleEditProduct(null)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm sản phẩm
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Kho</TableHead>
                      <TableHead>Đã bán</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell>{product.rating}/5</TableCell>
                        <TableCell>{getStatusBadge(product.status, 'product')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)} title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteProduct(product)}
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quản lý đơn hàng</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc trạng thái
                    </Button>
                    <Button onClick={handleExportOrders}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất đơn hàng
                    </Button>
                    <Button onClick={handleExportDetailedOrders} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất chi tiết
                    </Button>
                    <Button onClick={() => handleEditOrder(null)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo đơn hàng
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Thanh toán</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.userEmail}</TableCell>
                        <TableCell>{order.products.length} sản phẩm</TableCell>
                        <TableCell>{order.total.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{getStatusBadge(order.status, 'order')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)} title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteOrder(order)}
                              title="Xóa đơn hàng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <DepositApprovals />
          </TabsContent>

          {/* Customer Accounts Tab */}
          <TabsContent value="customer-accounts">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
              <CardHeader className="bg-gradient-to-r from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 border-b-0 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-2xl flex items-center justify-center shadow-lg">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent">
                        Quản lý tài khoản khách hàng
                      </CardTitle>
                      <p className="text-gray-600 mt-2">Theo dõi và quản lý tất cả tài khoản đã bán cho khách hàng</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Tổng tài khoản</div>
                      <div className="text-2xl font-bold text-brand-blue">{stats.totalCustomerAccounts}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Đang hoạt động</div>
                      <div className="text-2xl font-bold text-green-600">{stats.activeCustomerAccounts}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Hết hạn</div>
                      <div className="text-2xl font-bold text-red-600">{stats.expiredCustomerAccounts}</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                  <Card className="relative bg-gradient-to-br from-brand-blue via-brand-purple to-indigo-600 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium mb-2">Tổng tài khoản</p>
                          <p className="text-3xl font-black">{stats.totalCustomerAccounts}</p>
                          <p className="text-xs text-blue-200 mt-1">Đã bán</p>
                        </div>
                        <UserCheck className="w-10 h-10 text-blue-200 group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium mb-2">Đang hoạt động</p>
                          <p className="text-3xl font-black">{stats.activeCustomerAccounts}</p>
                          <p className="text-xs text-green-200 mt-1">Khả dụng</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-200 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm font-medium mb-2">Hết hạn</p>
                          <p className="text-3xl font-black">{stats.expiredCustomerAccounts}</p>
                          <p className="text-xs text-red-200 mt-1">Cần xử lý</p>
                        </div>
                        <XCircle className="w-10 h-10 text-red-200 group-hover:shake transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm font-medium mb-2">Doanh thu</p>
                          <p className="text-3xl font-black">{Math.floor(stats.totalCustomerAccounts * 75000).toLocaleString('vi-VN')}</p>
                          <p className="text-xs text-yellow-200 mt-1">VNĐ</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-yellow-200 group-hover:rotate-45 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                {/* Enhanced Search and Filter */}
                <div className="flex flex-col lg:flex-row gap-6 items-center mb-8">
                  <div className="relative flex-1 max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-brand-blue" />
                    </div>
                    <Input
                      type="text"
                      placeholder="🔍 Tìm kiếm theo tên khách hàng, email, sản phẩm..."
                      value={accountSearchTerm}
                      onChange={(e) => setAccountSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all duration-300 bg-white shadow-inner"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Select value={accountFilterType} onValueChange={setAccountFilterType}>
                      <SelectTrigger className="w-48 border-2 border-gray-200 hover:border-brand-purple transition-colors duration-300 rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Lọc theo sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                        {getUniqueProductTypes().map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={`${accountSortBy}-${accountSortOrder}`} onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split('-') as [typeof accountSortBy, typeof accountSortOrder];
                      setAccountSortBy(sortBy);
                      setAccountSortOrder(sortOrder);
                    }}>
                      <SelectTrigger className="w-48 border-2 border-gray-200 hover:border-brand-emerald transition-colors duration-300 rounded-xl">
                        <SortAsc className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sắp xếp theo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchaseDate-desc">Ngày mua (Mới nhất)</SelectItem>
                        <SelectItem value="purchaseDate-asc">Ngày mua (Cũ nhất)</SelectItem>
                        <SelectItem value="expiryDate-desc">Ngày hết hạn (Xa nhất)</SelectItem>
                        <SelectItem value="expiryDate-asc">Ngày hết hạn (Gần nhất)</SelectItem>
                        <SelectItem value="customerName-asc">Tên A-Z</SelectItem>
                        <SelectItem value="customerName-desc">Tên Z-A</SelectItem>
                        <SelectItem value="productType-asc">Sản phẩm A-Z</SelectItem>
                        <SelectItem value="productType-desc">Sản phẩm Z-A</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white shadow-lg rounded-xl px-6">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                    
                    <Button 
                      onClick={() => handleEditAccount(null)} 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-xl px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm tài khoản
                    </Button>
                  </div>
                </div>

                {/* Enhanced Table */}
                <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b-2 border-gray-100">
                        <TableHead className="w-[18%] py-4 px-6 font-semibold text-gray-700">Tài khoản</TableHead>
                        <TableHead 
                          className="w-[9%] py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleSort('customerName')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Khách hàng</span>
                            {accountSortBy === 'customerName' && (
                              accountSortOrder === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[9%] py-4 px-4 font-semibold text-gray-700">Hạng khách hàng</TableHead>
                        <TableHead 
                          className="w-[9%] py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleSort('purchaseDate')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Ngày mua</span>
                            {accountSortBy === 'purchaseDate' && (
                              accountSortOrder === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-[9%] py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleSort('expiryDate')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Ngày hết hạn</span>
                            {accountSortBy === 'expiryDate' && (
                              accountSortOrder === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[8%] py-4 px-4 font-semibold text-gray-700">Trạng thái</TableHead>
                        <TableHead 
                          className="w-[9%] py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleSort('productType')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Sản phẩm</span>
                            {accountSortBy === 'productType' && (
                              accountSortOrder === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[8%] py-4 px-4 font-semibold text-gray-700">Giá mua</TableHead>
                        <TableHead className="w-[8%] py-4 px-4 font-semibold text-gray-700">Số điện thoại</TableHead>
                        <TableHead className="w-[9%] py-4 px-4 font-semibold text-gray-700">Email KH</TableHead>
                        <TableHead className="w-[6%] py-4 px-4 font-semibold text-gray-700">Link</TableHead>
                        <TableHead className="w-[9%] text-right py-4 px-6 font-semibold text-gray-700">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedAccounts().accounts.map((account, index) => (
                        <TableRow 
                          key={account.id} 
                          className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 transition-all duration-200 border-b border-gray-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <TableCell className="py-6 px-6">
                            <div className="space-y-3">
                              <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg">
                                <div className="truncate">{account.accountEmail}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyCredential(account.accountEmail)}
                                  className="h-7 px-2 text-xs"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyCredential(account.accountPassword)}
                                  className="h-7 px-2 text-xs"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Pass
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="font-semibold text-gray-800 truncate">{account.customerName}</div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            {account.customerRank && (
                              <div className="flex items-center space-x-2">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${account.customerRank.backgroundColor} shadow-lg`}
                                >
                                  <account.customerRank.icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs font-medium border-2"
                                    style={{ 
                                      borderColor: account.customerRank.color,
                                      color: account.customerRank.color,
                                      backgroundColor: `${account.customerRank.color}15`
                                    }}
                                  >
                                    {account.customerRank.name}
                                  </Badge>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {account.totalSpent?.toLocaleString('vi-VN')}đ • {account.totalOrders} đơn
                                  </div>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-brand-blue flex-shrink-0" />
                              <span className="text-sm font-medium">{formatDate(account.purchaseDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span className="text-sm font-medium">{formatDate(account.expiryDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="flex items-center space-x-2">
                              {getAccountStatusIcon(account.status)}
                              {getAccountStatusBadge(account.status)}
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <Badge 
                              variant="outline" 
                              className="text-xs px-2 py-1 font-medium border-2 border-brand-purple/30 text-brand-purple bg-brand-purple/5 w-fit"
                            >
                              {account.productType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="font-semibold text-green-700">
                                {account.purchasePrice.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="font-mono text-sm truncate">{account.customerPhone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm truncate">{account.customerEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4">
                            {account.link && (
                              <div className="flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(account.link, '_blank')}
                                  className="h-8 w-8 p-0 rounded-lg border-purple-200 hover:bg-purple-50"
                                  title="Truy cập dịch vụ"
                                >
                                  <ExternalLink className="w-4 h-4 text-purple-600" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-6 px-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 h-8 px-3 transition-all duration-200 hover:scale-105"
                                onClick={() => handleEditAccount(account)}
                                title="Chỉnh sửa tài khoản"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Sửa
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 px-3 transition-all duration-200 hover:scale-105"
                                onClick={() => handleDeleteAccount(account)}
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Xóa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {getPaginatedAccounts().totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 px-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, getPaginatedAccounts().totalItems)} của {getPaginatedAccounts().totalItems} tài khoản
                      </span>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 / trang</SelectItem>
                          <SelectItem value="10">10 / trang</SelectItem>
                          <SelectItem value="20">20 / trang</SelectItem>
                          <SelectItem value="50">50 / trang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex"
                      >
                        Đầu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                        Trước
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, getPaginatedAccounts().totalPages) }, (_, i) => {
                          let pageNumber;
                          if (getPaginatedAccounts().totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= getPaginatedAccounts().totalPages - 2) {
                            pageNumber = getPaginatedAccounts().totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className={currentPage === pageNumber ? 'bg-brand-blue text-white' : ''}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === getPaginatedAccounts().totalPages}
                      >
                        Sau
                        <ChevronUp className="w-4 h-4 rotate-90" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(getPaginatedAccounts().totalPages)}
                        disabled={currentPage === getPaginatedAccounts().totalPages}
                        className="hidden sm:flex"
                      >
                        Cuối
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <EditUserDialog
          user={editUserDialog.user}
          open={editUserDialog.open}
          onOpenChange={(open) => setEditUserDialog({ ...editUserDialog, open })}
          onSave={handleSaveUser}
        />

        <EditProductDialog
          product={editProductDialog.product}
          open={editProductDialog.open}
          onOpenChange={(open) => setEditProductDialog({ ...editProductDialog, open })}
          onSave={handleSaveProduct}
        />

        <EditOrderDialog
          order={editOrderDialog.order}
          open={editOrderDialog.open}
          onOpenChange={(open) => setEditOrderDialog({ ...editOrderDialog, open })}
          onSave={handleSaveOrder}
        />

        <EditCustomerAccountDialog
          account={editAccountDialog.account}
          open={editAccountDialog.open}
          onOpenChange={(open) => setEditAccountDialog({ ...editAccountDialog, open })}
          onSave={handleSaveAccount}
        />

        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
          onConfirm={deleteDialog.onConfirm}
          title={`Xóa ${
            deleteDialog.type === 'user' ? 'người dùng' : 
            deleteDialog.type === 'product' ? 'sản phẩm' : 
            deleteDialog.type === 'order' ? 'đơn hàng' : 
            'tài khoản khách hàng'
          }`}
          description={`Bạn có chắc chắn muốn xóa ${
            deleteDialog.type === 'user' ? 'người dùng' : 
            deleteDialog.type === 'product' ? 'sản phẩm' : 
            deleteDialog.type === 'order' ? 'đơn hàng' : 
            'tài khoản khách hàng'
          } này không?`}
          itemName={
            deleteDialog.item?.name || 
            deleteDialog.item?.email || 
            deleteDialog.item?.accountEmail || 
            deleteDialog.item?.customerName || 
            deleteDialog.item?.id || 
            ''
          }
          type={deleteDialog.type}
        />
      </div>
    </div>
  );
}