"use client";

import { useState, useEffect, useRef } from 'react';
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
  Zap,
  Tag,
  Ticket,
  Award,
  Gift,
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
import { EditChatGPTDialog } from '@/components/admin/EditChatGPTDialog';
import { EditCodeDialog } from '@/components/admin/EditCodeDialog';
import { EditOnetimeCodeDialog } from '@/components/admin/EditOnetimeCodeDialog';
import { EditDiscountCodeDialog, type AdminDiscountCode } from '@/components/admin/EditDiscountCodeDialog';
import { EditOrderDialog } from '@/components/admin/EditOrderDialog';
import { EditCustomerAccountDialog } from '@/components/admin/EditCustomerAccountDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import AdminOrderDetailModal from '@/components/admin/AdminOrderDetailModal';
import { UserChatGPTDialog } from '@/components/admin/UserChatGPTDialog';
import DepositApprovals from '@/components/admin/DepositApprovals';
import { exportUsersToExcel, exportProductsToExcel, exportOrdersToExcel, exportDetailedOrdersToExcel } from '@/lib/excelExport';
import DataSyncHelper from '@/lib/syncHelper';
import { CustomerRank } from '@/types/RankingData.interface';
import { updateAdminUser, addAdminUser } from '@/lib/api'; // Import hàm updateUser
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
  Cell,
} from 'recharts';
import {
  CustomerRankDisplay,
} from '@/components/CustomerRankingSystem';
import { User } from '@/types/user.interface';
import {
  fetchAdminUsers,
  getProductsAdmin,
  deleteProduct,
  checkRole,
  fetchAdminOrdersData,
  fetchAdminRevenueByMonth,
  fetchAdminTopSellingProducts,
  fetchAdminTrafficStats,
  fetchAdminRevenueComparison,
  fetchDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  fetchCustomerVouchersAdmin,
  createCustomerVoucherAdmin,
  deleteCustomerVoucherAdmin,
  type AdminCustomerVoucherItem,
  fetchAdminRanks,
  fetchRankRewardVouchersAdmin,
  createRankRewardVoucherAdmin,
  updateRankRewardVoucherAdmin,
  deleteRankRewardVoucherAdmin,
  type AdminRankRewardVoucherItem,
  type AdminRankItem,
  fetchRewardsAdmin,
  createRewardAdmin,
  updateRewardAdmin,
  deleteRewardAdmin,
  type AdminRewardItem,
} from '@/lib/api';
import { Product } from '@/types/product.interface';
import { deleteOrder } from '@/lib/api';
import { sendOrderEmail, getOnetimecodes, getListAccounts, deleteAccount, sendCustomerAccountRenewalEmail, fetchAdminRenewalRequests, updateAdminRenewalRequest } from '@/lib/api';
import { Onetimecode, userOnetimecode } from '@/types/Onetimecode';
import * as XLSX from "xlsx";
import { CustomerAccount } from '@/types/CustomerAccount';
import { createAccount, updateAccount } from '@/lib/api';
import { updateOnetimecode, insertOnetimecode, deleteOnetimecode, updateMasterOnetimecode, createOnetimecode, getListChatgpts, deleteChatgpt, createChatgpt, updateChatgpt, getOnetimeCodeAdmin } from '@/lib/api'; // Import hàm updateUser
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ChatgptPayload } from '@/types/chatgpt.interface';
import { useMemo } from "react";
import { useDeferredValue } from "react";

import { Label } from "@radix-ui/react-label";

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
  customerPhone?: string;
  shippingAddress?: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  discount?: number;
  originalTotal?: number;
  /** Đơn gia hạn: ID tài khoản được gia hạn */
  renewalForAccountId?: number | null;
}


import { deleteAdminUser } from '@/lib/api'; // Import hàm xóa người dùng từ api.ts
import { copyFile } from 'fs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [chatgpts, setChatgpts] = useState<ChatgptPayload[]>([]);
  // filter states
  const [statusFilter, setStatusFilter] = useState<"all" | 0 | 1 | 2>("all");
  const [onlySmallTeam, setOnlySmallTeam] = useState(false);      // count_user <= 5
  const [onlyEndToday, setOnlyEndToday] = useState(false);        // end_date = hôm nay
  const [categoryFilter, setCategoryFilter] = useState<"all" | "Plus" | "Business">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<{ product_id: number; name: string; category_name: string; sales: number; rating: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>([]);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true); // để kiểm tra loading
  const [onetimecodes, setOnetimecodes] = useState<userOnetimecode[]>([]);
  const [discountCodes, setDiscountCodes] = useState<AdminDiscountCode[]>([]);
  const [editDiscountDialog, setEditDiscountDialog] = useState<{
    open: boolean;
    code: AdminDiscountCode | null;
  }>({
    open: false,
    code: null,
  });
  const [customerVouchers, setCustomerVouchers] = useState<AdminCustomerVoucherItem[]>([]);
  const [customerVoucherStatus, setCustomerVoucherStatus] = useState<string>('all');
  const [createVoucherOpen, setCreateVoucherOpen] = useState(false);
  const [rankRewardVouchers, setRankRewardVouchers] = useState<AdminRankRewardVoucherItem[]>([]);
  const [adminRanks, setAdminRanks] = useState<AdminRankItem[]>([]);
  const [rankRewardFilter, setRankRewardFilter] = useState<string>('');
  const [rankRewardDialogOpen, setRankRewardDialogOpen] = useState(false);
  const [editingRankRewardId, setEditingRankRewardId] = useState<number | null>(null);
  const [rankRewardForm, setRankRewardForm] = useState({
    rank_id: '',
    title: '',
    type: 'fixed' as 'fixed',
    value: 10000,
    min_amount: 0,
    max_discount: null as number | null,
    expiry_days: 30,
  });
  const [rewards, setRewards] = useState<AdminRewardItem[]>([]);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    icon_url: '',
    points_cost: 100,
    voucher_type: 'fixed' as 'fixed' | '',
    voucher_value: 10000,
    voucher_min_amount: 0,
    voucher_max_discount: null as number | null,
    voucher_expiry_days: 30,
  });
  const [createVoucherForm, setCreateVoucherForm] = useState({
    user_id: '',
    code: '',
    title: '',
    type: 'fixed' as 'fixed',
    value: 10000,
    min_amount: 0,
    max_discount: null as number | null,
    expires_at: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState<
    "all" | "smallTeam" | "endToday" | "smallTeamAndEndToday"
  >("all");
  const [code, setCode] = useState('');
  const [expiresIn, setExpiresIn] = useState(0); // seconds left
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  type OtpState = {
    code: string
    expiresIn: number
    status: boolean
    timer?: NodeJS.Timeout
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [otpMap, setOtpMap] = useState<Record<number, OtpState>>({});

  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [editCodeDialog, setEditCodeDialog] = useState<{ open: boolean; code: userOnetimecode | null }>({ open: false, code: null });
  const [editOnetimeCode, setEditOnetimeCodeDialog] = useState<{ open: boolean; code: Onetimecode | null }>({ open: false, code: null });
  const [editProductDialog, setEditProductDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [editChatGPTDialog, setEditChatGPTDialog] = useState<{ open: boolean; product: ChatgptPayload | null }>({ open: false, product: null });
  const [editUserChatGPTDialog, setUserChatGPTDialog] = useState<{ open: boolean; product: ChatgptPayload | null }>({ open: false, product: null });
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
  const [accountSortBy, setAccountSortBy] = useState<'purchaseDate' | 'expiryDate' | 'customerName' | 'productType' | 'expiryToday'>('purchaseDate');
  const [accountSortOrder, setAccountSortOrder] = useState<'asc' | 'desc'>('desc');

  const [accountGPTSearchTerm, setAccountGPTSearchTerm] = useState('');

  // Orders State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSortBy, setOrderSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Send Accounts State
  const [sendAccountModal, setSendAccountModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('🎉 Tài khoản {typeAccount} của bạn đã sẵn sàng!');
  const [emailMessage, setEmailMessage] = useState(`Xin chào {customerName},

Cảm ơn bạn đã tin tưởng và mua hàng tại QAI Store! 

Thông tin tài khoản:
📧 Email: {accountEmail}
🔑 Mật khẩu: {accountPassword}
🔐 Mã bảo mật: {securityCode}
🔗 Link truy cập: {accountLink}
⏰ Thời hạn sử dụng: {duration}

Hướng dẫn sử dụng:
{instructions}

Lưu ý quan trọng:
- Vui lòng không chia sẻ thông tin này cho người khác
- Hãy đăng nhập ngay để đảm bảo tài khoản hoạt động bình thường
- Nếu có vấn đề gì, hãy liên hệ với chúng tôi ngay

Cảm ơn bạn đã chọn QAI Store! 💙

---
QAI Store - Tài khoản premium uy tín #1
📞 Hotline/Zalo: 038.966.0305
📧 Email: qastore.cskh@gmail.com`);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { user, logout, role, sessionId, isLoading, setRole, setSessionId } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Data generation functions moved outside component to avoid errors
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<{ name: string; visitors: number; pageViews: number }[]>([]);
  const [trafficMetrics, setTrafficMetrics] = useState<{ todayVisitors: number; todayPageViews: number; completionRate: number }>({ todayVisitors: 0, todayPageViews: 0, completionRate: 0 });
  const [revenueComparisonData, setRevenueComparisonData] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChatgptPayload | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Thông tin tài khoản tuỳ chỉnh khi gửi cho khách
  const [accountEmailInput, setAccountEmailInput] = useState<string>('');
  const [accountPasswordInput, setAccountPasswordInput] = useState<string>('');
  const [securityCodeInput, setSecurityCodeInput] = useState<string>('');
  const [instructionsInput, setInstructionsInput] = useState<string>('');
  const [durationInput, setDurationInput] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<userOnetimecode | null>(null);

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

  const handleDeleteChatgpt = (item: ChatgptPayload) => {
    setSelectedItem(item);
    setConfirmOpen(true);
  };

  const confirmDeleteChatgpt = async () => {
    if (!selectedItem) return;
    if (!sessionId) {
      return;
    }

    setDeletingId(selectedItem.id);

    try {
      const res = await deleteChatgpt(sessionId, selectedItem.id);

      if (res?.success) {
        toast({
          title: `Xóa tài khoản`,
          description: `Xóa ${selectedItem.email} thành công.`,
        });
        setChatgpts((prev: ChatgptPayload[]) =>
          prev.filter((acc) => acc.id !== selectedItem.id)
        );
      } else {
        toast({
          title: `Xóa tài khoản`,
          description: `Lỗi không thể xóa ${selectedItem.email} lúc này.`,
        });
      }
    } catch (error) {
      toast({
        title: `Xóa tài khoản`,
        description: `Có lỗi xảy ra trong quá trình xóa.`,
      });
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setSelectedItem(null);
    }
  };



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


    // Khi BE/Realtime phát sự kiện hoàn tất đơn
    const unsubscribeOrderCompletion = DataSyncHelper.subscribeToOrderCompletion(async (_orderData) => {
      try {
        await loadOrders();
      } catch (error) {
      }

      // Reload accounts nếu cần
      const syncedAccounts = await DataSyncHelper.loadAdminData('accounts', true);
      if (syncedAccounts.length > 0) {
        const accountsWithDates = syncedAccounts.map((account: any) => ({
          ...account,
          purchaseDate: new Date(account.purchaseDate),
          expiryDate: new Date(account.expiryDate),
        }));
        setCustomerAccounts(accountsWithDates);
      }
    });

    // Sự kiện hoàn tất đơn dành riêng admin (customEvent)
    const handleAdminOrderCompleted = async (event: Event) => {
      const customEvent = event as CustomEvent;

      const { orderId, orderData } = customEvent.detail;

      if (orderData) {
        setOrders((prev) => {
          const updated = prev.map((o) =>
            o.id === orderId ? { ...o, ...orderData, status: 'completed' } : o
          );
          if (!updated.find((o) => o.id === orderId)) {
            updated.unshift(orderData);
          }
          return updated;
        });
      }

      // Chờ 1 nhịp rồi reload từ BE cho chắc
      setTimeout(() => {
        loadOrders();
      }, 1000);
    };

    window.addEventListener('admin-order-completed', handleAdminOrderCompleted);

    // Subscribe to global order sync events
    const unsubscribeGlobalSync = DataSyncHelper.subscribeToGlobalOrderSync((eventData) => {

      if (eventData.type === 'completion') {
        // Force refresh all order-related data
        setTimeout(() => {
          loadDashboardData();
        }, 1000);
      }
    });

    return () => {
      // unsubscribe();
      unsubscribeOrderCompletion();
      unsubscribeGlobalSync();
      window.removeEventListener('admin-order-completed', handleAdminOrderCompleted);
    };
  }, []);

  const loadDashboardData = async (forceAPI = false) => {

    try {
      if (sessionId) {
        await loadUser();
        await loadProducts();
        await loadOnetimecode();
        await loadOrders();
        await loadChatGPTS();
        await loadDiscountCodes();
        // Doanh thu 6 tháng gần đây từ database
        try {
          const revRes = await fetchAdminRevenueByMonth(sessionId, 6);
          if (revRes?.data?.length) {
            setAnalyticsData(revRes.data.map((d: { month_label: string; revenue: number }) => ({
              name: d.month_label,
              revenue: d.revenue,
            })));
          } else {
            setAnalyticsData([]);
          }
        } catch (_e) {
          setAnalyticsData([]);
        }
        try {
          const topRes = await fetchAdminTopSellingProducts(sessionId, 5);
          setTopSellingProducts(topRes?.data ?? []);
        } catch (_e) {
          setTopSellingProducts([]);
        }
        try {
          const revCompRes = await fetchAdminRevenueComparison(sessionId);
          setRevenueComparisonData(revCompRes?.data ?? []);
        } catch (_e) {
          setRevenueComparisonData([]);
        }
        try {
          const trafficRes = await fetchAdminTrafficStats(sessionId, 7);
          const d = trafficRes?.data;
          if (d?.by_day?.length) {
            setTrafficData(d.by_day.map((day: { day_label: string; visitors: number; page_views: number }) => ({
              name: day.day_label,
              visitors: day.visitors,
              pageViews: day.page_views,
            })));
          } else {
            setTrafficData([]);
          }
          setTrafficMetrics({
            todayVisitors: d?.today_visitors ?? 0,
            todayPageViews: d?.today_page_views ?? 0,
            completionRate: d?.completion_rate ?? 0,
          });
        } catch (_e) {
          setTrafficData([]);
          setTrafficMetrics({ todayVisitors: 0, todayPageViews: 0, completionRate: 0 });
        }
      }


    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  };

  const loadDiscountCodes = async () => {
    if (!sessionId) return;
    try {
      const res = await fetchDiscountCodes(sessionId, 1, 50);
      setDiscountCodes(res.data ?? []);
    } catch (error) {
      console.error("Failed to load discount codes", error);
    }
  };

  const handleOpenCreateDiscount = () => {
    setEditDiscountDialog({ open: true, code: null });
  };

  const handleOpenEditDiscount = (code: AdminDiscountCode) => {
    setEditDiscountDialog({ open: true, code });
  };

  const handleSaveDiscount = async (payload: AdminDiscountCode) => {
    if (!sessionId) return;
    try {
      if (payload.id) {
        await updateDiscountCode(sessionId, payload.id, payload);
        toast({
          title: "Cập nhật mã giảm giá thành công",
          description: `Đã cập nhật mã ${payload.code}`,
        });
      } else {
        await createDiscountCode(sessionId, payload);
        toast({
          title: "Tạo mã giảm giá thành công",
          description: `Đã tạo mã ${payload.code}`,
        });
      }
      await loadDiscountCodes();
    } catch (error: any) {
      console.error("Failed to save discount code", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể lưu mã giảm giá",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteDiscount = async (code: AdminDiscountCode) => {
    if (!sessionId) return;
    if (!window.confirm(`Bạn chắc chắn muốn xoá mã ${code.code}?`)) return;
    try {
      await deleteDiscountCode(sessionId, code.id!);
      toast({
        title: "Đã xoá mã giảm giá",
        description: `Mã ${code.code} đã được xoá`,
      });
      await loadDiscountCodes();
    } catch (error: any) {
      console.error("Failed to delete discount code", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể xoá mã giảm giá",
        variant: "destructive",
      });
    }
  };

  const loadCustomerVouchers = async () => {
    if (!sessionId) return;
    try {
      const res = await fetchCustomerVouchersAdmin(sessionId, { per_page: 100, status: customerVoucherStatus || undefined });
      setCustomerVouchers(res.data ?? []);
    } catch (e) {
      console.error("Failed to load customer vouchers", e);
      toast({ title: "Lỗi", description: "Không tải được kho voucher", variant: "destructive" });
    }
  };

  const handleCreateCustomerVoucher = async () => {
    if (!sessionId || !createVoucherForm.user_id || !createVoucherForm.code.trim()) {
      toast({ title: "Lỗi", description: "Chọn khách hàng và nhập mã voucher", variant: "destructive" });
      return;
    }
    try {
      await createCustomerVoucherAdmin(sessionId, {
        user_id: createVoucherForm.user_id,
        code: createVoucherForm.code.trim().toUpperCase(),
        title: createVoucherForm.title.trim() || undefined,
        type: createVoucherForm.type,
        value: createVoucherForm.value,
        min_amount: createVoucherForm.min_amount || undefined,
        max_discount: createVoucherForm.max_discount ?? undefined,
        expires_at: createVoucherForm.expires_at || undefined,
      });
      toast({ title: "Đã tạo voucher", description: `Mã ${createVoucherForm.code} đã cấp cho khách.` });
      setCreateVoucherOpen(false);
      setCreateVoucherForm({ user_id: '', code: '', title: '', type: 'fixed', value: 10000, min_amount: 0, max_discount: null, expires_at: '' });
      await loadCustomerVouchers();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể tạo voucher", variant: "destructive" });
    }
  };

  const handleDeleteCustomerVoucher = async (v: AdminCustomerVoucherItem) => {
    if (!sessionId) return;
    if (v.is_used) {
      toast({ title: "Không thể xóa", description: "Voucher đã sử dụng không thể xóa.", variant: "destructive" });
      return;
    }
    if (!window.confirm(`Xóa voucher ${v.code} của khách?`)) return;
    try {
      await deleteCustomerVoucherAdmin(sessionId, v.id);
      toast({ title: "Đã xóa voucher" });
      await loadCustomerVouchers();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể xóa", variant: "destructive" });
    }
  };

  const loadAdminRanks = async () => {
    if (!sessionId) return;
    try {
      const res = await fetchAdminRanks(sessionId);
      setAdminRanks(res.data ?? []);
    } catch {
      setAdminRanks([]);
    }
  };
  const loadRankRewardVouchers = async () => {
    if (!sessionId) return;
    try {
      const res = await fetchRankRewardVouchersAdmin(sessionId, rankRewardFilter ? { rank_id: rankRewardFilter } : undefined);
      setRankRewardVouchers(res.data ?? []);
    } catch {
      setRankRewardVouchers([]);
    }
  };
  const handleSaveRankReward = async () => {
    if (!sessionId || !rankRewardForm.rank_id || rankRewardForm.value < 1) {
      toast({ title: "Lỗi", description: "Chọn hạng và nhập giá trị.", variant: "destructive" });
      return;
    }
    try {
      if (editingRankRewardId) {
        await updateRankRewardVoucherAdmin(sessionId, editingRankRewardId, {
          rank_id: rankRewardForm.rank_id,
          title: rankRewardForm.title || undefined,
          type: rankRewardForm.type,
          value: rankRewardForm.value,
          min_amount: rankRewardForm.min_amount,
          max_discount: rankRewardForm.max_discount,
          expiry_days: rankRewardForm.expiry_days,
        });
        toast({ title: "Đã cập nhật phần thưởng hạng" });
      } else {
        await createRankRewardVoucherAdmin(sessionId, {
          rank_id: rankRewardForm.rank_id,
          title: rankRewardForm.title || undefined,
          type: rankRewardForm.type,
          value: rankRewardForm.value,
          min_amount: rankRewardForm.min_amount,
          max_discount: rankRewardForm.max_discount ?? undefined,
          expiry_days: rankRewardForm.expiry_days,
        });
        toast({ title: "Đã thêm phần thưởng hạng" });
      }
      setRankRewardDialogOpen(false);
      setEditingRankRewardId(null);
      setRankRewardForm({ rank_id: '', title: '', type: 'fixed', value: 10000, min_amount: 0, max_discount: null, expiry_days: 30 });
      await loadRankRewardVouchers();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể lưu", variant: "destructive" });
    }
  };
  const handleDeleteRankReward = async (r: AdminRankRewardVoucherItem) => {
    if (!sessionId) return;
    try {
      await deleteRankRewardVoucherAdmin(sessionId, r.id);
      toast({ title: "Đã xóa phần thưởng" });
      await loadRankRewardVouchers();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể xóa", variant: "destructive" });
    }
  };

  const loadRewards = async () => {
    if (!sessionId) return;
    try {
      const res = await fetchRewardsAdmin(sessionId);
      setRewards(res.data ?? []);
    } catch {
      setRewards([]);
    }
  };
  const handleSaveReward = async () => {
    if (!sessionId || !rewardForm.name.trim() || rewardForm.points_cost < 1) {
      toast({ title: "Lỗi", description: "Nhập tên và điểm đổi.", variant: "destructive" });
      return;
    }
    const type = rewardForm.voucher_type || 'fixed';
    const value = rewardForm.voucher_value ?? 0;
    if (value < 1) {
      toast({ title: "Lỗi", description: "Nhập Giá trị voucher (số tiền giảm, VD: 10000) để khách đổi được đúng voucher.", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        name: rewardForm.name.trim(),
        description: rewardForm.description.trim() || undefined,
        icon_url: rewardForm.icon_url.trim() || undefined,
        points_cost: rewardForm.points_cost,
        voucher_type: type,
        voucher_value: value,
        voucher_min_amount: rewardForm.voucher_min_amount,
        voucher_max_discount: rewardForm.voucher_max_discount ?? undefined,
        voucher_expiry_days: rewardForm.voucher_expiry_days,
      };
      if (editingRewardId) {
        await updateRewardAdmin(sessionId, editingRewardId, payload);
        toast({ title: "Đã cập nhật phần thưởng đổi điểm" });
      } else {
        await createRewardAdmin(sessionId, payload);
        toast({ title: "Đã thêm phần thưởng đổi điểm" });
      }
      setRewardDialogOpen(false);
      setEditingRewardId(null);
      setRewardForm({ name: '', description: '', icon_url: '', points_cost: 100, voucher_type: 'fixed', voucher_value: 10000, voucher_min_amount: 0, voucher_max_discount: null, voucher_expiry_days: 30 });
      await loadRewards();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể lưu", variant: "destructive" });
    }
  };
  const handleDeleteReward = async (r: AdminRewardItem) => {
    if (!sessionId) return;
    try {
      await deleteRewardAdmin(sessionId, r.id);
      toast({ title: "Đã xóa phần thưởng" });
      await loadRewards();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể xóa", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (activeTab === 'customer-vouchers' && sessionId) loadCustomerVouchers();
    if (activeTab === 'rank-rewards' && sessionId) {
      loadAdminRanks();
      loadRankRewardVouchers();
    }
    if (activeTab === 'exchange-rewards' && sessionId) loadRewards();
  }, [activeTab, sessionId]);

  useEffect(() => {
    if (activeTab === 'rank-rewards' && sessionId) loadRankRewardVouchers();
  }, [rankRewardFilter]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const [currentPageUser, setCurrentPageUser] = useState(1);
  const [perPageUser] = useState(10);
  const [metaUser, setMetaUser] = useState<any>(null);
  useEffect(() => {
    loadUser();
  }, [sessionId, currentPageUser]);

  const loadUser = async () => {
    if (!sessionId) return;

    const res = await fetchAdminUsers(sessionId, currentPageUser, perPageUser);

    const usersWithStats = (res.data ?? []).map((user: any) => ({
      ...user,
      status: user.status || "active",
      totalOrders: user.total_orders,
      totalSpent: user.total_spent,
      coins: user.coins,
      joinDate: user.join_date,
    }));

    setUsers(usersWithStats);
    setMetaUser(res.meta);

    // sync/clamp page (tránh dư trang rỗng)
    if (res.meta?.current_page && res.meta.current_page !== currentPageUser) {
      setCurrentPageUser(res.meta.current_page);
    }
  };
  const totalUser = metaUser?.total ?? 0;
  const perPageMetaUser = metaUser?.per_page ?? perPageUser;
  const currentPageMetaUser = metaUser?.current_page ?? currentPageUser;
  const totalPagesUser = metaUser?.last_page ?? 1;

  const fromUser =
    totalUser === 0 ? 0 : (currentPageMetaUser - 1) * perPageMetaUser + 1;

  const toUser = Math.min(currentPageMetaUser * perPageMetaUser, totalUser);

  //=======================================================
  const [currentPageOnetimecode, setCurrentPageOnetimecode] = useState(1);
  const [perPageOnetimecode] = useState(10);
  const [metaOnetimecode, setMetaOnetimecode] = useState<any>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [loadingOnetimecode, setLoadingOnetimecode] = useState(false);
  const [errorOnetimecode, setErrorOnetimecode] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    loadOnetimecode();
  }, [sessionId, currentPageOnetimecode, perPageOnetimecode, debouncedSearch]);

  useEffect(() => {
    setCurrentPageOnetimecode(1);
  }, [searchTerm]);

  const loadOnetimecode = async () => {
    if (!sessionId) return;

    const res = await getOnetimecodes(
      sessionId,
      currentPageOnetimecode,
      perPageOnetimecode,
      debouncedSearch
    );

    // backend trả { data: [...], meta: {...} }
    setOnetimecodes(res.data ?? []);
    setMetaOnetimecode(res.meta ?? null);

    // ✅ đồng bộ page nếu backend clamp
    const serverPage = res.meta?.current_page;
    if (serverPage && serverPage !== currentPageOnetimecode) {
      setCurrentPageOnetimecode(serverPage);
    }
  };


  const totalOnetimecode = metaOnetimecode?.total ?? 0;
  const perPageMetaOnetimecode = metaOnetimecode?.per_page ?? perPageOnetimecode;
  const currentPageMetaOnetimecode = metaOnetimecode?.current_page ?? currentPageOnetimecode;

  const fromOnetimecode =
    totalOnetimecode === 0 ? 0 : (currentPageMetaOnetimecode - 1) * perPageMetaOnetimecode + 1;

  const toOnetimecode = Math.min(currentPageMetaOnetimecode * perPageMetaOnetimecode, totalOnetimecode);

  const totalPageOnetimecode = metaOnetimecode?.last_page ?? 1;

  const showPagination = totalPageOnetimecode > 1;

  //=======================================================
  const [ordersMeta, setOrdersMeta] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  const [orderStats, setOrderStats] = useState({
    totalRevenue: 0,
    totalProcessing: 0,
    totalOrders: 0,
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadOrders = async () => {
    if (!sessionId) return;

    setLoadingOrders(true);
    try {
      const res = await fetchAdminOrdersData(sessionId, {
        includeProducts: true,
        sort_by: "created_at",
        sort_dir: "desc",
        page,
        per_page: perPage,

        // nếu bạn có filter/search:
        // status: orderFilterStatus !== "all" ? orderFilterStatus : undefined,
        // q: orderSearchTerm?.trim() || undefined,
        // date_from: dateFrom || undefined,
        // date_to: dateTo || undefined,
      });

      setOrders(res.data || []);
      setOrdersMeta(res.meta || { page, perPage, total: 0, lastPage: 1 });

      // ✅ NEW: statistics từ backend
      setOrderStats({
        totalRevenue: Number(res.statistics?.totalRevenue || 0),
        totalProcessing: Number(res.statistics?.totalProcessing || 0),
        totalOrders: Number(res.statistics?.totalOrders || 0),
      });
    } finally {
      setLoadingOrders(false);
    }
  };


  const totalOrder = ordersMeta.total;
  const fromOrder = totalOrder === 0 ? 0 : (ordersMeta.page - 1) * ordersMeta.perPage + 1;
  const toOrder = totalOrder === 0 ? 0 : (ordersMeta.page - 1) * ordersMeta.perPage + orders.length;


  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, page, perPage /*, orderFilterStatus, orderSearchTerm, sort... */]);

  // Khi chuyển sang tab Đơn hàng: luôn tải lại danh sách để hiển thị đơn mới
  useEffect(() => {
    if (activeTab === 'orders' && sessionId) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Tự động làm mới danh sách đơn hàng mỗi 30s khi đang xem tab Đơn hàng (để thấy đơn khách vừa tạo)
  useEffect(() => {
    if (activeTab !== 'orders' || !sessionId) return;
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sessionId]);

  const loadProducts = async () => {
    if (sessionId) {
      const data = await getProductsAdmin(sessionId);
      setProducts(data);
    }
  }

  ///===============================

  const [currentPageChatgpt, setCurrentPageChatgpt] = useState(1);
  const [perPageChatgpt] = useState(10);
  const [metaChatgpt, setMetaChatgpt] = useState<any>(null);

  // filters của bạn (ví dụ)
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | number | undefined>(undefined);

  const [debouncedAccountGPT, setDebouncedAccountGPT] = useState(accountGPTSearchTerm);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAccountGPT(accountGPTSearchTerm), 300);
    return () => clearTimeout(t);
  }, [accountGPTSearchTerm]);

  useEffect(() => {
    setCurrentPageChatgpt(1);
  }, [debouncedAccountGPT, category, status]);

  useEffect(() => {
    loadChatGPTS();
  }, [sessionId, currentPageChatgpt, perPageChatgpt, category, status, debouncedAccountGPT]);

  const loadChatGPTS = async () => {
    if (!sessionId) return;

    try {
      const res = await getListChatgpts(sessionId, {
        page: currentPageChatgpt,
        per_page: perPageChatgpt,
        category,
        status,
        q: debouncedAccountGPT, // ✅
      });

      setChatgpts(res.data ?? []);
      setMetaChatgpt(res.meta ?? null);

      const serverPage = res.meta?.current_page;
      if (serverPage && serverPage !== currentPageChatgpt) {
        setCurrentPageChatgpt(serverPage);
      }
    } catch (error) {
      console.error("Failed to load chatgpts:", error);
      setChatgpts([]);
      setMetaChatgpt(null);
    }
  };

  const totalChatgpt = metaChatgpt?.total ?? 0;
  const perPageMetaChatgpt = metaChatgpt?.per_page ?? perPageChatgpt;
  const currentPageMetaChatgpt = metaChatgpt?.current_page ?? currentPageChatgpt;
  const totalPageChatgpt = metaChatgpt?.last_page ?? 1;

  const fromChatgpt =
    totalChatgpt === 0 ? 0 : (currentPageMetaChatgpt - 1) * perPageMetaChatgpt + 1;

  const toChatgpt = Math.min(currentPageMetaChatgpt * perPageMetaChatgpt, totalChatgpt);

  const showPaginationChatgpt = totalPageChatgpt > 1;

  //================================

  const normalize = (s?: string) => (s ?? "").trim().toLowerCase();


  const deferredSearch = useDeferredValue(accountGPTSearchTerm);

  const filteredChatgpts = useMemo(() => {
    const TODAY = new Date().toLocaleDateString("en-CA");

    const today = TODAY; // xem phần dưới
    const q = deferredSearch.trim().toLowerCase();

    return chatgpts.filter((item) => {
      if (q && !item.email?.toLowerCase().includes(q)) return false;

      if (advancedFilter === "smallTeam" && item.count_user >= 5) return false;

      if (advancedFilter === "endToday") {
        if (item.end_date?.slice(0, 10) !== today) return false;
      }

      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      return true;
    });
  }, [chatgpts, advancedFilter, statusFilter, categoryFilter, deferredSearch]);


  const [accounts, setAccounts] = useState<any[]>([]);
  const [metaAccounts, setMetaAccounts] = useState<any>(null);
  const [currentPageAccounts, setCurrentPageAccounts] = useState(1);
  const [perPageAccounts] = useState(10);
  const [debouncedAccountSearch, setDebouncedAccountSearch] = useState(accountSearchTerm);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAccountSearch(accountSearchTerm), 300);
    return () => clearTimeout(t);
  }, [accountSearchTerm]);

  // reset page khi đổi search/filter/sort
  useEffect(() => {
    setCurrentPageAccounts(1);
  }, [debouncedAccountSearch, accountFilterType, accountSortBy, accountSortOrder]);

  useEffect(() => {
    if (!sessionId) return;

    loadCustomerAccounts(sessionId)
  }, [sessionId, currentPageAccounts, perPageAccounts, debouncedAccountSearch, accountFilterType, accountSortBy, accountSortOrder]);

  const loadCustomerAccounts = async (sessionId: string) => {
    try {
      const res = await getListAccounts(sessionId, {
        page: currentPageAccounts,
        per_page: perPageAccounts,
        q: debouncedAccountSearch,
        product_type: accountFilterType,
        sort_by: accountSortBy,
        sort_order: accountSortOrder,
      });

      setAccounts(res.data ?? []);
      setMetaAccounts(res.meta ?? null);
    } catch (error) {
      console.error('❌ Error loading customer accounts from Laravel API:', error);
      setAccounts([]);
      setMetaAccounts(null);
    }
  };

  const totalItems = metaAccounts?.total ?? 0;

  const totalPagesAccounts = metaAccounts?.last_page ?? 1;

  // 🔹 derived values (KHÔNG trùng state)
  const currentPageMetaAccounts =
    metaAccounts?.current_page ?? currentPageAccounts;

  const perPageMetaAccounts =
    metaAccounts?.per_page ?? perPageAccounts;

  const fromAccounts =
    totalItems === 0
      ? 0
      : (currentPageMetaAccounts - 1) * perPageMetaAccounts + 1;

  const toAccounts = Math.min(
    currentPageMetaAccounts * perPageMetaAccounts,
    totalItems
  );

  // Đơn yêu cầu gia hạn tài khoản (admin)
  const [renewalRequests, setRenewalRequests] = useState<any[]>([]);
  const [renewalMeta, setRenewalMeta] = useState<any>(null);
  const [renewalStatusFilter, setRenewalStatusFilter] = useState<string>('pending');
  const [renewalUpdatingId, setRenewalUpdatingId] = useState<number | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    fetchAdminRenewalRequests(sessionId, { per_page: 50, status: renewalStatusFilter })
      .then((res) => {
        setRenewalRequests(res.data ?? []);
        setRenewalMeta(res.meta ?? null);
      })
      .catch(() => setRenewalRequests([]));
  }, [sessionId, renewalStatusFilter]);

  const handleRenewalRequestUpdate = async (id: number, status: 'approved' | 'rejected', adminNote?: string) => {
    if (!sessionId) return;
    setRenewalUpdatingId(id);
    try {
      await updateAdminRenewalRequest(sessionId, id, { status, admin_note: adminNote });
      setRenewalRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } finally {
      setRenewalUpdatingId(null);
    }
  };

  const statusStyles: Record<number, string> = {
    0: "bg-red-500 text-white",
    1: "bg-blue-500 text-white",
    2: "bg-yellow-500 text-white",
  };

  const getStatusColorChatGPT = (status: number) => {
    let label = "";
    let color = "";

    switch (status) {
      case 0:
        label = "Hết hạn";
        color = "bg-red-500";
        break;
      case 1:
        label = "Hoạt động";
        color = "bg-green-500";
        break;
      case 2:
        label = "Gia hạn";
        color = "bg-yellow-500 text-black"; // vàng nên dùng text đen
        break;
      default:
        label = "Không xác định";
        color = "bg-gray-400";
        break;
    }
  }

  const getStatusBadgeChatGPT = (
    status: number | boolean,
    type?: "product" | "chatgpt"
  ) => {
    const s = Number(status);

    switch (s) {
      case 1:
        return "Hoạt động";
      case 0:
        return "Tạm dừng";
      case 2:
        return "Gia hạn";
      default:
        return "Không xác định";
    }
  };

  const getStatusBadge = (status: string, type: 'user' | 'product' | 'order') => {
    const variants: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-gray-800',
      banned: 'bg-red-300 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const orderStatusLabels: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };

    const label = type === 'order' ? (orderStatusLabels[status] ?? status) : status;

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {label}
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

  // 📥 Xử lý nhập Excel

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const file = e.target.files?.[0];
    // if (!file) return;

    // setIsImporting(true);
    // const reader = new FileReader();

    // reader.onload = (evt) => {
    //   const data = evt.target?.result;
    //   const workbook = XLSX.read(data, { type: "binary" });
    //   const sheetName = workbook.SheetNames[0];
    //   const sheet = workbook.Sheets[sheetName];

    //   // ✅ Đọc từng dòng thô (để tránh lỗi dấu tiếng Việt hoặc khoảng trắng)
    //   const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    //   if (rows.length < 2) {
    //     alert("❌ Không có dữ liệu trong file Excel");
    //     setIsImporting(false);
    //     return;
    //   }

    //   // Lấy tiêu đề và loại bỏ khoảng trắng dư thừa
    //   const headers = rows[0].map((h: string) => h.trim().replace(/\s+/g, " "));
    //   const dataRows = rows.slice(1);

    //   // Tạo JSON đúng key
    //   const jsonData = dataRows.map((row) => {
    //     const obj: Record<string, any> = {};
    //     headers.forEach((key, i) => {
    //       obj[key] = row[i] ?? "";
    //     });
    //     return obj;
    //   });

    //   console.log("📄 Dữ liệu thô đọc được:", jsonData);

    //   // 🧠 Hàm parse ngày hỗ trợ cả dạng text (25/9) lẫn số serial
    //   const parseDate = (value: any): Date => {
    //     if (!value) return new Date();
    //     if (typeof value === "number") {
    //       const d = XLSX.SSF.parse_date_code(value);
    //       return new Date(d.y, d.m - 1, d.d);
    //     }
    //     if (typeof value === "string") {
    //       const [day, month, year] = value.split(/[\/\-\.]/).map(Number);
    //       return new Date(year || 2024, (month || 1) - 1, day || 1);
    //     }
    //     return new Date();
    //   };

    //   // ✅ Map đúng cấu trúc CustomerAccount
    //   const parsedAccounts: CustomerAccount[] = jsonData.map((row) => {
    //     const rawStatus = (row["Trạng Thái"] || "").toString().trim().toLowerCase();
    //     const rawProductType = (row["Loại"] || "Khác").toString().trim();

    //     const status: "active" | "expired" | "suspended" =
    //       rawStatus === "hết hạn"
    //         ? "expired"
    //         : rawStatus === "tạm khóa"
    //           ? "suspended"
    //           : "active";

    //     return {
    //       id: crypto.randomUUID(),
    //       accountEmail: row["Tài khoản"] || "",
    //       accountPassword: row["Password"] || "",
    //       customerName: "",
    //       customerEmail: "",
    //       customerPhone: "",
    //       productType: rawProductType,
    //       productIcon: "💼",
    //       productColor: "#4F46E5",
    //       purchaseDate: parseDate(row["Ngày mua"]),
    //       expiryDate: parseDate(row["Hết hạn"]),
    //       status,
    //       link: "",
    //       orderId: "",
    //       duration: "1 tháng",
    //       purchasePrice: 0,
    //       totalSpent: 0,
    //       totalOrders: 0,
    //       customerRank: undefined,
    //     };
    //   });

    //   console.log("✅ Dữ liệu sau khi map:", parsedAccounts);

    //   setCustomerAccounts(parsedAccounts);
    //   setIsImporting(false);
    // };

    // reader.readAsBinaryString(file);
  };


  // CRUD Operations
  const handleEditUser = async (user: User | null) => {
    setEditUserDialog({ open: true, user });

  };

  const handleSaveUser = async () => {
    await loadUser();
  };

  const handleDeleteCode = async () => {
    if (!sessionId || !deleteTarget) return;

    try {
      await deleteOnetimecode(deleteTarget.id, sessionId);
      setOnetimecodes(prev => prev.filter(item => item.id !== deleteTarget.id));

      toast({
        title: "Đã xoá",
        description: `Đã xoá khách hàng ${deleteTarget.name || deleteTarget.email}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message || "Không thể xoá.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };


  // CRUD Operations
  const handleEditCode = (code: userOnetimecode | null) => {
    setEditCodeDialog({ open: true, code });
  };


  const handleSaveCode = async (codeData: userOnetimecode) => {
    try {

      // Nếu có ID → update
      if (editCodeDialog.code && editCodeDialog.code.id !== 0) {
        const result = await updateOnetimecode(sessionId!, codeData);

        setOnetimecodes(prev =>
          prev.map(item => (item.id === result.data.id ? result.data : item))
        );

        toast({
          title: "Cập nhật thành công",
          description: `Email ${result.data.email} đã được cập nhật.`,
        });
      }

      // Nếu id = 0 => Thêm mới
      else {
        const result = await insertOnetimecode(sessionId!, codeData);

        setOnetimecodes(prev => [...prev, result.data]);

        toast({
          title: "Tạo mới thành công",
          description: `Email ${result.data.email} đã được thêm.`,
        });
      }

      // Tắt dialog sau khi thành công
      setEditCodeDialog({ open: false, code: null });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message || "Không thể lưu dữ liệu.",
      });
    }
  };

  const defaultCode: Onetimecode = {
    id: 1,
    email: '',
    secret: ''
  };

  // CRUD Operations
  const handleOnetimeCode = (code: Onetimecode | null) => {
    setEditOnetimeCodeDialog({ open: true, code });
  };

  const handleSaveOnetimeCode = async (codeData: Onetimecode) => {
    try {

      // Nếu có ID → update
      if (editOnetimeCode.code && editOnetimeCode.code.id !== 0) {
        const result = await updateMasterOnetimecode(sessionId!, codeData);

        setOnetimecodes(prev =>
          prev.map(item => (item.email === result.data.email ? result.data : item))
        );

        toast({
          title: "Cập nhật thành công",
          description: `Email ${result.data.email} đã được cập nhật.`,
        });
      }

      // Nếu id = 0 => Thêm mới
      else {
        const result = await createOnetimecode(sessionId!, codeData);

        setOnetimecodes(prev => [...prev, result.data]);

        toast({
          title: "Tạo mới thành công",
          description: `Email ${result.data.email} đã được thêm.`,
        });
      }

      // Tắt dialog sau khi thành công
      setEditCodeDialog({ open: false, code: null });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message || "Không thể lưu dữ liệu.",
      });
    }
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


  const handleOnetimeCodeAdmin = async (id: number) => {
    if (!sessionId) return;

    // Nếu dòng này đang countdown thì chặn
    if (otpMap[id]?.expiresIn > 0) {
      toast({
        title: "⏳ Vui lòng đợi",
        description: `Bạn phải đợi ${otpMap[id].expiresIn} giây nữa để lấy mã mới.`,
      });
      return;
    }

    try {
      const result = await getOnetimeCodeAdmin(id, sessionId);

      if (result.status) {
        // Clear timer cũ nếu có
        if (otpMap[id]?.timer) {
          clearInterval(otpMap[id].timer);
        }

        const timer = setInterval(() => {
          setOtpMap(prev => {
            const current = prev[id];
            if (!current) return prev;

            if (current.expiresIn <= 1) {
              clearInterval(current.timer);
              const clone = { ...prev };
              delete clone[id];
              return clone;
            }

            return {
              ...prev,
              [id]: {
                ...current,
                expiresIn: current.expiresIn - 1,
              },
            };
          });
        }, 1000);

        // Set state cho đúng dòng
        setOtpMap(prev => ({
          ...prev,
          [id]: {
            code: result.otp,
            expiresIn: result.expires_in,
            status: true,
            timer,
          },
        }));
      } else {
        toast({
          title: "⚠️ Lấy code không thành công",
          description: "Email tài khoản hoặc của Anh/Chị chưa được đăng ký bên shop!",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "⚠️ Lấy code không thành công",
        description: "Có lỗi xảy ra trong quá trình lấy code",
        variant: "destructive",
      });
    }
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

  const handleUserChatGPT = (product: ChatgptPayload | null) => {
    setUserChatGPTDialog({ open: true, product });
  };

  const handleEditChatGPT = (product: ChatgptPayload | null) => {
    setEditChatGPTDialog({ open: true, product });

    useMemo(() => {
      const TODAY = new Date().toLocaleDateString("en-CA");

      const today = TODAY; // xem phần dưới
      const q = deferredSearch.trim().toLowerCase();

      return chatgpts.filter((item) => {
        if (q && !item.email?.toLowerCase().includes(q)) return false;

        if (advancedFilter === "smallTeam" && item.count_user >= 5) return false;

        if (advancedFilter === "endToday") {
          if (item.end_date?.slice(0, 10) !== today) return false;
        }

        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

        return true;
      });
    }, [chatgpts, advancedFilter, statusFilter, categoryFilter, deferredSearch]);

  };


  const handleSaveChatGPT = async (productData: ChatgptPayload) => {
    if (!sessionId) {
      // Handle the case where sessionId is null
      toast({
        title: "Lỗi",
        description: "Phiên làm việc không hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    try {
      let updatedProducts: ChatgptPayload[];

      if (editChatGPTDialog.product) {
        // Ensure that id is a valid string or number
        const updatedProduct = await updateChatgpt(sessionId, productData.id.toString(), productData); // Ensure ID is string

        updatedProducts = chatgpts.map(p =>
          p.id === updatedProduct.id ? updatedProduct : p
        );
        setChatgpts(updatedProducts);

        toast({
          title: "Cập nhật thành công",
          description: `Sản phẩm ${updatedProduct.email} đã được cập nhật.`,
        });
      } else {
        // Ensure that the ID is correctly passed as a string (even if it's a number)
        const newProduct = await createChatgpt(sessionId, productData);

        updatedProducts = [...chatgpts, newProduct];
        setChatgpts(updatedProducts);

        toast({
          title: "Tạo mới thành công",
          description: `Sản phẩm ${newProduct.email} đã được tạo.`,
        });
      }

      await loadChatGPTS();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu sản phẩm.",
        variant: "destructive",
      });
      console.error("Error saving product:", error);
    }
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
    setAdminOrderDetailModal({ open: true, order });
  };

  const handleCloseOrderDetailModal = () => {
    setAdminOrderDetailModal({ open: false, order: null });
  };

  const handleSaveOrderFromModal = (updatedOrder: Order) => {
    handleSaveOrder(updatedOrder);
    handleCloseOrderDetailModal();
  };

  const handleOrderStatusChange = (orderId: string, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
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
    setDeleteDialog({
      open: true,
      type: 'order',
      item: order,
      onConfirm: async () => {
        try {
          setIsDeleting(true);

          // Nếu id là số hợp lệ -> gọi API xoá trên server
          if (/^\d+$/.test(order.id)) {
            if (!sessionId) throw new Error('Thiếu sessionId/token.');
            await deleteOrder(Number(order.id), sessionId);
          }
          // Nếu id không phải số (ORD-xxx) -> coi như đơn local, bỏ qua API nhưng vẫn xoá local

          // Cập nhật state
          const updatedOrders = orders.filter(o => o.id !== order.id);
          setOrders(updatedOrders);


          toast({
            title: 'Xóa thành công',
            description: `Đơn hàng #${order.id} đã được xóa.`,
            variant: 'destructive',
          });

          // Đóng dialog
          setDeleteDialog(prev => ({ ...prev, open: false }));
        } catch (err: any) {
          toast({
            variant: 'destructive',
            title: 'Xóa thất bại',
            description: err?.message || 'Không thể xoá đơn hàng.',
          });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };


  // Export functions
  const handleExportUsers = () => {
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
  const handleCopyCredential = (text: string | null) => {
    navigator.clipboard.writeText(text ?? '');
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

  const safeFormatDate = (value: string | Date | null | undefined) => {
    if (!value) return "-";

    let d: Date;

    if (value instanceof Date) {
      d = value;
    } else {
      // trường hợp đặc biệt: "15T00:00:00.000000Z/04/2024"
      if (typeof value === "string" && value.includes("/") && value.includes("T")) {
        const parts = value.split("/");
        const day = parts[0].split("T")[0];
        const month = parts[1];
        const year = parts[2];
        d = new Date(`${year}-${month}-${day}`);
      } else {
        d = new Date(value);
      }
    }

    if (isNaN(d.getTime())) return "-";

    return formatDate(d);
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
    setEditAccountDialog({ open: true, account });
  };

  // Function for saving updated or new account
  const handleSaveAccount = async (updatedAccount: CustomerAccount) => {
    try {
      setLoading(true);
      if (sessionId) {
        // Reload the customer accounts after save
        await loadCustomerAccounts(sessionId);
      }
    } catch (error) {
      setError('There was an error saving the account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = (account: CustomerAccount) => {
    // Đoạn code dưới đây giả sử bạn đã có một dialog để xác nhận xóa tài khoản
    setDeleteDialog({
      open: true,
      type: 'account',
      item: account,
      onConfirm: async () => {
        try {
          // Gọi API xóa tài khoản
          if (sessionId) {
            await deleteAccount(sessionId, account.id.toString());

            // Cập nhật lại danh sách tài khoản sau khi xóa
            const updatedAccounts = customerAccounts.filter(a => a.id !== account.id);
            setCustomerAccounts(updatedAccounts);
            toast({
              title: "Xóa thành công",
              description: `Tài khoản ${account.account_email} đã được xóa.`,
              variant: "destructive",  // Chỉnh sửa tùy theo toast lib bạn đang dùng
            });
          }
        } catch (error) {
          // Hiển thị lỗi nếu có sự cố khi xóa
          toast({
            title: "Lỗi khi xóa tài khoản",
            description: 'Có lỗi xảy ra khi xóa tài khoản.',
            variant: "destructive",  // Chỉnh sửa tùy theo toast lib bạn đang dùng
          });
        }
      },
    });
  };

  const handleSendAccountRenewalReminder = async (account: CustomerAccount) => {
    if (!sessionId) {
      toast({
        title: "Thiếu phiên đăng nhập",
        description: "Vui lòng đăng nhập lại để gửi email gia hạn.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendCustomerAccountRenewalEmail(sessionId, account.id);

      toast({
        title: "Đã gửi thông báo gia hạn",
        description: `Email đã gửi đến ${account.customer_email || account.account_email}`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi khi gửi thông báo gia hạn",
        description: error?.message || "Có lỗi xảy ra khi gửi email.",
        variant: "destructive",
      });
    }
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
            📞 Hotline/Zalo: 038.966.0305 | 📧 Email: qaistore.cskh@gmail.com
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

    // Prefill: để admin tự nhập tài khoản, mật khẩu...
    setAccountEmailInput('');
    setAccountPasswordInput(''); // admin nhập tay cho bảo mật
    setSecurityCodeInput('');
    const firstProduct = order.products[0];
    setDurationInput(firstProduct?.duration || '1 tháng');
    setInstructionsInput(
      '1. Truy cập trang dịch vụ.\n2. Đăng nhập bằng email và mật khẩu ở trên.\n3. Nếu có yêu cầu bảo mật 2 lớp, nhập mã bảo mật tương ứng.\n4. Không chia sẻ tài khoản cho người khác.'
    );

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
    const numericId = toNumericId(order.id);

    // Nếu đang gửi cho 1 đơn cụ thể trong modal → ưu tiên dùng dữ liệu admin nhập
    if (sendAccountModal.order && sendAccountModal.order.id === order.id) {
      const firstProduct = order.products[0];
      const typeAccount = firstProduct?.name || 'Tài khoản Premium';
      const duration = durationInput || firstProduct?.duration || '1 tháng';

      return {
        accountEmail: accountEmailInput || order.userEmail,
        accountPassword: accountPasswordInput || 'MẬT_KHẨU_SẼ_GỬI_RIÊNG',
        accountLink: firstProduct ? getProductLink(firstProduct.name) : 'https://example.com',
        duration,
        typeAccount,
        securityCode: securityCodeInput || '',
        instructions: instructionsInput || '',
      };
    }

    // Trường hợp gửi hàng loạt hoặc không mở modal chi tiết: lấy từ tài khoản đã gán (nếu có), fallback auto
    const accountForOrder = numericId
      ? customerAccounts.find(acc => acc.order_id === numericId)
      : undefined;

    const firstProduct = order.products[0];
    const typeAccount = accountForOrder?.product_type || firstProduct?.name || 'Tài khoản Premium';

    const accountEmail = accountForOrder?.account_email || order.userEmail;
    const accountPassword = accountForOrder?.account_password || 'MẬT_KHẨU_SẼ_GỬI_RIÊNG';
    const accountLink = accountForOrder?.link || (firstProduct ? getProductLink(firstProduct.name) : 'https://example.com');
    const duration = accountForOrder?.duration
      ? `${accountForOrder.duration} tháng`
      : (firstProduct?.duration || '1 tháng');

    return {
      accountEmail,
      accountPassword,
      accountLink,
      duration,
      typeAccount,
      securityCode: '',
      instructions: '',
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
      .replace('{typeAccount}', credentials.typeAccount)
      .replace('{accountLink}', credentials.accountLink)
      .replace('{duration}', credentials.duration)
      .replace('{securityCode}', credentials.securityCode || '')
      .replace('{instructions}', credentials.instructions || '');
  };
  const toNumericId = (id: string | number): number | null => {
    if (typeof id === 'number') return id;
    return /^\d+$/.test(id) ? Number(id) : null;
  };


  const handleSendEmails = async () => {
    setSendingEmails(true);

    try {
      if (!sessionId) throw new Error('Thiếu sessionId/token.');

      const ordersToSend = sendAccountModal.order
        ? [sendAccountModal.order]
        : orders.filter(o => selectedOrders.includes(o.id));

      let sentCount = 0;
      let failedCount = 0;
      const failedEmails: string[] = [];

      for (const order of ordersToSend) {
        try {
          // Bỏ qua đơn local nếu id không phải số (không có trên server để gửi email theo order)
          const numericId = toNumericId(order.id);
          if (numericId === null) {
            failedCount++;
            failedEmails.push(order.userEmail);
            console.error(`❌ Bỏ qua: Order id không hợp lệ để gửi email qua server: ${order.id}`);
            continue;
          }

          const credentials = generateAccountCredentials(order);
          const emailContent = formatEmailContent(order, credentials);

          // ✅ Lưu (hoặc bổ sung) tài khoản vào DB để khách xem trong "Tài khoản đã giao"
          if (sessionId) {
            try {
              await createAccount(sessionId, {
                account_email: credentials.accountEmail,
                account_password: credentials.accountPassword,
                customer_name: order.customerName || order.userEmail,
                customer_email: order.userEmail,
                customer_phone: order.customerPhone || '',
                product_type: credentials.typeAccount,
                product_icon: null,
                product_color: null,
                purchase_date: new Date().toISOString().slice(0, 10),
                expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // +30 ngày
                status: 'active',
                link: credentials.accountLink,
                order_id: numericId,
                duration: durationInput
                  ? parseInt(durationInput.replace(/[^0-9]/g, ''), 10) || 1
                  : 1,
                purchase_price: order.total,
                chatgpt_id: null,
                security_code: credentials.securityCode || null,
                instructions: credentials.instructions || null,
              });
            } catch (accError) {
              console.error(`❌ Lỗi lưu tài khoản cho đơn #${order.id}:`, accError);
              // Không chặn việc gửi email nếu chỉ lỗi lưu tài khoản
            }
          }

          // Gọi API Laravel: POST /admin/orders/{id}/email
          const result = await sendOrderEmail(sessionId, numericId, {
            subject: emailSubject,          // ví dụ: state bạn đang dùng
            message: emailContent,          // nội dung render sẵn
            template: 'custom',             // hoặc 'status_update' nếu muốn server tự build theo status

          });

          if (result?.success) {
            sentCount++;
            console.log(`✅ Sent -> ${order.userEmail}`, result);
          } else {
            failedCount++;
            failedEmails.push(order.userEmail);
            console.error(`❌ Failed -> ${order.userEmail}:`, result);
          }

        } catch (emailError) {
          failedCount++;
          failedEmails.push(order.userEmail);
          console.error(`❌ Error sending email to ${order.userEmail}:`, emailError);
        }
      }

      // Toast tổng kết
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
    setEmailSubject('🎉 Tài khoản {typeAccount} của bạn đã sẵn sàng!');
    setEmailMessage(`Xin chào {customerName},

Cảm ơn bạn đã tin tưởng và mua hàng tại QAI Store! 

Thông tin tài khoản:
📧 Email: {accountEmail}
🔑 Mật khẩu: {accountPassword}
🔐 Mã bảo mật: {securityCode}
🔗 Link truy cập: {accountLink}
⏰ Thời hạn sử dụng: {duration}

Hướng dẫn sử dụng:
{instructions}

Lưu ý quan trọng:
- Vui lòng không chia sẻ thông tin này cho người khác
- Hãy đăng nhập ngay để đảm bảo tài khoản hoạt động bình thường
- Nếu có vấn đề gì, hãy liên hệ với chúng tôi ngay

Cảm ơn bạn đã chọn QAI Store! 💙

---
QAI Store - Tài khoản premium uy tín #1
📞 Hotline/Zalo: 038.966.0305
📧 Email: qaistore.cskh@gmail.com`);
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
    // console.log("View account detail", { accountId: account.id });
    // // You can implement a detailed view modal here if needed
    // toast({
    //   title: "Chi tiết tài khoản",
    //   description: `Xem chi tiết tài khoản ${account.accountEmail}`,
    // });
  };
  // Helper: bỏ dấu + lowercase + trim
  // Helper bỏ dấu như bạn đã có
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const getFilteredAndSortedAccounts = () => {
    const searchTerm = accountSearchTerm.toLowerCase();
    const rawSearch = accountSearchTerm.trim();

    const searchTokens = normalizeString(rawSearch).split(/\s+/); // tách theo khoảng trắng

    let filtered = customerAccounts.filter((account) => {
      const name = normalizeString(account.customer_name || "");
      const customerEmail = normalizeString(account.customer_email || "");
      const accountEmail = normalizeString(account.account_email || "");

      // Gộp các trường muốn tìm kiếm vào một chuỗi
      const haystack = `${customerEmail}`;

      // Tất cả từ khóa phải xuất hiện trong chuỗi gộp
      const matchesSearch = searchTokens.every((token) =>
        haystack.includes(token)
      );

      const matchesFilter =
        accountFilterType === "all" ||
        account.product_type === accountFilterType;

      return matchesSearch && matchesFilter;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (accountSortBy) {
        case "purchaseDate":
          aValue = a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
          bValue = b.purchase_date ? new Date(b.purchase_date).getTime() : 0;
          break;

        case "expiryDate":
          // sort bình thường theo ngày hết hạn
          aValue = a.expiry_date ? new Date(a.expiry_date).getTime() : 0;
          bValue = b.expiry_date ? new Date(b.expiry_date).getTime() : 0;
          break;

        case "expiryToday": {
          // ưu tiên những account hết hạn đúng hôm nay
          const today = new Date();
          const y = today.getFullYear();
          const m = today.getMonth();
          const d = today.getDate();

          const isToday = (dateStr: string | null) => {
            if (!dateStr) return false;
            const dt = new Date(dateStr);
            return (
              dt.getFullYear() === y &&
              dt.getMonth() === m &&
              dt.getDate() === d
            );
          };

          const aIsToday = isToday(a.expiry_date) ? 0 : 1;
          const bIsToday = isToday(b.expiry_date) ? 0 : 1;

          aValue = aIsToday;
          bValue = bIsToday;
          break;
        }

        case "customerName":
          aValue = (a.customer_name || "").toLowerCase();
          bValue = (b.customer_name || "").toLowerCase();
          break;

        case "productType":
          aValue = (a.product_type || "").toLowerCase();
          bValue = (b.product_type || "").toLowerCase();
          break;

        default:
          return 0;
      }

      if (aValue === bValue) return 0;

      if (accountSortOrder === "asc") {
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
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };


  const getUniqueProductTypes = () => {
    return Array.from(new Set(accounts.map(acc => acc.product_type)));
  };


  const handleSort = (column: 'purchaseDate' | 'expiryDate' | 'customerName' | 'productType') => {
    if (accountSortBy === column) {
      setAccountSortOrder(accountSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAccountSortBy(column);
      setAccountSortOrder('asc');
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // nếu products có product.category = { id, name }
  const categories = useMemo(() => {
    const map = new Map<string, string>(); // id -> name
    products?.forEach((p) => {
      if (p?.category?.id && p?.category?.name) {
        map.set(String(p.category.id), p.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Orders filtering and sorting functions
  const getFilteredAndSortedOrders = () => {
    let filtered = orders.filter(order => {
      const matchesSearch =
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

  const [currentPageProduct, setCurrentPageProduct] = useState(1);
  const pageSize = 10;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchName = !q || (product?.name ?? "").toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "all" ||
        String(product?.category?.id) === selectedCategory;

      return matchName && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = useMemo(() => {
    const start = (currentPageProduct - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPageProduct, pageSize]);


  const total = products.length;

  const from = total === 0 ? 0 : (currentPageProduct - 1) * pageSize + 1;
  const to =
    total === 0
      ? 0
      : (currentPageProduct - 1) * pageSize + paginatedProducts.length; // chuẩn nhất


  useEffect(() => {
    setCurrentPageProduct(1);
  }, [searchQuery, selectedCategory]);

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

        <div className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              {/* Logo */}
              <div className="relative group shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 sm:group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                </div>
                {/* Glow (kept absolute, purely decorative) */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-pink-400/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Title */}
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-2xl truncate">
                  <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                    QAI Admin Panel
                  </span>
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg" />
                  <p className="text-white/90 font-medium tracking-wide text-sm sm:text-base">
                    Management Dashboard
                  </p>
                  <div className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-white font-semibold border border-white/30">
                    LIVE
                  </div>
                </div>
              </div>
            </div>

            {/* Right: User + Avatar + Logout */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
                {/* User info */}
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-white drop-shadow-lg truncate max-w-[220px] sm:max-w-[280px]">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-2 py-1 bg-gradient-to-r from-yellow-400/80 to-orange-400/80 rounded-md text-[10px] sm:text-xs font-bold text-white shadow-lg">
                      {user.role.replace("_", " ").toUpperCase()}
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative group shrink-0">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-4 ring-white/30 shadow-2xl group-hover:ring-white/50 transition-all duration-300 relative z-10">
                    <AvatarFallback className="bg-gradient-to-br from-white/90 to-white/70 text-purple-600 font-black text-base sm:text-lg">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-red-500/80 hover:border-red-400 hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl sm:hover:scale-105"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

      </header>

      {/* Enhanced Modern Navigation */}
      <div className="relative mt-7 px-8 z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Modern Floating Navigation */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-2">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 bg-transparent gap-2 h-auto p-0">
              <TabsTrigger
                value="overview"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Tổng quan
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="users"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Người dùng
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="inventory-accounts"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Package className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Kho &amp; Tài khoản
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="orders"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Đơn hàng &amp; Gửi TK
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="discount-codes"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Mã giảm giá
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="customer-vouchers"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Kho voucher
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="rank-rewards"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Award className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Phần thưởng hạng
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="exchange-rewards"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Đổi điểm
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="deposits"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Nạp tiền
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="2fa"
                disabled={role != "admin"}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-300 sm:hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl hover:bg-gray-50 border-0 disabled:opacity-50"
              >
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold text-xs sm:text-sm text-center leading-tight group-data-[state=active]:drop-shadow-lg">
                  Code 2FA
                </span>
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
                        <p className="text-3xl font-bold">{users.length}</p>
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
                        <p className="text-3xl font-bold">
                          {Number(orderStats.totalRevenue).toLocaleString("vi-VN")}đ
                        </p>
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
                        <p className="text-3xl font-bold">    {orderStats.totalProcessing}
                        </p>
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
                  <CardContent className="p-4 sm:p-6">
                    <ChartContainer
                      config={{
                        revenue: { label: "Doanh thu", color: "hsl(var(--chart-1))" },
                      }}
                      className="h-56 sm:h-64 lg:h-72 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            width={40}
                            tickFormatter={(value) => `${Math.floor(Number(value) / 1_000_000)}M`}
                          />

                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value) => [`${Number(value).toLocaleString("vi-VN")}đ`, "Doanh thu"]}
                              />
                            }
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
                      </ResponsiveContainer>
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
                  <CardContent className="p-4 sm:p-6">
                    <ChartContainer
                      config={{
                        value: { label: "Doanh thu", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-56 sm:h-64 lg:h-72 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={revenueComparisonData}
                          margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                            minTickGap={24}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            width={40}
                            tickFormatter={(value) => `${Math.floor(Number(value) / 1_000_000)}M`}
                          />

                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value) => [`${Number(value).toLocaleString("vi-VN")}đ`, "Doanh thu"]}
                              />
                            }
                          />

                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {revenueComparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    {/* Comparison metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6">
                      {revenueComparisonData.map((item, index) => (
                        <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">{item.name}</div>

                          <div className="text-base sm:text-lg font-bold break-words" style={{ color: item.color }}>
                            {item.value.toLocaleString("vi-VN")}đ
                          </div>

                          {index === 1 && revenueComparisonData[0]?.value > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {((item.value - revenueComparisonData[0].value) / revenueComparisonData[0].value * 100) >= 0 ? '+' : ''}
                              {(((item.value - revenueComparisonData[0].value) / revenueComparisonData[0].value) * 100).toFixed(1)}%
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
                      <span>Hoạt động 7 ngày gần đây (phiên đăng nhập & đơn hàng)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <ChartContainer
                      config={{
                        visitors: { label: "Phiên đăng nhập", color: "hsl(var(--chart-3))" },
                        pageViews: { label: "Đơn hàng", color: "hsl(var(--chart-4))" },
                      }}
                      className="h-56 sm:h-64 lg:h-72 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trafficData.length ? trafficData : [{ name: '-', visitors: 0, pageViews: 0 }]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                            minTickGap={24}
                          />

                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />

                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />

                          <Line
                            type="monotone"
                            dataKey="visitors"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: "#8B5CF6", strokeWidth: 2 }}
                          />

                          <Line
                            type="monotone"
                            dataKey="pageViews"
                            stroke="#06B6D4"
                            strokeWidth={3}
                            dot={{ fill: "#06B6D4", strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: "#06B6D4", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                          <p className="text-sm text-blue-600 font-medium">Phiên đăng nhập hôm nay</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {trafficMetrics.todayVisitors}
                          </p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Đơn hàng hôm nay</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {trafficMetrics.todayPageViews}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-purple-500" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Tỷ lệ đơn hoàn thành (7 ngày)</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {trafficMetrics.completionRate}%
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
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-blue-800 text-lg sm:text-xl">Đơn hàng gần đây</CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="
            flex flex-col sm:flex-row sm:items-center sm:justify-between
            gap-3 p-3 sm:p-4
            bg-white rounded-xl shadow-sm border border-blue-100
            hover:shadow-md transition-shadow
          "
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">#{order.id}</p>
                              <p className="text-sm text-gray-600 truncate max-w-[260px] sm:max-w-[340px]">
                                {order.userEmail}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right sm:flex">
                            <p className="font-medium text-gray-900 mr-2">
                              {order.total.toLocaleString("vi-VN")}đ
                            </p>
                            <p>{getStatusBadge(order.status, "order")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>


                <Card className="bg-gradient-to-br from-white to-purple-50 border border-purple-100">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-purple-800 text-lg sm:text-xl">
                      Sản phẩm bán chạy
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {topSellingProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">Chưa có dữ liệu bán chạy từ đơn hàng.</p>
                      ) : (
                        topSellingProducts.map((product) => (
                          <div
                            key={product.product_id}
                            className="
            flex flex-col sm:flex-row sm:items-center sm:justify-between
            gap-3 p-3 sm:p-4
            bg-white rounded-xl shadow-sm border border-purple-100
            hover:shadow-md transition-shadow
          "
                          >
                            {/* Left */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-white" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 line-clamp-1">
                                  {product.name}
                                </p>
                                <p className="text-sm text-gray-600 truncate max-w-[260px] sm:max-w-[340px]">
                                  {product.category_name}
                                </p>
                              </div>
                            </div>

                            {/* Right */}
                            <div className="text-left sm:text-right">
                              <p className="font-medium text-gray-900">
                                {product.sales} đã bán
                              </p>
                              <div className="flex items-center gap-1 sm:justify-end">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">
                                  ★{product.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          {/* Discount Codes Tab */}
          <TabsContent value="discount-codes">
            <div className="space-y-6">
              <Card className="mt-2">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Tag className="w-5 h-5 text-indigo-600" />
                    <span>Mã giảm giá</span>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={loadDiscountCodes}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Làm mới
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleOpenCreateDiscount}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm mã
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {discountCodes.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có mã giảm giá nào.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>Tối thiểu</TableHead>
                            <TableHead>Giảm tối đa</TableHead>
                            <TableHead>Hết hạn</TableHead>
                            <TableHead>Số lần dùng</TableHead>
                            <TableHead>Đã dùng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {discountCodes.map((dc) => (
                            <TableRow key={dc.id}>
                              <TableCell className="font-mono text-sm">{dc.code}</TableCell>
                              <TableCell className="max-w-[220px]">
                                <span className="line-clamp-2 text-sm text-gray-700">
                                  {dc.description || "-"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-sky-100 text-sky-700 border border-sky-200">
                                  Giảm tiền
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {(dc.value ?? 0).toLocaleString("vi-VN")}đ
                              </TableCell>
                              <TableCell>
                                {dc.min_amount
                                  ? `${dc.min_amount.toLocaleString("vi-VN")}đ`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {dc.max_discount
                                  ? `${dc.max_discount.toLocaleString("vi-VN")}đ`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {dc.expiry_date
                                  ? new Date(dc.expiry_date).toLocaleDateString("vi-VN")
                                  : "Không giới hạn"}
                              </TableCell>
                              <TableCell>{dc.usage_limit ?? "∞"}</TableCell>
                              <TableCell>{dc.used_count ?? 0}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    dc.is_active
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : "bg-gray-100 text-gray-600 border border-gray-200"
                                  }
                                >
                                  {dc.is_active ? "Đang hoạt động" : "Tạm tắt"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Chỉnh sửa"
                                    onClick={() => handleOpenEditDiscount(dc)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Xoá"
                                    onClick={() => handleDeleteDiscount(dc)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Kho voucher khách hàng */}
          <TabsContent value="customer-vouchers">
            <div className="space-y-6">
              <Card className="mt-2">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Ticket className="w-5 h-5 text-amber-600" />
                    <span>Kho voucher khách hàng</span>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select value={customerVoucherStatus} onValueChange={(v) => {
                      setCustomerVoucherStatus(v);
                      if (!sessionId) return;
                      fetchCustomerVouchersAdmin(sessionId, { per_page: 100, status: v === 'all' ? undefined : v }).then((r) => setCustomerVouchers(r.data ?? [])).catch(() => { });
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="available">Có thể dùng</SelectItem>
                        <SelectItem value="used">Đã dùng</SelectItem>
                        <SelectItem value="expired">Hết hạn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={loadCustomerVouchers}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Làm mới
                    </Button>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setCreateVoucherOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cấp voucher
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {customerVouchers.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có voucher nào trong kho.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>HSD</TableHead>
                            <TableHead>Nguồn</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerVouchers.map((cv) => (
                            <TableRow key={cv.id}>
                              <TableCell className="font-mono text-sm">{cv.code}</TableCell>
                              <TableCell>
                                {cv.user ? (
                                  <span className="text-sm">{cv.user.name} ({cv.user.email})</span>
                                ) : (
                                  <span className="text-gray-400">{cv.user_id}</span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[160px] truncate">{cv.title || '-'}</TableCell>
                              <TableCell>Giảm tiền</TableCell>
                              <TableCell>
                                {cv.value.toLocaleString('vi-VN')}đ
                              </TableCell>
                              <TableCell>{cv.expires_at ? new Date(cv.expires_at).toLocaleDateString('vi-VN') : '-'}</TableCell>
                              <TableCell>{cv.source === 'reward_exchange' ? 'Đổi điểm' : cv.source === 'rank_reward' ? 'Phần thưởng hạng' : cv.source === 'mission' ? 'Nhiệm vụ' : 'Tặng'}</TableCell>
                              <TableCell>
                                <Badge className={cv.is_used ? 'bg-gray-100 text-gray-600' : cv.is_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {cv.is_used ? 'Đã dùng' : cv.is_valid ? 'Còn hiệu lực' : 'Hết hạn'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {!cv.is_used && (
                                  <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" title="Xóa" onClick={() => handleDeleteCustomerVoucher(cv)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Dialog tạo voucher cho khách */}
            {createVoucherOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cấp voucher cho khách</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setCreateVoucherOpen(false)}><XCircle className="w-5 h-5" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Khách hàng</Label>
                      <Select value={createVoucherForm.user_id} onValueChange={(v) => setCreateVoucherForm((f) => ({ ...f, user_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Chọn khách hàng" /></SelectTrigger>
                        <SelectContent>
                          {users.filter((u: User) => u.role === 'user').map((u: User) => (
                            <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Mã voucher</Label>
                      <Input value={createVoucherForm.code} onChange={(e) => setCreateVoucherForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="VD: TANG10" />
                    </div>
                    <div>
                      <Label>Tiêu đề (tùy chọn)</Label>
                      <Input value={createVoucherForm.title} onChange={(e) => setCreateVoucherForm((f) => ({ ...f, title: e.target.value }))} placeholder="VD: Giảm 10% đơn hàng" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Loại</Label>
                        <div className="rounded-md border px-3 py-2 text-sm bg-muted/50">Giảm tiền</div>
                      </div>
                      <div>
                        <Label>Giá trị (đ)</Label>
                        <Input type="number" min={1} value={createVoucherForm.value} onChange={(e) => setCreateVoucherForm((f) => ({ ...f, value: parseInt(e.target.value, 10) || 0 }))} placeholder="10000" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Đơn tối thiểu (đ)</Label>
                        <Input type="number" min={0} value={createVoucherForm.min_amount || ''} onChange={(e) => setCreateVoucherForm((f) => ({ ...f, min_amount: parseInt(e.target.value, 10) || 0 }))} />
                      </div>
                      <div>
                        <Label>Giảm tối đa (đ)</Label>
                        <Input type="number" min={0} value={createVoucherForm.max_discount ?? ''} onChange={(e) => setCreateVoucherForm((f) => ({ ...f, max_discount: e.target.value ? parseInt(e.target.value, 10) : null }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Hết hạn (tùy chọn)</Label>
                      <Input type="date" value={createVoucherForm.expires_at} onChange={(e) => setCreateVoucherForm((f) => ({ ...f, expires_at: e.target.value }))} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCreateVoucherOpen(false)}>Hủy</Button>
                      <Button onClick={handleCreateCustomerVoucher}>Tạo voucher</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Phần thưởng hạng */}
          <TabsContent value="rank-rewards">
            <div className="space-y-6">
              <Card className="mt-2">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Award className="w-5 h-5 text-violet-600" />
                    <span>Phần thưởng hạng – Voucher theo hạng khách hàng</span>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select value={rankRewardFilter || 'all'} onValueChange={(v) => setRankRewardFilter(v === 'all' ? '' : v)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Lọc theo hạng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả hạng</SelectItem>
                        {adminRanks.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={loadRankRewardVouchers}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Làm mới
                    </Button>
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => { setEditingRankRewardId(null); setRankRewardForm({ rank_id: '', title: '', type: 'fixed', value: 10000, min_amount: 0, max_discount: null, expiry_days: 30 }); setRankRewardDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm phần thưởng
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">Khách đạt hạng sẽ tự động nhận voucher theo cấu hình bên dưới (mỗi mẫu chỉ nhận 1 lần).</p>
                  {rankRewardVouchers.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có cấu hình phần thưởng nào. Thêm phần thưởng cho từng hạng.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hạng</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>Đơn tối thiểu</TableHead>
                            <TableHead>Giảm tối đa</TableHead>
                            <TableHead>HSD (ngày)</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rankRewardVouchers.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.rank_name ?? r.rank_id}</TableCell>
                              <TableCell className="max-w-[180px] truncate">{r.title || '-'}</TableCell>
                              <TableCell><Badge variant="outline">đ</Badge></TableCell>
                              <TableCell>{r.value.toLocaleString('vi-VN')}đ</TableCell>
                              <TableCell>{r.min_amount ? r.min_amount.toLocaleString('vi-VN') + 'đ' : '-'}</TableCell>
                              <TableCell>{r.max_discount != null ? r.max_discount.toLocaleString('vi-VN') + 'đ' : '-'}</TableCell>
                              <TableCell>{r.expiry_days}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" title="Sửa" onClick={() => { setEditingRankRewardId(r.id); setRankRewardForm({ rank_id: r.rank_id, title: r.title || '', type: 'fixed', value: r.value, min_amount: r.min_amount, max_discount: r.max_discount ?? null, expiry_days: r.expiry_days }); setRankRewardDialogOpen(true); }}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" title="Xóa" onClick={() => handleDeleteRankReward(r)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {rankRewardDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{editingRankRewardId ? 'Sửa phần thưởng hạng' : 'Thêm phần thưởng hạng'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => { setRankRewardDialogOpen(false); setEditingRankRewardId(null); }}><XCircle className="w-5 h-5" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Hạng khách hàng</Label>
                      <Select value={rankRewardForm.rank_id} onValueChange={(v) => setRankRewardForm((f) => ({ ...f, rank_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Chọn hạng" /></SelectTrigger>
                        <SelectContent>
                          {adminRanks.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name} (đơn tối thiểu {r.min_spent.toLocaleString('vi-VN')}đ)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tiêu đề voucher (tùy chọn)</Label>
                      <Input value={rankRewardForm.title} onChange={(e) => setRankRewardForm((f) => ({ ...f, title: e.target.value }))} placeholder="VD: Voucher hạng Vàng" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Loại</Label>
                        <div className="rounded-md border px-3 py-2 text-sm bg-muted/50">Giảm tiền</div>
                      </div>
                      <div>
                        <Label>Giá trị (đ)</Label>
                        <Input type="number" min={1} value={rankRewardForm.value} onChange={(e) => setRankRewardForm((f) => ({ ...f, value: parseInt(e.target.value, 10) || 0 }))} placeholder="10000" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Đơn tối thiểu (đ)</Label>
                        <Input type="number" min={0} value={rankRewardForm.min_amount} onChange={(e) => setRankRewardForm((f) => ({ ...f, min_amount: parseInt(e.target.value, 10) || 0 }))} />
                      </div>
                      <div>
                        <Label>Giảm tối đa (đ)</Label>
                        <Input type="number" min={0} value={rankRewardForm.max_discount ?? ''} onChange={(e) => setRankRewardForm((f) => ({ ...f, max_discount: e.target.value ? parseInt(e.target.value, 10) : null }))} placeholder="Bỏ trống = không giới hạn" />
                      </div>
                    </div>
                    <div>
                      <Label>Hiệu lực (số ngày từ lúc cấp)</Label>
                      <Input type="number" min={0} value={rankRewardForm.expiry_days} onChange={(e) => setRankRewardForm((f) => ({ ...f, expiry_days: parseInt(e.target.value, 10) || 0 }))} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setRankRewardDialogOpen(false); setEditingRankRewardId(null); }}>Hủy</Button>
                      <Button onClick={handleSaveRankReward}>{editingRankRewardId ? 'Cập nhật' : 'Thêm'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Phần thưởng đổi điểm */}
          <TabsContent value="exchange-rewards">
            <div className="space-y-6">
              <Card className="mt-2">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Gift className="w-5 h-5 text-emerald-600" />
                    <span>Phần thưởng có thể đổi (đổi điểm lấy voucher)</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadRewards}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Làm mới
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditingRewardId(null); setRewardForm({ name: '', description: '', icon_url: '', points_cost: 100, voucher_type: 'fixed', voucher_value: 10000, voucher_min_amount: 0, voucher_max_discount: null, voucher_expiry_days: 30 }); setRewardDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm phần thưởng
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">Khách dùng điểm tích lũy để đổi lấy voucher. Khi đổi thành công, voucher sẽ được thêm vào Kho voucher của khách.</p>
                  {rewards.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có phần thưởng nào. Thêm phần thưởng (tên, điểm đổi, cấu hình voucher).</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Điểm đổi</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>HSD (ngày)</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rewards.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.name}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{r.description || '-'}</TableCell>
                              <TableCell>{r.points_cost} điểm</TableCell>
                              <TableCell>{r.voucher_type ? 'Giảm tiền' : '-'}</TableCell>
                              <TableCell>
                                {r.voucher_type && (r.voucher_value ?? 0) > 0 ? (
                                  <span>{(r.voucher_value ?? 0).toLocaleString('vi-VN')}đ {r.voucher_min_amount > 0 ? `(đơn ≥ ${r.voucher_min_amount.toLocaleString('vi-VN')}đ)` : ''}</span>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{r.voucher_expiry_days}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" title="Sửa" onClick={() => { setEditingRewardId(r.id); setRewardForm({ name: r.name, description: r.description || '', icon_url: r.icon_url || '', points_cost: r.points_cost, voucher_type: 'fixed', voucher_value: r.voucher_value ?? 10000, voucher_min_amount: r.voucher_min_amount, voucher_max_discount: r.voucher_max_discount ?? null, voucher_expiry_days: r.voucher_expiry_days }); setRewardDialogOpen(true); }}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" title="Xóa" onClick={() => handleDeleteReward(r)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {rewardDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{editingRewardId ? 'Sửa phần thưởng đổi điểm' : 'Thêm phần thưởng đổi điểm'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => { setRewardDialogOpen(false); setEditingRewardId(null); }}><XCircle className="w-5 h-5" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tên phần thưởng</Label>
                      <Input value={rewardForm.name} onChange={(e) => setRewardForm((f) => ({ ...f, name: e.target.value }))} placeholder="VD: Voucher giảm 10%" />
                    </div>
                    <div>
                      <Label>Mô tả (tùy chọn)</Label>
                      <Input value={rewardForm.description} onChange={(e) => setRewardForm((f) => ({ ...f, description: e.target.value }))} placeholder="VD: Áp dụng cho đơn hàng tiếp theo" />
                    </div>
                    <div>
                      <Label>Điểm đổi</Label>
                      <Input type="number" min={1} value={rewardForm.points_cost} onChange={(e) => setRewardForm((f) => ({ ...f, points_cost: parseInt(e.target.value, 10) || 0 }))} />
                    </div>
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">Nhập <strong>Giá trị</strong> (số tiền giảm, VD: 10000) để khách đổi thưởng nhận đúng voucher.</p>
                    <div>
                      <Label>Loại voucher</Label>
                      <div className="rounded-md border px-3 py-2 text-sm bg-muted/50">Giảm tiền</div>
                    </div>
                    <div>
                      <Label>Giá trị voucher (bắt buộc)</Label>
                      <Input type="number" min={0} value={rewardForm.voucher_value} onChange={(e) => setRewardForm((f) => ({ ...f, voucher_value: parseInt(e.target.value, 10) || 0 }))} placeholder="10000 (đ)" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Đơn tối thiểu (đ)</Label>
                        <Input type="number" min={0} value={rewardForm.voucher_min_amount} onChange={(e) => setRewardForm((f) => ({ ...f, voucher_min_amount: parseInt(e.target.value, 10) || 0 }))} />
                      </div>
                      <div>
                        <Label>Giảm tối đa (đ)</Label>
                        <Input type="number" min={0} value={rewardForm.voucher_max_discount ?? ''} onChange={(e) => setRewardForm((f) => ({ ...f, voucher_max_discount: e.target.value ? parseInt(e.target.value, 10) : null }))} placeholder="Tùy chọn" />
                      </div>
                    </div>
                    <div>
                      <Label>Hiệu lực voucher (ngày)</Label>
                      <Input type="number" min={0} value={rewardForm.voucher_expiry_days} onChange={(e) => setRewardForm((f) => ({ ...f, voucher_expiry_days: parseInt(e.target.value, 10) || 30 }))} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setRewardDialogOpen(false); setEditingRewardId(null); }}>Hủy</Button>
                      <Button onClick={handleSaveReward}>{editingRewardId ? 'Cập nhật' : 'Thêm'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* Title */}
                  <CardTitle className="text-lg sm:text-xl">
                    Quản lý người dùng
                  </CardTitle>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>

                    {/* Filter */}
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>

                    {/* Export */}
                    <Button
                      onClick={handleExportUsers}
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>

                    {/* Add user */}
                    <Button
                      onClick={() => handleEditUser(null)}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
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
                      <TableHead>ID</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Hạng</TableHead>
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
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.rank}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{(user.totalOrders ?? 0)}</TableCell>
                        <TableCell>{(user.totalSpent ?? 0).toLocaleString('vi-VN')}đ</TableCell>
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 px-3">
                <p className="text-sm text-gray-500">
                  Hiển thị {fromUser} - {toUser} / {totalUser} user
                </p>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageUser(1)}
                    disabled={currentPageUser === 1}
                  >
                    « Đầu
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageUser((p) => Math.max(1, p - 1))}
                    disabled={currentPageUser === 1}
                  >
                    ‹ Trước
                  </Button>

                  <span className="text-sm px-2">
                    Trang <b>{currentPageUser}</b> / {totalPagesUser}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageUser((p) => Math.min(totalPagesUser, p + 1))}
                    disabled={currentPageUser === totalPagesUser}
                  >
                    Sau ›
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageUser(totalPagesUser)}
                    disabled={currentPageUser === totalPagesUser}
                  >
                    Cuối »
                  </Button>
                </div>
              </div>

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
                        <p className="text-2xl font-bold">  {products.filter(p => p?.status == "active").length}
                        </p>
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
                <TabsList className="flex w-full overflow-x-auto whitespace-nowrap justify-around">
                  <TabsTrigger
                    value="products"
                    className="flex w-full items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">Quản lý sản phẩm</span>
                    <span className="sm:hidden">Sản phẩm</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="accounts"
                    className="flex w-full  items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Tài khoản khách hàng</span>
                    <span className="sm:hidden">Khách hàng</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="renewal-requests"
                    className="flex w-full items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Yêu cầu gia hạn</span>
                    <span className="sm:hidden">Gia hạn</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="chatgpts"
                    className="flex w-full  items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">Quản lý Chat GPT</span>
                    <span className="sm:hidden">ChatGPT</span>
                  </TabsTrigger>
                </TabsList>


                {/* Products Management */}
                <TabsContent value="chatgpts">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <CardTitle className="text-lg sm:text-xl">
                          Quản lý tài khoản ChatGPT
                        </CardTitle>

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-end lg:gap-2 w-full lg:w-auto">
                          {/* Controls: Search + Filters */}
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:flex lg:flex-wrap lg:items-end lg:gap-4">

                            {/* Search */}
                            <div className="relative w-full sm:col-span-2 lg:col-auto lg:w-[320px] xl:w-[360px]">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-brand-blue" />
                              </div>
                              <Input
                                type="text"
                                placeholder="🔍 Tìm kiếm theo mail GPT"
                                value={accountGPTSearchTerm}
                                onChange={(e) => setAccountGPTSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300"
                              />
                            </div>

                            {/* Status */}
                            <Select
                              value={String(statusFilter)}
                              onValueChange={(value) => {
                                if (value === "all") setStatusFilter("all");
                                else setStatusFilter(Number(value) as 0 | 1 | 2);
                              }}
                            >
                              <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px]">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="2">Gia hạn</SelectItem>
                                <SelectItem value="1">Hoạt động</SelectItem>
                                <SelectItem value="0">Hết hạn</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Category */}
                            <Select
                              value={categoryFilter}
                              onValueChange={(value) => setCategoryFilter(value as "all" | "Plus" | "Business")}
                            >
                              <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px]">
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả loại</SelectItem>
                                <SelectItem value="Plus">Plus</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Advanced */}
                            <Select
                              value={advancedFilter}
                              onValueChange={(value) => setAdvancedFilter(value as typeof advancedFilter)}
                            >
                              <SelectTrigger className="w-full sm:col-span-2 xl:col-span-1 sm:w-auto sm:min-w-[200px]">
                                <SelectValue placeholder="Chọn bộ lọc" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="smallTeam">Còn trống</SelectItem>
                                <SelectItem value="endToday">Hết hạn hôm nay</SelectItem>
                              </SelectContent>
                            </Select>

                          </div>

                          {/* Add button */}
                          <Button
                            onClick={() => handleEditChatGPT(null)}
                            className="w-full lg:w-auto bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm tài khoản
                          </Button>

                        </div>
                      </div>


                    </CardHeader>

                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>2FA</TableHead>
                            <TableHead>Ngày bắt đầu</TableHead>
                            <TableHead>Ngày kết thúc</TableHead>
                            <TableHead>Số user</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>

                          {filteredChatgpts.map(item => {
                            const otp = otpMap[item.id];

                            return (<TableRow key={item.id}>
                              <TableCell className="font-medium">{item.id}</TableCell>

                              {/* Email tài khoản */}
                              <TableCell className="py-4 px-4">
                                <div className="space-y-2">
                                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    <div className="truncate">{item.email}</div>
                                    <div className="truncate">{item.password}</div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCopyCredential(item.email ?? '')}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Email
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCopyCredential(item.password)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Pass
                                    </Button>

                                    {/* Submit Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleOnetimeCodeAdmin(item.id)}
                                      disabled={otp?.expiresIn > 0}
                                    >
                                      {otp?.expiresIn > 0
                                        ? `Vui lòng đợi ${otp.expiresIn}s`
                                        : 'Lấy Code'}
                                    </Button>

                                    <div>
                                      {otp?.status && (
                                        <div className="flex gap-2 items-center">
                                          <span className="bg-violet-500 text-white text-sm px-1 rounded">
                                            {otp.code}
                                          </span>

                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => handleCopyCredential(otp.code)}
                                          >
                                            Sao chép
                                          </Button>
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                </div>
                              </TableCell>

                              {/* 2FA: nếu null thì hiển thị dấu - */}
                              <TableCell>{item.two_fa || "-"}</TableCell>

                              {/* Ngày bắt đầu / kết thúc */}
                              <TableCell>{safeFormatDate(item.start_date)}</TableCell>
                              <TableCell>{safeFormatDate(item.end_date)}</TableCell>

                              {/* Số user đang dùng tài khoản này */}
                              <TableCell>{item.count_user}</TableCell>

                              {/* Danh mục */}
                              <TableCell>
                                <span
                                  className={`
                                  px-2 py-1 rounded  font-medium
                                  ${item.category === 'Plus' ? 'text-white bg-green-500' : ''}
                                  ${item.category === 'Business' ? 'text-white bg-violet-500' : ''}
                                `}
                                >
                                  {item.category}
                                </span>
                              </TableCell>

                              {/* Trạng thái: dùng helper getStatusBadge hoặc tự xử lý */}
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium
      ${statusStyles[item.status] ?? "bg-gray-400 text-white"}
    `}
                                >
                                  {getStatusBadgeChatGPT(item.status)}
                                </span>
                              </TableCell>


                              {/* Thao tác */}
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm" title="Xem chi tiết" onClick={() => handleUserChatGPT(item)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditChatGPT(item)}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteChatgpt(item)}
                                    title="Xóa sản phẩm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>)
                          })}

                        </TableBody>
                      </Table>
                    </CardContent>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 px-3">
                      <p className="text-sm text-gray-500">
                        Hiển thị {fromChatgpt} - {toChatgpt} / {totalChatgpt} chatgpt
                      </p>

                      {showPaginationChatgpt && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageChatgpt(1)}
                            disabled={currentPageChatgpt === 1}
                          >
                            « Đầu
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageChatgpt((p) => Math.max(1, p - 1))}
                            disabled={currentPageChatgpt === 1}
                          >
                            ‹ Trước
                          </Button>

                          <span className="text-sm px-2">
                            Trang <b>{currentPageChatgpt}</b> / {totalPageChatgpt}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageChatgpt((p) => Math.min(totalPageChatgpt, p + 1))}
                            disabled={currentPageChatgpt === totalPageChatgpt}
                          >
                            Sau ›
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageChatgpt(totalPageChatgpt)}
                            disabled={currentPageChatgpt === totalPageChatgpt}
                          >
                            Cuối »
                          </Button>
                        </div>
                      )}
                    </div>

                  </Card>

                </TabsContent>


                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        Xác nhận xóa tài khoản
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                      <p className="text-gray-800">
                        Bạn có chắc chắn muốn xóa tài khoản:
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedItem?.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    <DialogFooter className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmOpen(false)}
                        disabled={deletingId !== null}
                      >
                        Hủy
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={confirmDeleteChatgpt}
                        disabled={deletingId !== null}
                      >
                        {deletingId !== null ? "Đang xóa..." : "Xóa"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>




                {/* Products Management */}
                <TabsContent value="products">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-3">
                        <CardTitle className="text-lg sm:text-xl">Quản lý sản phẩm</CardTitle>

                        {/* Responsive row */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          {/* SEARCH: full width on mobile, flexible on desktop */}
                          <div className="relative w-full sm:flex-1 sm:min-w-[280px]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Search className="h-5 w-5 text-brand-blue" />
                            </div>

                            <Input
                              type="text"
                              placeholder="🔍 Tìm kiếm theo tên sản phẩm"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="lg:w-1/3 sm:w-full pl-12 pr-10 py-4 text-sm border-2 border-gray-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all duration-300 bg-white shadow-inner"
                            />

                          </div>

                          {/* ACTIONS: wrap nicely */}
                          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:flex-nowrap">

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                              <SelectTrigger className="w-full sm:w-[220px] rounded-md">
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả danh mục</SelectItem>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Button onClick={handleExportProducts} className="w-full sm:w-auto">
                              <Download className="w-4 h-4 mr-2" />
                              Xuất Excel
                            </Button>

                            <Button
                              onClick={() => handleEditProduct(null)}
                              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Thêm sản phẩm
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>


                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Nhãn</TableHead>
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
                          {paginatedProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.id}</TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>
                                {product.badge ? (
                                  <Badge className={`${product.badge_color} text-white px-2 py-1 text-xs font-semibold rounded-md`}>
                                    {product.badge}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400">Không</span>
                                )}
                              </TableCell>
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

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4">

                    <p className="text-sm text-gray-500">
                      Hiển thị {from} - {to} / {total} sản phẩm
                    </p>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageProduct(1)}
                        disabled={currentPageProduct === 1}
                      >
                        « Đầu
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageProduct((p) => Math.max(1, p - 1))}
                        disabled={currentPageProduct === 1}
                      >
                        ‹ Trước
                      </Button>

                      <span className="text-sm px-2">
                        Trang <b>{currentPageProduct}</b> / {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageProduct((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPageProduct === totalPages}
                      >
                        Sau ›
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageProduct(totalPages)}
                        disabled={currentPageProduct === totalPages}
                      >
                        Cuối »
                      </Button>
                    </div>
                  </div>
                </TabsContent>




                {/* Customer Accounts Management */}
                <TabsContent value="accounts">
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
                    <CardHeader className="bg-gradient-to-r from-brand-blue/5 via-brand-purple/5 to-brand-emerald/5 border-b-0 pb-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        {/* LEFT: Icon + Title */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 shrink-0 bg-gradient-to-r from-brand-blue to-brand-emerald rounded-xl flex items-center justify-center shadow-lg">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>

                          <div>
                            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent">
                              Tài khoản đã mua
                            </CardTitle>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                              Danh sách tài khoản đã giao cho khách hàng (gắn với đơn hàng)
                            </p>
                          </div>
                        </div>

                        {/* RIGHT: Stats (từ API meta - tài khoản đã mua) */}
                        <div className="grid grid-cols-3 gap-4 sm:gap-6 text-sm text-center">
                          <div>
                            <div className="text-brand-blue font-bold text-lg sm:text-xl">
                              {metaAccounts?.total ?? 0}
                            </div>
                            <div className="text-gray-500">Tổng TK đã mua</div>
                          </div>

                          <div>
                            <div className="text-green-600 font-bold text-lg sm:text-xl">
                              {metaAccounts?.total_active ?? 0}
                            </div>
                            <div className="text-gray-500">Hoạt động</div>
                          </div>

                          <div>
                            <div className="text-red-600 font-bold text-lg sm:text-xl">
                              {metaAccounts?.total_expired ?? 0}
                            </div>
                            <div className="text-gray-500">Hết hạn</div>
                          </div>
                        </div>

                      </div>
                    </CardHeader>


                    <CardContent className="p-6">
                      {/* Enhanced Search and Filter */}
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">

                        {/* Search */}
                        <div className="relative w-full lg:flex-1 lg:max-w-lg">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-brand-blue" />
                          </div>
                          <Input
                            type="text"
                            placeholder="🔍 Tìm kiếm theo tên khách hàng"
                            value={accountSearchTerm}
                            onChange={(e) => setAccountSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300"
                          />
                        </div>

                        {/* Controls */}
                        <div className="w-full lg:w-auto space-y-3 lg:space-y-0 md:flex md:gap-3">
                          {/* Row 1: selects */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-center">
                            <Select value={accountFilterType} onValueChange={setAccountFilterType}>
                              <SelectTrigger className="w-full sm:w-auto sm:min-w-[11rem] border-2 border-gray-200 hover:border-brand-purple transition-colors duration-300 rounded-lg">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Lọc theo sản phẩm" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                                {getUniqueProductTypes()
                                  .filter((type): type is string => type !== null && type !== undefined)
                                  .map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={`${accountSortBy}-${accountSortOrder}`}
                              onValueChange={(value) => {
                                const [sortBy, sortOrder] = value.split("-") as [string, string];
                                if (sortBy === "expiryToday") {
                                  setAccountSortBy("expiryToday");
                                  setAccountSortOrder("asc");
                                } else {
                                  setAccountSortBy(sortBy as any);
                                  setAccountSortOrder(sortOrder as "asc" | "desc");
                                }
                              }}
                            >
                              <SelectTrigger className="w-full sm:w-auto sm:min-w-[11rem] border-2 border-gray-200 hover:border-brand-emerald transition-colors duration-300 rounded-lg">
                                <SortAsc className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Sắp xếp theo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="purchaseDate-desc">Ngày mua (Mới nhất)</SelectItem>
                                <SelectItem value="purchaseDate-asc">Ngày mua (Cũ nhất)</SelectItem>
                                <SelectItem value="expiryToday-asc">Ngày hết hạn (Hôm nay)</SelectItem>
                                <SelectItem value="expiryDate-desc">Ngày hết hạn (Gần nhất)</SelectItem>
                                <SelectItem value="expiryDate-asc">Ngày hết hạn (Xa nhất)</SelectItem>
                                <SelectItem value="customerName-asc">Tên A-Z</SelectItem>
                                <SelectItem value="customerName-desc">Tên Z-A</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Row 2: buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-center">
                            <Button className="w-full lg:w-auto bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white shadow-lg rounded-lg px-4">
                              <Download className="w-4 h-4 mr-2" />
                              Xuất Excel
                            </Button>

                            <input
                              type="file"
                              accept=".xlsx, .xls, .csv"
                              onChange={handleImportExcel}
                              id="excelInput"
                              hidden
                            />

                            <Button
                              onClick={() => document.getElementById("excelInput")?.click()}
                              disabled={isImporting}
                              className="w-full lg:w-auto bg-gradient-to-r from-brand-gray to-brand-blue text-white shadow-md hover:opacity-90 rounded-lg px-4"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {isImporting ? "Đang nhập..." : "Nhập Excel"}
                            </Button>

                            <Button
                              onClick={() => handleEditAccount(null)}
                              className="w-full sm:col-span-2 lg:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-lg px-4"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Thêm TK
                            </Button>
                          </div>
                        </div>
                      </div>


                      {/* Optimized Table */}
                      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b-2 border-gray-100">
                              <TableHead className="w-[5%] py-3 px-4 font-semibold text-gray-700">ID</TableHead>
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
                              {/* <TableHead className="w-[10%] py-3 px-3 font-semibold text-gray-700">Hạng</TableHead> */}
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
                            {accounts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={10} className="py-12 text-center text-gray-500">
                                  Chưa có tài khoản đã mua nào. Danh sách chỉ hiển thị tài khoản đã giao cho khách (gắn với đơn hàng).
                                </TableCell>
                              </TableRow>
                            ) : accounts.map((account, index) => (
                              <TableRow
                                key={account.id}
                                className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 transition-all duration-200 border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                  }`}
                              >
                                <TableCell className="py-4 px-4">
                                  <div className="space-y-2">
                                    <div className="truncate">{account.id}</div>
                                  </div>
                                </TableCell>

                                <TableCell className="py-4 px-4">
                                  <div className="space-y-2">
                                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                      <div className="truncate">{account.account_email}</div>
                                      <div className="truncate">{account.account_password}</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCopyCredential(account.account_email ?? '')}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Email
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCopyCredential(account.account_password)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Pass
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="font-semibold text-gray-800 text-sm truncate">{account.customer_name}</div>
                                  <div className="text-xs text-gray-500 truncate">{account?.customer_email || account?.customer_phone || ""}</div>
                                  <a
                                    href={account.link || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline text-medium font-bold"
                                  >
                                    Xem link
                                  </a>
                                </TableCell>
                                {/* <TableCell className="py-4 px-3">
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
                                </TableCell> */}
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3 text-brand-blue flex-shrink-0" />
                                    <span className="text-xs font-medium">  {formatDate(account.purchase_date ? new Date(account.purchase_date) : new Date())}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                    <span className="text-xs font-medium">  {formatDate(account.expiry_date ? new Date(account.expiry_date) : new Date())}
                                    </span>
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
                                    className="text-xs px-1 py-0 font-medium  bg-transparent text-purple-600 hover:text-white"
                                  >
                                    {account.product_type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-3">
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    <span className="font-semibold text-green-700 text-xs">
                                      {account.purchase_price?.toLocaleString()}đ
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right py-4 px-4">
                                  <div className="flex items-center justify-end space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 h-7 px-2 transition-all duration-200 hover:scale-105"
                                      onClick={() => handleSendAccountRenewalReminder(account)}
                                      title="Gửi thông báo gia hạn"
                                      disabled={!account.customer_email && !account.account_email}
                                    >
                                      <Send className="w-3 h-3 mr-1" />
                                      Nhắc gia hạn
                                    </Button>
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
                      {/* Optimized Pagination (BACKEND) */}
                      {totalPagesAccounts > 1 && (
                        <div className="mt-6 px-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          {/* Left: info */}
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <span className="text-sm text-gray-600 leading-relaxed">
                              Hiển thị {fromAccounts} - {toAccounts} / {totalItems} tài khoản
                            </span>
                          </div>

                          {/* Right: pagination controls */}
                          <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                            {/* First */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPageAccounts(1)}
                              disabled={currentPageAccounts === 1}
                              className="w-[90px] sm:w-auto"
                            >
                              « Đầu
                            </Button>

                            {/* Prev */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPageAccounts((p) => Math.max(1, p - 1))}
                              disabled={currentPageAccounts === 1}
                              className="w-[90px] sm:w-auto"
                            >
                              ‹ Trước
                            </Button>

                            <span className="text-sm px-2">
                              Trang <b>{currentPageAccounts}</b> / {totalPagesAccounts}
                            </span>

                            {/* Next */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPageAccounts((p) =>
                                  Math.min(totalPagesAccounts, p + 1)
                                )
                              }
                              disabled={currentPageAccounts === totalPagesAccounts}
                              className="w-[90px] sm:w-auto"
                            >
                              Sau ›
                            </Button>

                            {/* Last */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPageAccounts(totalPagesAccounts)}
                              disabled={currentPageAccounts === totalPagesAccounts}
                              className="w-[90px] sm:w-auto"
                            >
                              Cuối »
                            </Button>
                          </div>
                        </div>
                      )}


                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Đơn yêu cầu gia hạn tài khoản */}
                <TabsContent value="renewal-requests">
                  <Card className="border-0 shadow-2xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl">Yêu cầu gia hạn tài khoản</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">Xem và duyệt/từ chối đơn yêu cầu gia hạn từ khách hàng</p>
                        </div>
                        <Select value={renewalStatusFilter} onValueChange={setRenewalStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="approved">Đã duyệt</SelectItem>
                            <SelectItem value="rejected">Đã từ chối</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold">ID</TableHead>
                              <TableHead className="font-semibold">Tài khoản</TableHead>
                              <TableHead className="font-semibold">Sản phẩm</TableHead>
                              <TableHead className="font-semibold">Khách hàng</TableHead>
                              <TableHead className="font-semibold">Ghi chú</TableHead>
                              <TableHead className="font-semibold">Ngày tạo</TableHead>
                              <TableHead className="font-semibold">Trạng thái</TableHead>
                              <TableHead className="text-right font-semibold">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {renewalRequests.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                                  Chưa có đơn yêu cầu gia hạn nào.
                                </TableCell>
                              </TableRow>
                            ) : (
                              renewalRequests.map((req) => (
                                <TableRow key={req.id}>
                                  <TableCell>{req.id}</TableCell>
                                  <TableCell className="font-mono text-sm">{req.accountEmail}</TableCell>
                                  <TableCell>{req.productType || '—'}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">{req.userName || '—'}</div>
                                    <div className="text-xs text-gray-500">{req.userEmail}</div>
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate text-sm">{req.note || '—'}</TableCell>
                                  <TableCell className="text-sm text-gray-600">
                                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : '—'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        req.status === 'pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : req.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                      }
                                    >
                                      {req.status === 'pending' ? 'Chờ xử lý' : req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {req.status === 'pending' && (
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-300 hover:bg-green-50"
                                          disabled={renewalUpdatingId === req.id}
                                          onClick={() => handleRenewalRequestUpdate(req.id, 'approved')}
                                        >
                                          {renewalUpdatingId === req.id ? '...' : 'Duyệt'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 border-red-300 hover:bg-red-50"
                                          disabled={renewalUpdatingId === req.id}
                                          onClick={() => handleRenewalRequestUpdate(req.id, 'rejected')}
                                        >
                                          Từ chối
                                        </Button>
                                      </div>
                                    )}
                                    {req.status !== 'pending' && req.adminNote && (
                                      <span className="text-xs text-gray-500">{req.adminNote}</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {renewalMeta?.total > 0 && (
                        <p className="text-sm text-gray-500 mt-3">Tổng: {renewalMeta.total} đơn</p>
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
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                  {/* Left: Icon + Title */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                        Quản lý đơn hàng &amp; Gửi tài khoản
                      </CardTitle>
                      <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                        Theo dõi đơn hàng và gửi thông tin tài khoản cho khách hàng
                      </p>
                    </div>
                  </div>

                  {/* Right: Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:justify-end">
                    <Button onClick={handleExportOrders} variant="outline" className="w-full lg:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất đơn hàng
                    </Button>

                    <Button onClick={handleExportDetailedOrders} variant="outline" className="w-full lg:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất chi tiết
                    </Button>

                    <Button
                      onClick={() => setEditOrderDialog({ open: true, order: null })}
                      className="w-full sm:col-span-2 lg:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo đơn hàng
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {/* ... giữ nguyên các Card stats của bạn ... */}
                </div>
              </CardHeader>


              <CardContent className="p-8">
                {/* Enhanced Search and Filter with Send Account Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
                  <div className="relative sm:w-full w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="🔍 Tìm kiếm đơn hàng, khách hàng..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-gray-200 focus:border-orange-500 transition-colors w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 sm:w-full lg:flex lg:items-center gap-3 w-full">
                    <Select value={orderFilterStatus} onValueChange={setOrderFilterStatus}>
                      <SelectTrigger className="w-full border-2 border-gray-200 hover:border-orange-500 transition-colors">
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

                    <Select
                      value={orderSortBy}
                      onValueChange={(value: "newest" | "oldest" | "highest" | "lowest") => setOrderSortBy(value)}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-200 hover:border-purple-500 transition-colors">
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

                    <Button
                      variant="outline"
                      className="w-full lg:w-auto border-2 border-gray-200 hover:border-blue-500"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-2 transition-transform duration-700 ${refreshing ? 'animate-spin' : ''
                          }`}
                      />
                      Làm mới
                    </Button>

                  </div>

                </div>

                {/* Send Account Bulk Actions */}
                {/* <div className="flex flex-col lg:flex-row gap-4 items-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
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
                </div> */}

                {/* Enhanced Orders Table with Send Account Features */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                      <TableRow>
                        {/* <TableHead className="w-12 font-semibold">
                          <Checkbox
                            checked={selectedOrders.length > 0 && selectedOrders.length === orders.filter(o => o.status === 'completed').length}
                            onCheckedChange={handleSelectAllOrders}
                            className="border-2 border-gray-400"
                          />
                        </TableHead> */}
                        <TableHead className="font-semibold">Mã đơn hàng</TableHead>
                        <TableHead className="font-semibold">Khách hàng</TableHead>
                        <TableHead className="font-semibold">Contact/Zalo</TableHead>
                        <TableHead className="font-semibold">Link</TableHead>
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
                          {/* <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                              disabled={order.status !== 'completed'}
                              className={order.status === 'completed' ? 'border-2 border-green-400' : 'opacity-50'}
                            />
                          </TableCell> */}
                          <TableCell>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-medium">#{order.id}</span>
                              {order.renewalForAccountId && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                  Đơn gia hạn
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{order.customerName || order.userEmail}</p>
                              <p className="text-sm text-gray-500">{order.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{order.customerPhone || order.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <a
                                className="font-medium  text-blue-500 hover:opacity-80"
                                href={order.shippingAddress}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {order.shippingAddress
                                  ? order.shippingAddress.length > 30
                                    ? order.shippingAddress.slice(0, 30) + "..."
                                    : order.shippingAddress
                                  : "Không có địa chỉ"}
                              </a>
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
                              {/* {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOrderStatusChange(order.id, 'processing')}
                                  className="text-xs"
                                >
                                  Xử lý
                                </Button>
                              )} */}
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
                              {/* {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOrderStatusChange(order.id, 'processing')}
                                  className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  Xử lý
                                </Button>
                              )} */}
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

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 pb-3">
                    <p className="text-sm text-gray-500">
                      Hiển thị {fromOrder} - {toOrder} / {totalOrder} đơn hàng
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={page === 1 || loadingOrders}
                        className="w-full sm:w-auto"
                      >
                        « Đầu
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loadingOrders}
                        className="w-full sm:w-auto"
                      >
                        ‹ Trước
                      </Button>

                      <span className="text-sm px-2 w-full sm:w-auto text-center sm:text-left">
                        Trang <b>{page}</b> / {ordersMeta.lastPage}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(ordersMeta.lastPage, p + 1))}
                        disabled={page === ordersMeta.lastPage || loadingOrders}
                        className="w-full sm:w-auto"
                      >
                        Sau ›
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(ordersMeta.lastPage)}
                        disabled={page === ordersMeta.lastPage || loadingOrders}
                        className="w-full sm:w-auto"
                      >
                        Cuối »
                      </Button>
                    </div>
                  </div>


                </div>

                {/* Quick Actions */}
                {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
                </div> */}

                {/* Email Template Configuration Section */}
                {/* <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-200">
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
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <DepositApprovals />
          </TabsContent>


          {/* 2fa Tab */}
          <TabsContent value="2fa">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-lg sm:text-xl">
                    Quản lý người dùng lấy code
                  </CardTitle>

                  <div className="w-full lg:w-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                    {/* Search */}
                    <div className="relative w-full lg:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm mail code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:gap-2">
                      <Button
                        onClick={() => handleEditCode(null)}
                        className="w-full lg:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm người dùng
                      </Button>

                      <Button
                        onClick={() => handleOnetimeCode(null)}
                        className="w-full lg:w-auto bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm 2FA
                      </Button>

                      <Button
                        onClick={() => handleOnetimeCode(defaultCode)}
                        className="w-full sm:col-span-2 lg:w-auto bg-indigo-500 hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Cập nhật 2FA
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email GPT</TableHead>
                      <TableHead>EMail User</TableHead>
                      <TableHead>Tên người dùng </TableHead>
                      <TableHead>IP Truy cập</TableHead>
                      <TableHead>Số lần lấy</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onetimecodes.filter(code =>
                      code?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      code?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((code) => (

                      <TableRow key={code.id}>
                        <TableCell>
                          {code.id}
                        </TableCell>
                        <TableCell>{code.onetimecode?.email}</TableCell>
                        <TableCell>{code.email}</TableCell>
                        <TableCell>{code.name}</TableCell>
                        <TableCell className="max-w-[150px] break-words">{code.ip}</TableCell>
                        <TableCell >{code.count_logined}</TableCell>
                        <TableCell >{code.date_logined}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm text-white
      ${code.status == "1" ? "bg-green-600" : "bg-red-600"}
    `}
                          >
                            {code.status == "1" ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {/* <Button variant="ghost" size="sm" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            <Button variant="ghost" size="sm" title="Chỉnh sửa">
                              <Edit onClick={() => handleEditCode(code)} className="w-4 h-4" />
                            </Button>
                            {role == 'admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Xóa"
                                onClick={() => {
                                  setDeleteTarget(code);
                                  setDeleteDialogOpen(true);
                                }}
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 px-3">
                <p className="text-sm text-gray-500">
                  Hiển thị {fromOnetimecode} - {toOnetimecode} / {totalOnetimecode} email
                </p>

                {showPagination && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageOnetimecode(1)}
                      disabled={currentPageOnetimecode === 1}
                    >
                      « Đầu
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageOnetimecode((p) => Math.max(1, p - 1))}
                      disabled={currentPageOnetimecode === 1}
                    >
                      ‹ Trước
                    </Button>

                    <span className="text-sm px-2">
                      Trang <b>{currentPageOnetimecode}</b> / {totalPageOnetimecode}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageOnetimecode((p) => Math.min(totalPageOnetimecode, p + 1))}
                      disabled={currentPageOnetimecode === totalPageOnetimecode}
                    >
                      Sau ›
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageOnetimecode(totalPageOnetimecode)} // ✅ sửa totalPages -> totalPageOnetimecode
                      disabled={currentPageOnetimecode === totalPageOnetimecode}
                    >
                      Cuối »
                    </Button>
                  </div>
                )}
              </div>
            </Card>
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


        <UserChatGPTDialog
          account={editUserChatGPTDialog.product}
          open={editUserChatGPTDialog.open}
          onOpenChange={(open) => setUserChatGPTDialog({ ...editUserChatGPTDialog, open })}
          onSave={handleSaveChatGPT}
        />

        <EditChatGPTDialog
          account={editChatGPTDialog.product}
          open={editChatGPTDialog.open}
          onOpenChange={(open) => setEditChatGPTDialog({ ...editChatGPTDialog, open })}
          onSave={handleSaveChatGPT}
        />


        <EditCodeDialog
          code={editCodeDialog.code}
          open={editCodeDialog.open}
          onOpenChange={(open) => setEditCodeDialog({ ...editCodeDialog, open })}
          onSave={handleSaveCode}
        />


        <EditOnetimeCodeDialog
          code={editOnetimeCode.code}
          open={editOnetimeCode.open}
          onOpenChange={(open) => setEditOnetimeCodeDialog({ ...editOnetimeCode, open })}
          onSave={handleSaveOnetimeCode}
        />

        <EditDiscountCodeDialog
          code={editDiscountDialog.code}
          open={editDiscountDialog.open}
          onOpenChange={(open) => setEditDiscountDialog({ ...editDiscountDialog, open })}
          onSave={handleSaveDiscount}
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

              {/* Thông tin tài khoản gửi cho khách (nhập tay) */}
              {sendAccountModal.order && (
                <Card className="border-green-200 bg-green-50/60">
                  <CardContent className="p-4 space-y-4">
                    <h4 className="font-semibold text-green-900 mb-1">
                      Thông tin tài khoản sẽ gửi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-800 mb-1">
                          Email / Tài khoản
                        </label>
                        <Input
                          value={accountEmailInput}
                          onChange={(e) => setAccountEmailInput(e.target.value)}
                          placeholder="account@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-800 mb-1">
                          Mật khẩu
                        </label>
                        <Input
                          value={accountPasswordInput}
                          onChange={(e) => setAccountPasswordInput(e.target.value)}
                          placeholder="Nhập mật khẩu sẽ gửi cho khách"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-800 mb-1">
                          Mã bảo mật (nếu có)
                        </label>
                        <Input
                          value={securityCodeInput}
                          onChange={(e) => setSecurityCodeInput(e.target.value)}
                          placeholder="VD: mã backup / mã 2FA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-800 mb-1">
                          Thời hạn sử dụng
                        </label>
                        <Input
                          value={durationInput}
                          onChange={(e) => setDurationInput(e.target.value)}
                          placeholder="VD: 6 tháng, 1 năm..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-1">
                        Hướng dẫn sử dụng
                      </label>
                      <Textarea
                        value={instructionsInput}
                        onChange={(e) => setInstructionsInput(e.target.value)}
                        rows={4}
                        className="text-sm"
                      />
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
                                <div><strong>Mã bảo mật:</strong> {credentials.securityCode || '—'}</div>
                                <div><strong>Thời hạn:</strong> {credentials.duration}</div>
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

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Xác nhận xoá
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xoá
                {" "}
                <span className="font-semibold">
                  {deleteTarget?.name || deleteTarget?.email}
                </span>
                ?
                <br />
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteCode}
              >
                Xoá
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div >

  );
}