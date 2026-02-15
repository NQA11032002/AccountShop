"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import DataSyncHelper from '@/lib/syncHelper';

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'purchase' | 'refund' | 'bonus';
  amount: number;
  description: string;
  orderId?: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
}

interface DepositMethod {
  id: string;
  name: string;
  type: 'momo' | 'banking' | 'card' | 'crypto';
  icon: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  isActive: boolean;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  depositMethods: DepositMethod[];

  // Balance operations
  depositCoins: (amount: number, method: string) => Promise<boolean>;
  createDepositOrder: (amount: number, method: string) => Promise<{ orderId: string; success: boolean }>;
  confirmUserPayment: (orderId: string) => Promise<boolean>;
  confirmDeposit: (orderId: string) => Promise<boolean>;
  deductCoins: (amount: number, description: string, orderId?: string) => Promise<boolean>;
  refundCoins: (amount: number, description: string, orderId?: string) => void;

  // Transaction management
  getTransactionHistory: () => WalletTransaction[];
  getTransactionsByType: (type: WalletTransaction['type']) => WalletTransaction[];
  refreshTransactions: () => void;
  syncDepositStatus: () => Promise<void>;

  // Utility functions
  canAfford: (amount: number) => boolean;
  formatCoins: (amount: number) => string;
  isProcessingDeposit: boolean;
  /** Cập nhật số dư từ server (sau khi backend đã trừ coin, ví dụ gia hạn tài khoản) */
  syncBalanceFromServer: (newBalance: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const depositMethods: DepositMethod[] = [
    // {
    //   id: 'momo',
    //   name: 'Ví MoMo',
    //   type: 'momo',
    //   icon: '📱',
    //   fee: 0,
    //   minAmount: 10000,
    //   maxAmount: 10000000,
    //   processingTime: 'Tức thì',
    //   isActive: true
    // },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      type: 'banking',
      icon: '🏦',
      fee: 0,
      minAmount: 50000,
      maxAmount: 50000000,
      processingTime: '5-15 phút',
      isActive: true
    },
    // {
    //   id: 'card',
    //   name: 'Thẻ tín dụng/ghi nợ',
    //   type: 'card',
    //   icon: '💳',
    //   fee: 2500,
    //   minAmount: 20000,
    //   maxAmount: 20000000,
    //   processingTime: 'Tức thì',
    //   isActive: true
    // },
    // {
    //   id: 'crypto',
    //   name: 'Cryptocurrency',
    //   type: 'crypto',
    //   icon: '₿',
    //   fee: 0,
    //   minAmount: 100000,
    //   maxAmount: 100000000,
    //   processingTime: '10-30 phút',
    //   isActive: true
    // }
  ];

  // console.log("WalletProvider initialized", {
  //   user: user?.email,
  //   balance,
  //   transactionsCount: transactions.length
  // });

  // Real-time sync listener for deposit approvals/rejections
  useEffect(() => {
    if (!user) return;

    // console.log("🔄 Setting up real-time deposit sync for user:", user.email);

    const unsubscribeDeposit = DataSyncHelper.subscribeToDepositSync((depositData) => {
      // console.log("💳 Received deposit sync event:", depositData);

      if (depositData.userId === user.id) {
        // console.log("✅ Processing deposit sync for current user");

        // Refresh wallet data from localStorage (already updated by sync helper)
        const savedWallet = localStorage.getItem(`qai-wallet-${user.id}`);
        if (savedWallet) {
          try {
            const walletData = JSON.parse(savedWallet);
            setBalance(walletData.balance || 0);

            const parsedTransactions = (walletData.transactions || []).map((tx: any) => ({
              ...tx,
              date: new Date(tx.date)
            }));
            setTransactions(parsedTransactions);

            // Show notification to user
            if (depositData.status === 'approved') {
              toast({
                title: "💰 Nạp coins thành công!",
                description: `Bạn đã nhận được ${formatCoins(depositData.finalAmount)} từ giao dịch ${depositData.orderId}`,
              });
            } else if (depositData.status === 'rejected') {
              toast({
                title: "❌ Giao dịch bị từ chối",
                description: `Giao dịch nạp tiền ${depositData.orderId} đã bị từ chối`,
                variant: "destructive",
              });
            }

            console.log("🔄 Wallet state updated from deposit sync", {
              orderId: depositData.orderId,
              status: depositData.status,
              newBalance: walletData.balance,
              finalAmount: depositData.finalAmount
            });

          } catch (error) {
            console.error("❌ Error parsing wallet data from sync:", error);
          }
        }
      }
    });

    const unsubscribeWallet = DataSyncHelper.subscribeToWalletSync(user.id, (walletData) => {
      console.log("💰 Received wallet sync event:", walletData);
      setBalance(walletData.balance || 0);

      const parsedTransactions = (walletData.transactions || []).map((tx: any) => ({
        ...tx,
        date: new Date(tx.date)
      }));
      setTransactions(parsedTransactions);
    });

    return () => {
      unsubscribeDeposit();
      unsubscribeWallet();
    };
  }, [user, toast]);

  // Load user wallet data from JSON API when user changes
  useEffect(() => {
    const loadUserWallet = async () => {
      if (user) {
        console.log("💰 Loading wallet for user", { userId: user.id });

        try {
          // Load wallet data from JSON API with fallback to localStorage
          const walletData = await DataSyncHelper.loadUserData(user.id, 'userWallets');

          if (walletData.length > 0) {
            const userWallet = walletData[0]; // Should be one wallet per user
            setBalance(userWallet.balance || 0);

            // Parse transactions with proper date objects
            const parsedTransactions = (userWallet.transactions || []).map((tx: any) => ({
              id: tx.id,
              type: tx.type,
              amount: tx.amount,
              description: tx.description,
              orderId: tx.orderId,
              date: new Date(tx.timestamp),
              status: tx.status,
              paymentMethod: tx.paymentMethod
            }));
            setTransactions(parsedTransactions);

            console.log("✅ Wallet loaded from API", {
              balance: userWallet.balance,
              transactionsCount: parsedTransactions.length
            });
          } else {
            // Fallback to localStorage
            const savedWallet = localStorage.getItem(`qai-wallet-${user.id}`);
            if (savedWallet) {
              try {
                const walletData = JSON.parse(savedWallet);
                setBalance(walletData.balance || 0);

                const parsedTransactions = (walletData.transactions || []).map((tx: any) => ({
                  ...tx,
                  date: new Date(tx.date)
                }));
                setTransactions(parsedTransactions);

                console.log("💾 Wallet loaded from localStorage", {
                  balance: walletData.balance,
                  transactionsCount: parsedTransactions.length
                });
              } catch (error) {
                console.error("❌ Error loading wallet from localStorage:", error);
                localStorage.removeItem(`qai-wallet-${user.id}`);
                setBalance(0);
                setTransactions([]);
              }
            } else {
              // Initialize wallet for new user with welcome bonus
              const welcomeBonus = 50000; // 50k coins welcome bonus
              setBalance(welcomeBonus);
              const welcomeTransaction: WalletTransaction = {
                id: `welcome-${Date.now()}`,
                type: 'bonus',
                amount: welcomeBonus,
                description: 'Chào mừng bạn đến với QAI Store!',
                date: new Date(),
                status: 'completed'
              };
              setTransactions([welcomeTransaction]);

              // Save to both localStorage and API
              const walletData = {
                balance: welcomeBonus,
                transactions: [welcomeTransaction]
              };
              localStorage.setItem(`qai-wallet-${user.id}`, JSON.stringify(walletData));

              // Save to JSON API
              await DataSyncHelper.saveUserData(user.id, 'userWallets', {
                id: `wallet_${user.id}`,
                userId: user.id,
                balance: welcomeBonus,
                currency: "VND",
                lastUpdated: new Date().toISOString(),
                transactions: [{
                  id: welcomeTransaction.id,
                  type: welcomeTransaction.type,
                  amount: welcomeTransaction.amount,
                  description: welcomeTransaction.description,
                  timestamp: welcomeTransaction.date.toISOString(),
                  status: welcomeTransaction.status
                }]
              });

              // toast({
              //   title: "Chào mừng bạn! 🎉",
              //   description: `Bạn đã nhận được ${formatCoins(welcomeBonus)} coins chào mừng!`,
              // });

              console.log("🎁 New wallet initialized with welcome bonus", { userId: user.id });
            }
          }
        } catch (error) {
          console.error("❌ Error loading user wallet:", error);
          setBalance(0);
          setTransactions([]);
        }
      } else {
        // Clear wallet when no user is logged in
        setBalance(0);
        setTransactions([]);
        console.log("🚪 Wallet cleared - no user logged in");
      }
    };

    loadUserWallet();
  }, [user]);

  // Save wallet data to JSON API and localStorage whenever balance or transactions change
  useEffect(() => {
    const saveUserWallet = async () => {
      if (user && (balance > 0 || transactions.length > 0)) {
        // Save to localStorage immediately
        const walletData = {
          balance,
          transactions
        };
        localStorage.setItem(`qai-wallet-${user.id}`, JSON.stringify(walletData));

        try {
          // Transform transactions to API format and save to JSON API
          const apiTransactions = transactions.map((tx: WalletTransaction) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            orderId: tx.orderId,
            timestamp: tx.date.toISOString(),
            status: tx.status,
            paymentMethod: tx.paymentMethod
          }));

          const apiWalletData = {
            id: `wallet_${user.id}`,
            userId: user.id,
            balance,
            currency: "VND",
            lastUpdated: new Date().toISOString(),
            transactions: apiTransactions
          };

          // Save wallet data to API
          const success = await DataSyncHelper.saveUserData(user.id, 'userWallets', apiWalletData, 'update');

          console.log("💾 Wallet synced", {
            userId: user.id,
            balance,
            transactionsCount: transactions.length,
            apiSynced: success
          });
        } catch (error) {
          console.warn("⚠️ Failed to sync wallet to API (saved locally):", error);
        }
      }
    };

    // Debounce the save operation to avoid too many API calls
    const timeoutId = setTimeout(saveUserWallet, 500);
    return () => clearTimeout(timeoutId);
  }, [balance, transactions, user]);

  const formatCoins = (value?: number) => {
    return new Intl.NumberFormat('vi-VN').format(value ?? 0);
  };

  const canAfford = (amount: number): boolean => {
    return (user?.coins || 0) >= amount;
  };

  const createDepositOrder = async (amount: number, methodId: string): Promise<{ orderId: string; success: boolean }> => {
    // console.log("🏦 Creating deposit order", { amount, methodId, user: user?.email });

    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để nạp coins.",
        variant: "destructive",
      });
      return { orderId: '', success: false };
    }

    const method = depositMethods.find(m => m.id === methodId);
    if (!method) {
      toast({
        title: "Phương thức không hợp lệ",
        description: "Phương thức nạp tiền không tồn tại.",
        variant: "destructive",
      });
      return { orderId: '', success: false };
    }

    if (amount < method.minAmount || amount > method.maxAmount) {
      toast({
        title: "Số tiền không hợp lệ",
        description: `Số tiền nạp phải từ ${formatCoins(method.minAmount)} đến ${formatCoins(method.maxAmount)}.`,
        variant: "destructive",
      });
      return { orderId: '', success: false };
    }

    // Generate order ID
    const orderId = `QAI${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate expected amounts for display
    const finalAmount = amount - method.fee;
    const totalReceived = finalAmount;

    // Store pending deposit details for admin approval (but don't add to transaction history yet)
    const pendingDeposits = JSON.parse(localStorage.getItem('qai-pending-deposits') || '[]');
    const depositData = {
      orderId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name || user.email,
      amount,
      methodId,
      methodName: method.name,
      fee: method.fee,
      expectedTotal: totalReceived,
      createdAt: new Date().toISOString(),
      status: 'created', // Changed from 'pending' to 'created'
      confirmed: false // Track if user confirmed payment
    };

    pendingDeposits.push(depositData);
    localStorage.setItem('qai-pending-deposits', JSON.stringify(pendingDeposits));

    console.log("✅ Deposit order created successfully", {
      orderId,
      amount,
      expectedTotal: totalReceived,
      method: method.name
    });
    return { orderId, success: true };
  };

  const confirmUserPayment = async (orderId: string): Promise<boolean> => {
    console.log("💰 User confirming payment", { orderId, user: user?.email });

    // Get pending deposit details
    const pendingDeposits = JSON.parse(localStorage.getItem('qai-pending-deposits') || '[]');
    const depositIndex = pendingDeposits.findIndex((d: any) => d.orderId === orderId && d.userId === user?.id);

    if (depositIndex === -1) {
      console.warn("❌ Deposit not found", { orderId, userId: user?.id });
      toast({
        title: "Không tìm thấy giao dịch",
        description: "Giao dịch không tồn tại hoặc đã được xử lý.",
        variant: "destructive",
      });
      return false;
    }

    const depositData = pendingDeposits[depositIndex];
    const method = depositMethods.find(m => m.id === depositData.methodId);

    if (!method) {
      console.error("❌ Payment method not found", { methodId: depositData.methodId });
      return false;
    }

    // Calculate final amount with fees only
    const finalAmount = depositData.amount - method.fee;
    const totalReceived = finalAmount;

    // Create transaction record and add to history (this is when it gets saved)
    const transaction: WalletTransaction = {
      id: orderId,
      type: 'deposit',
      amount: totalReceived,
      description: `Chờ xác nhận nạp ${formatCoins(depositData.amount)} qua ${method.name}`,
      date: new Date(),
      status: 'pending',
      paymentMethod: method.name,
      orderId: orderId
    };

    // Add transaction to history now (when user confirms payment)
    setTransactions(prevTransactions => {
      const updatedTransactions = [transaction, ...prevTransactions];
      console.log("📝 Transaction added to history after payment confirmation", {
        orderId,
        transactionCount: updatedTransactions.length,
        newTransaction: transaction
      });
      return updatedTransactions;
    });

    // Update pending deposits - mark as user confirmed
    pendingDeposits[depositIndex].status = 'pending';
    pendingDeposits[depositIndex].confirmed = true;
    pendingDeposits[depositIndex].userConfirmedAt = new Date().toISOString();
    localStorage.setItem('qai-pending-deposits', JSON.stringify(pendingDeposits));

    // Trigger data sync
    if (user) {
      DataSyncHelper.syncWalletData(user.id, { balance, transactions: [transaction, ...transactions] });
    }

    console.log("✅ User payment confirmed, transaction added to history", {
      orderId,
      amount: totalReceived,
      method: method.name
    });

    return true;
  };

  const confirmDeposit = async (orderId: string): Promise<boolean> => {
    console.log("🔍 Admin confirming deposit", { orderId, user: user?.email });

    // Get pending deposit details
    const pendingDeposits = JSON.parse(localStorage.getItem('qai-pending-deposits') || '[]');
    const depositIndex = pendingDeposits.findIndex((d: any) => d.orderId === orderId && d.userId === user?.id);

    if (depositIndex === -1) {
      console.warn("❌ Deposit not found", { orderId, userId: user?.id });
      toast({
        title: "Không tìm thấy giao dịch",
        description: "Giao dịch không tồn tại hoặc đã được xử lý.",
        variant: "destructive",
      });
      return false;
    }

    const depositData = pendingDeposits[depositIndex];
    const method = depositMethods.find(m => m.id === depositData.methodId);

    if (!method) {
      console.error("❌ Payment method not found", { methodId: depositData.methodId });
      return false;
    }

    // Calculate final amount with fees only
    const finalAmount = depositData.amount - method.fee;
    const totalReceived = finalAmount;

    // Update transaction status with enhanced logging
    const updatedTransactions = transactions.map(tx => {
      if (tx.id === orderId) {
        console.log("📝 Updating transaction status", {
          orderId,
          oldStatus: tx.status,
          newStatus: 'completed',
          amount: totalReceived
        });
        return {
          ...tx,
          amount: totalReceived,
          description: `Nạp tiền qua ${method.name} thành công`,
          status: 'completed' as const
        };
      }
      return tx;
    });

    const newBalance = balance + totalReceived;

    // Update state with synchronization
    setTransactions(updatedTransactions);
    setBalance(newBalance);

    // Update pending deposits
    pendingDeposits[depositIndex].status = 'completed';
    pendingDeposits[depositIndex].completedAt = new Date().toISOString();
    localStorage.setItem('qai-pending-deposits', JSON.stringify(pendingDeposits));

    // Trigger data sync
    if (user) {
      DataSyncHelper.syncWalletData(user.id, {
        balance: newBalance,
        transactions: updatedTransactions
      });
    }

    toast({
      title: "Nạp coins thành công! 🎉",
      description: `Bạn đã nhận được ${formatCoins(totalReceived)}`,
    });

    console.log("✅ Deposit confirmed successfully", {
      orderId,
      amount: totalReceived,
      newBalance,
      transactionCount: updatedTransactions.length
    });

    return true;
  };

  const depositCoins = async (amount: number, methodId: string): Promise<boolean> => {
    // Legacy method - create order and immediately confirm (for backward compatibility)
    const orderResult = await createDepositOrder(amount, methodId);
    if (!orderResult.success) {
      return false;
    }

    setIsProcessingDeposit(true);

    try {
      // Simulate admin approval delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      const confirmed = await confirmDeposit(orderResult.orderId);
      return confirmed;
    } catch (error) {
      console.error("Deposit failed:", error);

      // Update transaction to failed
      const failedTransactions = transactions.map(tx =>
        tx.id === orderResult.orderId
          ? { ...tx, status: 'failed' as const, description: `Nạp tiền qua ${methodId} thất bại` }
          : tx
      );
      setTransactions(failedTransactions);

      toast({
        title: "Nạp coins thất bại",
        description: "Có lỗi xảy ra trong quá trình nạp tiền. Vui lòng thử lại.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsProcessingDeposit(false);
    }
  };

  const deductCoins = async (amount: number, description: string, orderId?: string): Promise<boolean> => {
    // console.log("Deducting coins", { amount, description, orderId, currentBalance: balance });

    if (!canAfford(amount)) {
      // console.log("Insufficient coins", { required: amount, available: balance });
      toast({
        title: "Số dư không đủ",
        description: `Bạn cần thêm ${formatCoins(amount - balance)} để thực hiện giao dịch này.`,
        variant: "destructive",
      });
      return false;
    }

    const transaction: WalletTransaction = {
      id: `purchase-${Date.now()}`,
      type: 'purchase',
      amount: -amount,
      description,
      orderId,
      date: new Date(),
      status: 'completed'
    };

    // Update state with new balance and transaction
    const newBalance = balance - amount;
    setBalance(newBalance);
    setTransactions(prevTransactions => [transaction, ...prevTransactions]);

    console.log("Coins deducted successfully", {
      amount,
      previousBalance: balance,
      newBalance: newBalance,
      transactionId: transaction.id
    });

    // Trigger wallet sync if user exists
    if (user) {
      DataSyncHelper.syncWalletData(user.id, {
        balance: newBalance,
        transactions: [transaction, ...transactions]
      });
    }

    toast({
      title: "Thanh toán thành công! 🎉",
      description: `Đã trừ ${formatCoins(amount)} từ ví của bạn`,
    });

    return true;
  };

  const refundCoins = (amount: number, description: string, orderId?: string): void => {
    console.log("Refunding coins", { amount, description, orderId });

    const transaction: WalletTransaction = {
      id: `refund-${Date.now()}`,
      type: 'refund',
      amount: amount,
      description,
      orderId,
      date: new Date(),
      status: 'completed'
    };

    setBalance(prevBalance => prevBalance + amount);
    setTransactions(prevTransactions => [transaction, ...prevTransactions]);

    toast({
      title: "Hoàn tiền thành công",
      description: `${formatCoins(amount)} đã được hoàn vào ví của bạn.`,
    });

    console.log("Refund successful", { amount, newBalance: balance + amount });
  };

  const getTransactionHistory = (): WalletTransaction[] => {
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getTransactionsByType = (type: WalletTransaction['type']): WalletTransaction[] => {
    return transactions.filter(tx => tx.type === type).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const refreshTransactions = useCallback((): void => {
    if (!user) return;

    console.log("🔄 Refreshing transactions", { userId: user.id });

    const savedWallet = localStorage.getItem(`qai-wallet-${user.id}`);
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        const parsedTransactions = (walletData.transactions || []).map((tx: any) => ({
          ...tx,
          date: new Date(tx.date)
        }));

        setTransactions(parsedTransactions);
        setBalance(walletData.balance || 0);

        console.log("✅ Transactions refreshed", {
          transactionCount: parsedTransactions.length,
          balance: walletData.balance
        });
      } catch (error) {
        console.error("❌ Error refreshing transactions:", error);
      }
    }
  }, [user]);

  const syncDepositStatus = useCallback(async (): Promise<void> => {
    if (!user) return;

    // console.log("🔄 Syncing deposit status", { userId: user.id });

    try {
      const pendingDeposits = JSON.parse(localStorage.getItem('qai-pending-deposits') || '[]');
      const userPendingDeposits = pendingDeposits.filter((d: any) => d.userId === user.id && d.status === 'pending');

      // console.log("📊 Found pending deposits", { count: userPendingDeposits.length, deposits: userPendingDeposits });

      // Check if any pending deposits need status updates
      let hasUpdates = false;
      const updatedTransactions = transactions.map(tx => {
        const pendingDeposit = userPendingDeposits.find((d: any) => d.orderId === tx.id);
        if (pendingDeposit && tx.status === 'pending') {
          // Keep as pending for now - actual status changes happen via admin approval
          console.log("🕐 Deposit still pending", { orderId: tx.id, createdAt: pendingDeposit.createdAt });
        }
        return tx;
      });

      if (hasUpdates) {
        setTransactions(updatedTransactions);
        console.log("✅ Deposit status synchronized");
      } else {
        console.log("ℹ️ No deposit status updates needed");
      }

    } catch (error) {
      console.error("❌ Error syncing deposit status:", error);
    }
  }, [user, transactions]);

  const value: WalletContextType = {
    balance,
    transactions,
    depositMethods,
    depositCoins,
    createDepositOrder,
    confirmUserPayment,
    confirmDeposit,
    deductCoins,
    refundCoins,
    getTransactionHistory,
    getTransactionsByType,
    refreshTransactions,
    syncDepositStatus,
    canAfford,
    formatCoins,
    isProcessingDeposit,
    syncBalanceFromServer: useCallback((newBalance: number) => {
      setBalance(newBalance);
      if (user) {
        DataSyncHelper.syncWalletData(user.id, { balance: newBalance, transactions });
      }
    }, [user, transactions]),
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}