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
  Globe,
  RefreshCw,
  CreditCard,
  Send,
  UserPlus,
  MessageSquare,
  FileText,
  Zap
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { EditProductDialog } from '@/components/admin/EditProductDialog';
import { EditOrderDialog } from '@/components/admin/EditOrderDialog';
import { EditCustomerAccountDialog } from '@/components/admin/EditCustomerAccountDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import AdminOrderDetailModal from '@/components/admin/AdminOrderDetailModal';
import DepositApprovals from '@/components/admin/DepositApprovals';
import { exportUsersToExcel, exportProductsToExcel, exportOrdersToExcel, exportDetailedOrdersToExcel } from '@/lib/excelExport';
import DataSyncHelper from '@/lib/syncHelper';
import { CustomerRank } from '@/types/RankingData.interface';
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
  CustomerRankDisplay,
} from '@/components/CustomerRankingSystem';
import { User } from '@/types/user.interface';
import { fetchAdminUsers, getProductsAdmin, deleteProduct, checkRole } from '@/lib/api';
import { Product } from '@/types/product.interface';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   joinDate: string;
//   status: 'active' | 'inactive' | 'banned';
//   totalOrders: number;
//   totalSpent: number;
//   coins?: number;
// }

// interface Product {
//   id: number;
//   name: string;
//   category: string;
//   price: number;
//   originalPrice: number;
//   stock: number;
//   status: 'active' | 'inactive';
//   sales: number;
//   rating: number;
// }

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerName?: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  discount?: number;
  originalTotal?: number;
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
import { deleteAdminUser } from '@/lib/api'; // Import hàm xóa người dùng từ api.ts

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>([]);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true); // để kiểm tra loading

  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [editProductDialog, setEditProductDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [editOrderDialog, setEditOrderDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [editAccountDialog, setEditAccountDialog] = useState<{ open: boolean; account: CustomerAccount | null }>({ open: false, account: null });
  const [adminOrderDetailModal, setAdminOrderDetailModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'user' | 'product' | 'order' | 'account';
    item: any;
    onConfirm: () => void
  }>({ open: false, type: 'user', item: null, onConfirm: () => { } });

  // Customer Accounts State
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [accountFilterType, setAccountFilterType] = useState<string>('all');
  const [accountSortBy, setAccountSortBy] = useState<'purchaseDate' | 'expiryDate' | 'customerName' | 'productType'>('purchaseDate');
  const [accountSortOrder, setAccountSortOrder] = useState<'asc' | 'desc'>('desc');

  // Orders State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSortBy, setOrderSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Send Accounts State
  const [sendAccountModal, setSendAccountModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('🎉 Tài khoản premium của bạn đã sẵn sàng!');
  const [emailMessage, setEmailMessage] = useState(`Xin chào {customerName},

Cảm ơn bạn đã tin tưởng và mua hàng tại QAI Store! 

Tài khoản premium của bạn đã được kích hoạt thành công:

📧 Email: {accountEmail}
🔑 Mật khẩu: {accountPassword}
🔗 Link truy cập: {accountLink}
⏰ Thời hạn: {duration}

Hướng dẫn sử dụng:
1. Truy cập link ở trên
2. Đăng nhập bằng thông tin được cung cấp
3. Thay đổi mật khẩu nếu cần thiết

Lưu ý quan trọng:
- Vui lòng không chia sẻ thông tin này cho người khác
- Hãy đăng nhập ngay để đảm bảo tài khoản hoạt động bình thường
- Nếu có vấn đề gì, hãy liên hệ với chúng tôi ngay

Cảm ơn bạn đã chọn QAI Store! 💙

---
QAI Store - Tài khoản premium uy tín #1
📞 Hotline: 1900-xxx-xxx
📧 Email: support@qaistore.com`);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { user, logout, role, sessionId, isLoading, setRole, setSessionId } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Data generation functions moved outside component to avoid errors
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [revenueComparisonData, setRevenueComparisonData] = useState<any[]>([]);


  const handleLogout = async () => {
    await logout();
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi Admin Panel.",
    });
    localStorage.clear();
    setRole('');
    setSessionId('');
    router.push('/admin/login');
  };

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

  useEffect(() => {
    const fetchRoleAndRedirect = async () => {
      if (!sessionId) {
        return;
      }

      try {
        const roleData = await checkRole(sessionId);

        if (roleData.role !== 'admin') {
          router.push('/admin/login');
        } else {
          setIsAuthorized(true);
          loadDashboardData();
        }
      } catch (error) {
        router.push('/admin/login');
      } finally {
        setIsCheckingRole(false); // kết thúc check
      }
    };

    fetchRoleAndRedirect();
  }, [sessionId, router]);

  // Subscribe to data synchronization changes
  useEffect(() => {
    const unsubscribe = DataSyncHelper.subscribeToAdminChanges((type, data) => {

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

      // Force reload orders from enhanced Orders API to get the latest data immediately
      try {
        const ordersResponse = await fetch('/api/orders?includeProducts=true');
        const ordersResult = await ordersResponse.json();

        if (ordersResult.success && ordersResult.data.length > 0) {
          setOrders(ordersResult.data);
        } else {
          // Fallback to legacy API
          const syncedOrders = await DataSyncHelper.loadAdminData('orders', true);
          if (syncedOrders.length > 0) {
            setOrders(syncedOrders);
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

    try {
      // Load user wallets first using direct API call
      const syncedWallets = await DataSyncHelper.fetchFromAPI('userWallets') || [];
      setUserWallets(syncedWallets);
      // Load users with JSON API support
      if (sessionId) {
        const syncedUsers = await fetchAdminUsers(sessionId);

        if (syncedUsers.data.length > 0) {
          const usersWithStats = syncedUsers.data.map((user: any) => {
            // Find user's wallet data
            // const userWallet = syncedWallets.find((wallet: any) => wallet.userId === user.id);
            return {
              ...user,
              status: user.status || 'active',
              totalOrders: user.total_orders,
              totalSpent: user.total_spent,
              coins: user.coins,
              joinDate: user.join_date
            };
          });

          setUsers(usersWithStats);
        }
      }

      // Load orders with enhanced JSON API support using dedicated Orders API
      try {
        const ordersResponse = await fetch('/api/orders?includeProducts=true');
        const ordersResult = await ordersResponse.json();

        if (ordersResult.success && ordersResult.data.length > 0) {
          setOrders(ordersResult.data);
        } else {
          // Fallback to legacy data API
          const syncedOrders = await DataSyncHelper.loadAdminData('orders', forceAPI);
          if (syncedOrders.length > 0) {
            setOrders(syncedOrders);
          } else {
            const storedOrders = localStorage.getItem('qai_orders');
            if (storedOrders) {
              const orders = JSON.parse(storedOrders);
              setOrders(orders);
              await DataSyncHelper.syncAdminData('orders', orders);
            }
          }
        }
      } catch (ordersApiError) {
        // Fallback to legacy API
        const syncedOrders = await DataSyncHelper.loadAdminData('orders', forceAPI);
        if (syncedOrders.length > 0) {
          setOrders(syncedOrders);
        }
      }

      loadProducts();

      // Load customer accounts with JSON API support
      await loadCustomerAccounts(forceAPI);

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  };

  const loadProducts = async () => {
    if (sessionId) {
      const data = await getProductsAdmin(sessionId);
      setProducts(data);
    }
  }


  const loadCustomerAccounts = async (forceAPI = false) => {
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
    setEditUserDialog({ open: true, user });
  };

  const handleSaveUser = (userData: User) => {
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
        // localStorage.setItem('qai_users', JSON.stringify(updatedLegacyUsers));
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
      // localStorage.setItem('qai_users', JSON.stringify(legacyUsers));
    }

    // Sync changes across all admin tabs
    DataSyncHelper.syncAdminData('users', updatedUsers);
  };

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const handleDeleteUser = (user: User) => {

    if (!sessionId) {
      setError('Session ID is missing.');
      setLoading(false);
      return;
    }

    setDeleteDialog({
      open: true,
      type: 'user',
      item: user,
      onConfirm: async () => {
        try {
          // Gọi API xóa người dùng
          const response = await deleteAdminUser(sessionId, user.id);

          // Nếu xóa thành công, cập nhật lại danh sách người dùng
          const updatedUsers = users.filter(u => u.id !== user.id);
          setUsers(updatedUsers);

          toast({
            title: "Xóa thành công",
            description: `Người dùng ${user.name} đã được xóa.`,
            variant: "destructive",
          });

        } catch (error) {
          toast({
            title: "Lỗi xóa người dùng",
            description: `Không thể xóa người dùng ${user.name}. Lỗi: ${error}`,
            variant: "destructive",
          });
          console.error('Error deleting user:', error);
        }
      }
    });
  };

  const handleEditProduct = (product: Product | null) => {
    setEditProductDialog({ open: true, product });
  };

  const handleSaveProduct = (productData: Product) => {
    let updatedProducts: Product[];

    if (editProductDialog.product) {
      // Update existing product
      updatedProducts = products.map(p =>
        p.id === productData.id ? productData : p
      );
      setProducts(updatedProducts);
      toast({
        title: "Cập nhật thành công",
        description: `Sản phẩm ${productData.name} đã được cập nhật.`,
      });
    } else {
      // Add new product

      const newProduct = { ...productData };
      updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      toast({
        title: "Tạo mới thành công",
        description: `Sản phẩm ${productData.name} đã được tạo.`,
      });
    }
    loadProducts();

  };

  const handleDeleteProduct = (product: Product) => {

    setDeleteDialog({
      open: true,
      type: 'product',
      item: product,
      onConfirm: async () => {
        try {
          // Gọi API deleteProduct để xóa sản phẩm
          if (!sessionId) throw new Error('Missing session token');

          await deleteProduct(sessionId, product.id);

          // Nếu xóa thành công, cập nhật lại danh sách sản phẩm
          const updatedProducts = products.filter(p => p.id !== product.id);
          setProducts(updatedProducts);

          // Hiển thị thông báo thành công
          toast({
            title: "Xóa thành công",
            description: `Sản phẩm ${product.name} đã được xóa.`,
            variant: "destructive",
          });

        } catch (error) {
          console.error('❌ Failed to delete product:', error);
          toast({
            title: "Lỗi khi xóa sản phẩm",
            description: 'Có lỗi xảy ra khi xóa sản phẩm',
            variant: "destructive",
          });
        }
      }
    });
  };

  const handleViewOrderDetail = (order: Order) => {
    console.log("👁️ Opening admin order detail modal for:", order.id);
    setAdminOrderDetailModal({ open: true, order });
  };

  const handleCloseOrderDetailModal = () => {
    console.log("❌ Closing admin order detail modal");
    setAdminOrderDetailModal({ open: false, order: null });
  };

  const handleSaveOrderFromModal = (updatedOrder: Order) => {
    console.log("💾 Saving order from modal:", updatedOrder.id);
    handleSaveOrder(updatedOrder);
    handleCloseOrderDetailModal();
  };

  const handleOrderStatusChange = (orderId: string, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    console.log("🔄 Order status change:", { orderId, newStatus });
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);

    // Sync changes
    DataSyncHelper.syncAdminData('orders', updatedOrders);

    toast({
      title: "Trạng thái đã cập nhật",
      description: `Đơn hàng #${orderId} đã chuyển sang trạng thái: ${newStatus}`
    });
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

  // Quick action functions for orders
  const handleCompleteAllPendingOrders = () => {
    console.log("Complete all pending orders clicked");
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) {
      toast({
        title: "Không có đơn hàng",
        description: "Không có đơn hàng nào đang chờ xử lý.",
      });
      return;
    }

    const updatedOrders = orders.map(o =>
      o.status === 'pending' ? { ...o, status: 'completed' as const, completedAt: new Date().toISOString() } : o
    );
    setOrders(updatedOrders);
    DataSyncHelper.syncAdminData('orders', updatedOrders);

    toast({
      title: "Cập nhật thành công",
      description: `Đã hoàn thành ${pendingOrders.length} đơn hàng.`,
    });
  };

  const handleSendNotificationEmail = async () => {
    console.log("📢 Sending notification email to all customers");
    setSendingNotifications(true);

    try {
      // Get all unique customer emails from orders
      const customerEmails = Array.from(new Set(orders.map(order => order.userEmail)));

      if (customerEmails.length === 0) {
        toast({
          title: "Không có khách hàng",
          description: "Không tìm thấy email khách hàng nào để gửi thông báo.",
          variant: "destructive",
        });
        return;
      }

      const notificationSubject = "🎉 Thông báo mới từ QAI Store - Khuyến mãi đặc biệt!";
      const notificationContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">🎉 Chào mừng từ QAI Store!</h2>
          
          <p>Xin chào quý khách hàng thân mến,</p>
          
          <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của QAI Store. Chúng tôi có một số thông báo quan trọng dành cho bạn:</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🚀 Tin tức mới:</h3>
            <ul>
              <li>Bổ sung thêm nhiều sản phẩm premium mới</li>
              <li>Cải thiện hệ thống giao hàng tự động 24/7</li>
              <li>Hỗ trợ khách hàng nhanh chóng hơn</li>
            </ul>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <h3 style="color: #15803d; margin-top: 0;">💰 Ưu đãi đặc biệt:</h3>
            <p>Giảm giá <strong>20%</strong> cho tất cả sản phẩm trong tuần này!</p>
            <p>Sử dụng mã: <strong style="background-color: #dcfce7; padding: 2px 8px; border-radius: 4px;">SAVE20</strong></p>
          </div>
          
          <p>Để xem các sản phẩm mới nhất, vui lòng truy cập website của chúng tôi.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            Cảm ơn bạn đã chọn QAI Store! 💙<br>
            QAI Store - Tài khoản premium uy tín #1<br>
            📞 Hotline: 1900-xxx-xxx | 📧 Email: support@qaistore.com
          </p>
        </div>
      `;

      let sentCount = 0;
      let failedCount = 0;

      // Send notification to all customers (in batches to avoid overwhelming the API)
      const batchSize = 5;
      for (let i = 0; i < customerEmails.length; i += batchSize) {
        const batch = customerEmails.slice(i, i + batchSize);

        await Promise.all(batch.map(async (email) => {
          try {
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: email,
                subject: notificationSubject,
                content: notificationContent,
                orderInfo: {
                  type: 'notification',
                  customerEmail: email
                }
              })
            });

            const result = await response.json();

            if (result.success) {
              sentCount++;
              console.log(`✅ Notification sent to ${email}`);
            } else {
              failedCount++;
              console.error(`❌ Failed to send notification to ${email}:`, result.error);
            }

          } catch (error) {
            failedCount++;
            console.error(`❌ Error sending notification to ${email}:`, error);
          }
        }));

        // Small delay between batches to be respectful to the email service
        if (i + batchSize < customerEmails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Show results
      if (sentCount > 0) {
        toast({
          title: "📧 Gửi thông báo thành công",
          description: `Đã gửi email thông báo đến ${sentCount}/${customerEmails.length} khách hàng.`,
        });
      } else {
        toast({
          title: "❌ Gửi thông báo thất bại",
          description: "Không thể gửi email thông báo. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }

      console.log("📊 Notification email summary:", {
        total: customerEmails.length,
        sent: sentCount,
        failed: failedCount
      });

    } catch (error) {
      console.error("💥 Error sending notification emails:", error);
      toast({
        title: "❌ Lỗi gửi thông báo",
        description: "Có lỗi xảy ra khi gửi email thông báo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSendingNotifications(false);
    }
  };

  const handleExportMonthlyReport = () => {
    console.log("Export monthly report clicked");
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const success = exportDetailedOrdersToExcel(monthlyOrders);
    if (success) {
      toast({
        title: "Xuất báo cáo thành công",
        description: `Báo cáo tháng ${currentMonth + 1}/${currentYear} đã được xuất.`,
      });
    }
  };

  // Send Accounts Functions
  const handleSendAccountToCustomer = (order: Order) => {
    console.log("Send account to customer clicked", { orderId: order.id });
    setSendAccountModal({ open: true, order });
  };

  const handleBulkSendAccounts = () => {
    console.log("Bulk send accounts clicked", { selectedCount: selectedOrders.length });
    if (selectedOrders.length === 0) {
      toast({
        title: "Chưa chọn đơn hàng",
        description: "Vui lòng chọn ít nhất một đơn hàng để gửi tài khoản.",
        variant: "destructive",
      });
      return;
    }
    setSendAccountModal({ open: true, order: null });
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      const completedOrderIds = orders.filter(o => o.status === 'completed').map(o => o.id);
      setSelectedOrders(completedOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const generateAccountCredentials = (order: Order) => {
    // Generate sample account credentials for demonstration
    const productName = order.products[0]?.name || 'Premium Account';
    const baseEmail = productName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

    return {
      accountEmail: `${baseEmail}@example.com`,
      accountPassword: `Pass${Math.floor(Math.random() * 10000)}!`,
      accountLink: getProductLink(productName),
      duration: '1 tháng'
    };
  };

  const getProductLink = (productName: string) => {
    const links: { [key: string]: string } = {
      'Netflix Premium': 'https://netflix.com',
      'Spotify Premium': 'https://spotify.com',
      'ChatGPT Plus': 'https://chat.openai.com',
      'YouTube Premium': 'https://youtube.com',
      'Adobe Creative Cloud': 'https://adobe.com'
    };
    return links[productName] || 'https://example.com';
  };

  const formatEmailContent = (order: Order, credentials: any) => {
    return emailMessage
      .replace('{customerName}', order.customerName || order.userEmail)
      .replace('{accountEmail}', credentials.accountEmail)
      .replace('{accountPassword}', credentials.accountPassword)
      .replace('{accountLink}', credentials.accountLink)
      .replace('{duration}', credentials.duration);
  };

  const handleSendEmails = async () => {
    console.log("🚀 Starting real email sending process");
    setSendingEmails(true);

    try {
      const ordersToSend = sendAccountModal.order
        ? [sendAccountModal.order]
        : orders.filter(o => selectedOrders.includes(o.id));

      let sentCount = 0;
      let failedCount = 0;
      const failedEmails: string[] = [];

      for (const order of ordersToSend) {
        try {
          const credentials = generateAccountCredentials(order);
          const emailContent = formatEmailContent(order, credentials);

          console.log(`📧 Sending email ${sentCount + 1}/${ordersToSend.length} to:`, order.userEmail);

          // Call the actual email API
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: order.userEmail,
              subject: emailSubject,
              content: emailContent,
              credentials: credentials,
              orderInfo: {
                orderId: order.id,
                customerName: order.customerName || order.userEmail,
                total: order.total
              }
            })
          });

          const result = await response.json();

          if (result.success) {
            sentCount++;
            console.log(`✅ Email sent successfully to ${order.userEmail}:`, result);
          } else {
            failedCount++;
            failedEmails.push(order.userEmail);
            console.error(`❌ Failed to send email to ${order.userEmail}:`, result.error);
          }

        } catch (emailError) {
          failedCount++;
          failedEmails.push(order.userEmail);
          console.error(`❌ Error sending email to ${order.userEmail}:`, emailError);
        }
      }

      // Show success/failure summary
      if (sentCount > 0 && failedCount === 0) {
        toast({
          title: "🎉 Gửi email thành công!",
          description: `Đã gửi thành công ${sentCount} email tài khoản đến khách hàng.`,
        });
      } else if (sentCount > 0 && failedCount > 0) {
        toast({
          title: "⚠️ Gửi email hoàn thành với lỗi",
          description: `Thành công: ${sentCount}, Thất bại: ${failedCount}. Kiểm tra console để biết chi tiết.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Gửi email thất bại",
          description: `Không thể gửi email nào. Vui lòng kiểm tra kết nối và thử lại.`,
          variant: "destructive",
        });
      }

      // Log detailed results
      console.log("📊 Email sending summary:", {
        total: ordersToSend.length,
        sent: sentCount,
        failed: failedCount,
        failedEmails: failedEmails
      });

      // Reset states only if some emails were sent successfully
      if (sentCount > 0) {
        setSendAccountModal({ open: false, order: null });
        setSelectedOrders([]);
      }

    } catch (error) {
      console.error("💥 Critical error in email sending process:", error);
      toast({
        title: "❌ Lỗi nghiêm trọng",
        description: "Có lỗi nghiêm trọng xảy ra khi gửi email. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setSendingEmails(false);
    }
  };

  const resetEmailTemplate = () => {
    setEmailSubject('🎉 Tài khoản premium của bạn đã sẵn sàng!');
    setEmailMessage(`Xin chào {customerName},

Cảm ơn bạn đã tin tưởng và mua hàng tại QAI Store! 

Tài khoản premium của bạn đã được kích hoạt thành công:

📧 Email: {accountEmail}
🔑 Mật khẩu: {accountPassword}
🔗 Link truy cập: {accountLink}
⏰ Thời hạn: {duration}

Hướng dẫn sử dụng:
1. Truy cập link ở trên
2. Đăng nhập bằng thông tin được cung cấp
3. Thay đổi mật khẩu nếu cần thiết

Lưu ý quan trọng:
- Vui lòng không chia sẻ thông tin này cho người khác
- Hãy đăng nhập ngay để đảm bảo tài khoản hoạt động bình thường
- Nếu có vấn đề gì, hãy liên hệ với chúng tôi ngay

Cảm ơn bạn đã chọn QAI Store! 💙

---
QAI Store - Tài khoản premium uy tín #1
📞 Hotline: 1900-xxx-xxx
📧 Email: support@qaistore.com`);
  };

  const handleTestEmail = async () => {
    console.log("🧪 Testing email configuration");

    if (!user?.email) {
      toast({
        title: "❌ Lỗi test email",
        description: "Không tìm thấy email admin để gửi test.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a test order for demonstration
      const testOrder: Order = {
        id: `TEST_${Date.now()}`,
        userId: user.id || 'admin',
        userEmail: user.email,
        customerName: user.name,
        products: [{ name: 'Netflix Premium (Test)', quantity: 1, price: 50000 }],
        total: 50000,
        status: 'completed' as const,
        paymentMethod: 'Test',
        createdAt: new Date().toISOString()
      };

      const testCredentials = generateAccountCredentials(testOrder);
      const testEmailContent = formatEmailContent(testOrder, testCredentials);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: `[TEST] ${emailSubject}`,
          content: testEmailContent,
          credentials: testCredentials,
          orderInfo: {
            orderId: testOrder.id,
            customerName: testOrder.customerName,
            total: testOrder.total,
            type: 'test'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Test email thành công!",
          description: `Email test đã được gửi đến ${user.email}. Kiểm tra hộp thư của bạn.`,
        });
        console.log("✅ Test email sent successfully:", result);
      } else {
        toast({
          title: "❌ Test email thất bại",
          description: `Lỗi: ${result.error}`,
          variant: "destructive",
        });
        console.error("❌ Test email failed:", result.error);
      }

    } catch (error) {
      console.error("💥 Error sending test email:", error);
      toast({
        title: "❌ Lỗi test email",
        description: "Có lỗi xảy ra khi gửi email test. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
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

  // Orders filtering and sorting functions
  const getFilteredAndSortedOrders = () => {
    let filtered = orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
        order.products.some(product => product.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()));

      const matchesStatus = orderFilterStatus === 'all' || order.status === orderFilterStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (orderSortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.total - a.total;
        case 'lowest':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredOrders = getFilteredAndSortedOrders();

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isCheckingRole) {
    return <div className="p-4 text-center text-gray-500">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAuthorized) {
    return null; // Không render gì nếu chưa được cấp quyền
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Modern Header */}
      <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl border-b-4 border-purple-300/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute -bottom-2 left-10 w-20 h-20 bg-blue-300/15 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Enhanced Logo */}
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-pink-400/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Enhanced Title */}
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-white drop-shadow-2xl">
                  <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                    QAI Admin Panel
                  </span>
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <p className="text-white/90 font-medium tracking-wide">Management Dashboard</p>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-semibold border border-white/30">
                    LIVE
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced User Section */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg font-bold text-white drop-shadow-lg">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-gradient-to-r from-yellow-400/80 to-orange-400/80 rounded-md text-xs font-bold text-white shadow-lg">
                    {user.role.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="relative group">
                <Avatar className="w-12 h-12 ring-4 ring-white/30 shadow-2xl group-hover:ring-white/50 transition-all duration-300">
                  <AvatarFallback className="bg-gradient-to-br from-white/90 to-white/70 text-purple-600 font-black text-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-red-500/80 hover:border-red-400 hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Modern Navigation */}
      <div className="relative -mt-6 px-8 z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Modern Floating Navigation */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-2">
            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2 h-auto p-0">
              <TabsTrigger
                value="overview"
                className="group flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0"
              >
                <div className="relative">
                  <BarChart3 className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-lg opacity-0 group-data-[state=active]:opacity-60 transition-opacity duration-300"></div>
                </div>
                <span className="font-semibold text-sm group-data-[state=active]:drop-shadow-lg">Tổng quan</span>
              </TabsTrigger>

              <TabsTrigger
                value="users"
                disabled={role != 'admin'}
                className="group flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <div className="relative">
                  <Users className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-lg opacity-0 group-data-[state=active]:opacity-60 transition-opacity duration-300"></div>
                </div>
                <span className="font-semibold text-sm group-data-[state=active]:drop-shadow-lg">Người dùng</span>
              </TabsTrigger>

              <TabsTrigger
                value="inventory-accounts"
                disabled={role != 'admin'}
                className="group flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <div className="relative">
                  <Package className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-lg opacity-0 group-data-[state=active]:opacity-60 transition-opacity duration-300"></div>
                </div>
                <span className="font-semibold text-sm group-data-[state=active]:drop-shadow-lg">Kho & Tài khoản {user.role}</span>
              </TabsTrigger>

              <TabsTrigger
                value="orders"
                disabled={role != 'admin'}
                className="group flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full blur-lg opacity-0 group-data-[state=active]:opacity-60 transition-opacity duration-300"></div>
                </div>
                <span className="font-semibold text-sm group-data-[state=active]:drop-shadow-lg">Đơn hàng & Gửi TK</span>
              </TabsTrigger>

              <TabsTrigger
                value="deposits"
                className="group flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0"
              >
                <div className="relative">
                  <DollarSign className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-lg opacity-0 group-data-[state=active]:opacity-60 transition-opacity duration-300"></div>
                </div>
                <span className="font-semibold text-sm group-data-[state=active]:drop-shadow-lg">Nạp tiền</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div >

      <div className="p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

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
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${Math.floor(value / 1000000)}M`}
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
                          tickFormatter={(value) => `${Math.floor(value / 1000000)}M`}
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
                              <p className="text-sm text-gray-600">{product.category.name}</p>
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
                      <TableHead>Phone</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead>Đơn hàng</TableHead>
                      <TableHead>Tổng chi tiêu</TableHead>
                      <TableHead>Points</TableHead>
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
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.totalOrders}</TableCell>
                        <TableCell>{user.totalSpent?.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-gray-800">
                            {(user.points || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-gray-800">
                            {(user.coins || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status, 'user')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {/* <Button variant="ghost" size="sm" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {role == 'admin' && (
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

          {/* Combined Inventory & Accounts Tab */}
          <TabsContent value="inventory-accounts">
            <div className="space-y-8">
              {/* Combined Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Tổng sản phẩm</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Sản phẩm hoạt động</p>
                        <p className="text-2xl font-bold">{stats.activeProducts}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Tài khoản KH</p>
                        <p className="text-2xl font-bold">{stats.totalCustomerAccounts}</p>
                      </div>
                      <UserCheck className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">TK hoạt động</p>
                        <p className="text-2xl font-bold">{stats.activeCustomerAccounts}</p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sub Navigation */}
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="products" className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Quản lý sản phẩm</span>
                  </TabsTrigger>
                  <TabsTrigger value="accounts" className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Tài khoản khách hàng</span>
                  </TabsTrigger>
                </TabsList>

                {/* Products Management */}
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
                              <TableCell>{product.category.name}</TableCell>
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

                {/* Customer Accounts Management */}
                <TabsContent value="accounts">
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
                    <CardHeader className="bg-gradient-to-r from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 border-b-0 pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-xl flex items-center justify-center shadow-lg">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent">
                              Tài khoản khách hàng
                            </CardTitle>
                            <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả tài khoản đã bán</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="text-brand-blue font-bold text-lg">{stats.totalCustomerAccounts}</div>
                            <div className="text-gray-500">Tổng TK</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-600 font-bold text-lg">{stats.activeCustomerAccounts}</div>
                            <div className="text-gray-500">Hoạt động</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-600 font-bold text-lg">{stats.expiredCustomerAccounts}</div>
                            <div className="text-gray-500">Hết hạn</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* Enhanced Search and Filter */}
                      <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
                        <div className="relative flex-1 max-w-lg">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-brand-blue" />
                          </div>
                          <Input
                            type="text"
                            placeholder="🔍 Tìm kiếm theo tên khách hàng, email, sản phẩm..."
                            value={accountSearchTerm}
                            onChange={(e) => setAccountSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Select value={accountFilterType} onValueChange={setAccountFilterType}>
                            <SelectTrigger className="w-44 border-2 border-gray-200 hover:border-brand-purple transition-colors duration-300 rounded-lg">
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
                            <SelectTrigger className="w-44 border-2 border-gray-200 hover:border-brand-emerald transition-colors duration-300 rounded-lg">
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
                            </SelectContent>
                          </Select>

                          <Button className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white shadow-lg rounded-lg px-4">
                            <Download className="w-4 h-4 mr-2" />
                            Xuất Excel
                          </Button>

                          <Button
                            onClick={() => handleEditAccount(null)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-lg px-4"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm TK
                          </Button>
                        </div>
                      </div>

                      {/* Optimized Table */}
                      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b-2 border-gray-100">
                              <TableHead className="w-[20%] py-3 px-4 font-semibold text-gray-700">Tài khoản</TableHead>
                              <TableHead
                                className="w-[12%] py-3 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
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
                              <TableHead className="w-[10%] py-3 px-3 font-semibold text-gray-700">Hạng</TableHead>
                              <TableHead
                                className="w-[10%] py-3 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
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
                                className="w-[10%] py-3 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleSort('expiryDate')}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Hết hạn</span>
                                  {accountSortBy === 'expiryDate' && (
                                    accountSortOrder === 'asc' ?
                                      <ChevronUp className="w-4 h-4" /> :
                                      <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead className="w-[8%] py-3 px-3 font-semibold text-gray-700">Trạng thái</TableHead>
                              <TableHead
                                className="w-[10%] py-3 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
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
                              <TableHead className="w-[8%] py-3 px-3 font-semibold text-gray-700">Giá mua</TableHead>
                              <TableHead className="w-[12%] text-right py-3 px-4 font-semibold text-gray-700">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedAccounts().accounts.map((account, index) => (
                              <TableRow
                                key={account.id}
                                className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 transition-all duration-200 border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                  }`}
                              >
                                <TableCell className="py-4 px-4">
                                  <div className="space-y-2">
                                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                      <div className="truncate">{account.accountEmail}</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCopyCredential(account.accountEmail)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Email
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCopyCredential(account.accountPassword)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Pass
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="font-semibold text-gray-800 text-sm truncate">{account.customerName}</div>
                                  <div className="text-xs text-gray-500 truncate">{account.customerEmail}</div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  {account.customerRank && (
                                    <div className="flex items-center space-x-1">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center ${account.customerRank.backgroundColor} shadow-sm`}
                                      >
                                        <account.customerRank.icon className="w-3 h-3 text-white" />
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-medium border px-1 py-0"
                                        style={{
                                          borderColor: account.customerRank.color,
                                          color: account.customerRank.color,
                                          backgroundColor: `${account.customerRank.color}15`
                                        }}
                                      >
                                        {account.customerRank.name}
                                      </Badge>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3 text-brand-blue flex-shrink-0" />
                                    <span className="text-xs font-medium">{formatDate(account.purchaseDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                    <span className="text-xs font-medium">{formatDate(account.expiryDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    {getAccountStatusIcon(account.status)}
                                    {getAccountStatusBadge(account.status)}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 py-0 font-medium border border-brand-purple/30 text-brand-purple bg-brand-purple/5"
                                  >
                                    {account.productType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    <span className="font-semibold text-green-700 text-xs">
                                      {account.purchasePrice.toLocaleString('vi-VN')}đ
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right py-4 px-4">
                                  <div className="flex items-center justify-end space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 h-7 px-2 transition-all duration-200 hover:scale-105"
                                      onClick={() => handleEditAccount(account)}
                                      title="Chỉnh sửa tài khoản"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Sửa
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-7 px-2 transition-all duration-200 hover:scale-105"
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

                      {/* Optimized Pagination */}
                      {getPaginatedAccounts().totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 px-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">
                              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, getPaginatedAccounts().totalItems)} của {getPaginatedAccounts().totalItems} tài khoản
                            </span>
                            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                              setItemsPerPage(Number(value));
                              setCurrentPage(1);
                            }}>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 / trang</SelectItem>
                                <SelectItem value="10">10 / trang</SelectItem>
                                <SelectItem value="20">20 / trang</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Trước
                            </Button>

                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(3, getPaginatedAccounts().totalPages) }, (_, i) => {
                                let pageNumber = currentPage <= 2 ? i + 1 : currentPage - 1 + i;
                                if (pageNumber > getPaginatedAccounts().totalPages) return null;

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
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-orange-50/30 to-green-50/30">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 via-green-500/10 to-blue-500/10 border-b-0 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                        Quản lý đơn hàng & Gửi tài khoản
                      </CardTitle>
                      <p className="text-gray-600 mt-2">Theo dõi đơn hàng và gửi thông tin tài khoản cho khách hàng</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleExportOrders} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất đơn hàng
                    </Button>
                    <Button onClick={handleExportDetailedOrders} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất chi tiết
                    </Button>
                    <Button onClick={() => setEditOrderDialog({ open: true, order: null })} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo đơn hàng
                    </Button>
                  </div>
                </div>

                {/* Enhanced Order & Send Account Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-8">
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Tổng đơn hàng</p>
                          <p className="text-2xl font-bold">{orders.length}</p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Hoàn thành</p>
                          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm">Chờ xử lý</p>
                          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Sẵn sàng gửi TK</p>
                          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</p>
                        </div>
                        <Send className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-100 text-sm">Đã chọn</p>
                          <p className="text-2xl font-bold">{selectedOrders.length}</p>
                        </div>
                        <UserPlus className="w-8 h-8 text-indigo-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">Doanh thu</p>
                          <p className="text-2xl font-bold">{Math.floor(orders.reduce((sum, o) => sum + o.total, 0) / 1000000)}M</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-red-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* Enhanced Search and Filter with Send Account Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="🔍 Tìm kiếm đơn hàng, khách hàng..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <Select value={orderFilterStatus} onValueChange={setOrderFilterStatus}>
                      <SelectTrigger className="w-40 border-2 border-gray-200 hover:border-orange-500 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={orderSortBy} onValueChange={(value: 'newest' | 'oldest' | 'highest' | 'lowest') => setOrderSortBy(value)}>
                      <SelectTrigger className="w-40 border-2 border-gray-200 hover:border-purple-500 transition-colors">
                        <SortDesc className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sắp xếp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                        <SelectItem value="highest">Giá cao nhất</SelectItem>
                        <SelectItem value="lowest">Giá thấp nhất</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" className="border-2 border-gray-200 hover:border-blue-500" onClick={() => loadDashboardData(true)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Làm mới
                    </Button>
                  </div>
                </div>

                {/* Send Account Bulk Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Send className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Gửi tài khoản hàng loạt:</span>
                    </div>
                    <Button
                      onClick={() => handleSelectAllOrders(selectedOrders.length === 0)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {selectedOrders.length === 0 ? 'Chọn tất cả đơn hoàn thành' : 'Bỏ chọn tất cả'}
                    </Button>

                    <Button
                      onClick={handleBulkSendAccounts}
                      disabled={selectedOrders.length === 0}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Gửi tài khoản ({selectedOrders.length})
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 ml-auto">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrders([])}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Xóa lựa chọn
                    </Button>
                    <div className="text-sm text-gray-600">
                      Đã chọn: <span className="font-semibold text-green-600">{selectedOrders.length}</span> /
                      <span className="font-semibold text-blue-600">{orders.filter(o => o.status === 'completed').length}</span> đơn hoàn thành
                    </div>
                  </div>
                </div>

                {/* Enhanced Orders Table with Send Account Features */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                      <TableRow>
                        <TableHead className="w-12 font-semibold">
                          <Checkbox
                            checked={selectedOrders.length > 0 && selectedOrders.length === orders.filter(o => o.status === 'completed').length}
                            onCheckedChange={handleSelectAllOrders}
                            className="border-2 border-gray-400"
                          />
                        </TableHead>
                        <TableHead className="font-semibold">Mã đơn hàng</TableHead>
                        <TableHead className="font-semibold">Khách hàng</TableHead>
                        <TableHead className="font-semibold">Sản phẩm</TableHead>
                        <TableHead className="font-semibold">Tổng tiền</TableHead>
                        <TableHead className="font-semibold">Thanh toán</TableHead>
                        <TableHead className="font-semibold">Ngày tạo</TableHead>
                        <TableHead className="font-semibold">Trạng thái</TableHead>
                        <TableHead className="font-semibold text-center">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-green-50/50 transition-all duration-200">
                          <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                              disabled={order.status !== 'completed'}
                              className={order.status === 'completed' ? 'border-2 border-green-400' : 'opacity-50'}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {order.id.slice(-2)}
                              </div>
                              <span className="font-medium">#{order.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{order.customerName || order.userEmail}</p>
                              <p className="text-sm text-gray-500">{order.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{order.products.length}</span>
                              <span className="text-gray-500">sản phẩm</span>
                              {order.products.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {order.products[0].name}
                                  {order.products.length > 1 && ` +${order.products.length - 1}`}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              {order.total.toLocaleString('vi-VN')}đ
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{order.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(order.status, 'order')}
                              {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOrderStatusChange(order.id, 'processing')}
                                  className="text-xs"
                                >
                                  Xử lý
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Xem chi tiết"
                                onClick={() => handleViewOrderDetail(order)}
                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all hover:scale-105"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {order.status === 'completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Gửi tài khoản ngay"
                                  onClick={() => handleSendAccountToCustomer(order)}
                                  className="text-green-600 hover:bg-green-50 hover:text-green-700 transition-all hover:scale-105 border border-green-200 hover:border-green-400"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOrderStatusChange(order.id, 'processing')}
                                  className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  Xử lý
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditOrderDialog({ open: true, order })}
                                title="Chỉnh sửa"
                                className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all hover:scale-105"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all hover:scale-105"
                                onClick={() => handleDeleteOrder(order)}
                                title="Xóa đơn hàng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <ShoppingCart className="w-12 h-12 text-gray-400" />
                              {orders.length === 0 ? (
                                <>
                                  <p className="text-gray-500 font-medium">Chưa có đơn hàng nào</p>
                                  <p className="text-sm text-gray-400">Đơn hàng sẽ xuất hiện ở đây khi có khách hàng đặt mua</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng nào</p>
                                  <p className="text-sm text-gray-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setOrderSearchTerm('');
                                      setOrderFilterStatus('all');
                                    }}
                                    className="mt-2"
                                  >
                                    Xóa bộ lọc
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Thao tác nhanh</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={handleCompleteAllPendingOrders}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Hoàn thành tất cả chờ xử lý ({orders.filter(o => o.status === 'pending').length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      onClick={handleSendNotificationEmail}
                      disabled={sendingNotifications}
                    >
                      {sendingNotifications ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-1" />
                          Gửi email thông báo
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      onClick={handleExportMonthlyReport}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Xuất báo cáo tháng này
                    </Button>
                  </div>
                </div>

                {/* Email Template Configuration Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                      Cấu hình mẫu email gửi tài khoản
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Email service active</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề email</label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full"
                          placeholder="Nhập tiêu đề email..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung email</label>
                        <Textarea
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          className="w-full min-h-[200px] font-mono text-sm"
                          placeholder="Nhập nội dung email..."
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={resetEmailTemplate} size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Khôi phục mẫu
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleTestEmail()}
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Test email
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <h5 className="font-medium text-gray-700 mb-3">Xem trước email</h5>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div><strong>Tiêu đề:</strong> {emailSubject}</div>
                        <div><strong>Nội dung:</strong></div>
                        <div className="bg-gray-50 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {emailMessage.substring(0, 300)}...
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-2">💡 Các biến có thể sử dụng:</p>
                        <div className="text-xs text-blue-600 space-y-1">
                          <div><code>{'{customerName}'}</code> - Tên khách hàng</div>
                          <div><code>{'{accountEmail}'}</code> - Email tài khoản</div>
                          <div><code>{'{accountPassword}'}</code> - Mật khẩu tài khoản</div>
                          <div><code>{'{accountLink}'}</code> - Link truy cập</div>
                          <div><code>{'{duration}'}</code> - Thời hạn sử dụng</div>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 font-medium mb-1">✅ Email service status:</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Connected & Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <DepositApprovals />
          </TabsContent>


        </Tabs>

        {/* Dialogs */}
        <AdminOrderDetailModal
          order={adminOrderDetailModal.order}
          isOpen={adminOrderDetailModal.open}
          onClose={handleCloseOrderDetailModal}
          onSave={handleSaveOrderFromModal}
          onStatusChange={handleOrderStatusChange}
        />

        <EditUserDialog
          user={
            editUserDialog.user
              ? { ...editUserDialog.user, status: editUserDialog.user.status as 'active' | 'inactive' | 'banned' }
              : null
          }
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
          title={`Xóa ${deleteDialog.type === 'user' ? 'người dùng' :
            deleteDialog.type === 'product' ? 'sản phẩm' :
              deleteDialog.type === 'order' ? 'đơn hàng' :
                'tài khoản khách hàng'
            }`}
          description={`Bạn có chắc chắn muốn xóa ${deleteDialog.type === 'user' ? 'người dùng' :
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

        {/* Send Account Modal */}
        <Dialog open={sendAccountModal.open} onOpenChange={(open) => setSendAccountModal({ ...sendAccountModal, open })}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">
                    {sendAccountModal.order ?
                      `Gửi tài khoản cho đơn hàng #${sendAccountModal.order.id}` :
                      `Gửi tài khoản hàng loạt (${selectedOrders.length} đơn hàng)`
                    }
                  </span>
                </div>
              </DialogTitle>
              <DialogDescription>
                {sendAccountModal.order ?
                  `Gửi thông tin tài khoản premium đến ${sendAccountModal.order.userEmail}` :
                  `Gửi thông tin tài khoản premium đến ${selectedOrders.length} khách hàng được chọn`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Information */}
              {sendAccountModal.order && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Thông tin khách hàng
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Tên: </span>
                        <span className="text-blue-900">{sendAccountModal.order.customerName || sendAccountModal.order.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Email: </span>
                        <span className="text-blue-900 font-mono">{sendAccountModal.order.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Sản phẩm: </span>
                        <span className="text-blue-900">{sendAccountModal.order.products.map(p => p.name).join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Giá trị: </span>
                        <span className="text-blue-900 font-semibold">{sendAccountModal.order.total.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bulk Send Information */}
              {!sendAccountModal.order && selectedOrders.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Đơn hàng được chọn ({selectedOrders.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-40 overflow-y-auto">
                      {orders.filter(o => selectedOrders.includes(o.id)).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">#{order.id}</span>
                            <div className="text-xs text-gray-600">{order.userEmail}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {order.products.length} sản phẩm
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Email Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề email
                    </label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Nhập tiêu đề email..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung email
                    </label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Nhập nội dung email..."
                      className="w-full min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem trước
                  </h5>

                  {sendAccountModal.order && (
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm"><strong>Đến:</strong> {sendAccountModal.order.userEmail}</div>
                        <div className="text-sm"><strong>Tiêu đề:</strong> {emailSubject}</div>
                      </div>

                      <div className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium mb-2">Nội dung email:</div>
                        <div className="text-xs font-mono bg-gray-50 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {formatEmailContent(sendAccountModal.order, generateAccountCredentials(sendAccountModal.order)).substring(0, 200)}...
                        </div>
                      </div>

                      <div className="bg-green-50 p-3 rounded border-green-200">
                        <div className="text-sm font-medium text-green-800 mb-2">Thông tin tài khoản sẽ gửi:</div>
                        <div className="text-xs space-y-1">
                          {(() => {
                            const credentials = generateAccountCredentials(sendAccountModal.order);
                            return (
                              <>
                                <div><strong>Email:</strong> {credentials.accountEmail}</div>
                                <div><strong>Mật khẩu:</strong> {credentials.accountPassword}</div>
                                <div><strong>Link:</strong> {credentials.accountLink}</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {!sendAccountModal.order && (
                    <div className="text-sm text-gray-600">
                      <p>Sẽ gửi email đến {selectedOrders.length} khách hàng với thông tin tài khoản tương ứng cho từng đơn hàng.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={resetEmailTemplate} size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Khôi phục mẫu
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSendAccountModal({ open: false, order: null })}
                  disabled={sendingEmails}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSendEmails}
                  disabled={sendingEmails || (!sendAccountModal.order && selectedOrders.length === 0)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  {sendingEmails ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi {sendAccountModal.order ? 'email' : `${selectedOrders.length} email`}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  );
}