"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DepositModal from '@/components/DepositModal';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus, History, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Gift, RefreshCw, Star, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const { 
    balance, 
    transactions, 
    depositMethods, 
    createDepositOrder,
    confirmUserPayment,
    getTransactionHistory,
    refreshTransactions,
    syncDepositStatus,
    formatCoins,
    isProcessingDeposit 
  } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = useState(depositMethods[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  console.log("WalletPage rendered", { user: user?.email, balance, transactionsCount: transactions.length });

  // Auto-sync when history tab is active
  React.useEffect(() => {
    if (activeTab === 'history' && user) {
      console.log("🔄 Auto-syncing deposits for history tab");
      syncDepositStatus();
      refreshTransactions();
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để quản lý ví của bạn.</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/login')} className="w-full">
              Đăng nhập
            </Button>
            <Button variant="outline" onClick={() => router.push('/register')} className="w-full">
              Đăng ký tài khoản
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      toast({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    const selectedMethodData = depositMethods.find(m => m.id === selectedMethod);
    if (!selectedMethodData) {
      toast({
        title: "Phương thức không hợp lệ",
        description: "Vui lòng chọn phương thức thanh toán.",
        variant: "destructive",
      });
      return;
    }

    // Create deposit order first
    const orderResult = await createDepositOrder(amount, selectedMethod);
    if (!orderResult.success) {
      return;
    }

    console.log("Deposit order created successfully", { orderId: orderResult.orderId });
    
    // Store the orderId and show deposit modal with QR code
    setCurrentOrderId(orderResult.orderId);
    setShowDepositModal(true);
  };

  const formatAmount = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(parseInt(number) || 0);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'purchase': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'refund': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'bonus': return <Gift className="w-4 h-4 text-purple-600" />;
      default: return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentTransactions = getTransactionHistory().slice(0, 5);
  const selectedDepositMethod = depositMethods.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Trang chủ</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ví của tôi</h1>
                <p className="text-gray-600">Quản lý coins và lịch sử giao dịch</p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 bg-gradient-to-br from-brand-blue to-brand-emerald text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Wallet className="w-6 h-6" />
                    <span className="text-blue-100">Số dư hiện tại</span>
                  </div>
                  <div className="text-4xl font-bold mb-2">{formatCoins(balance)}</div>
                  <div className="text-blue-100">≈ {new Intl.NumberFormat('vi-VN').format(balance)}đ</div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                  <Button 
                    onClick={() => setActiveTab('deposit')}
                    className="bg-white text-brand-blue hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nạp tiền
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="deposit" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nạp tiền</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Lịch sử</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowDownRight className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Lần nạp tiền</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {transactions.filter(tx => tx.type === 'purchase').length}
                        </div>
                        <div className="text-sm text-gray-600">Giao dịch mua</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCoins(transactions.filter(tx => tx.type === 'bonus').reduce((sum, tx) => sum + tx.amount, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Tổng bonus</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Giao dịch gần đây</span>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('history')}>
                      Xem tất cả
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-gray-600">
                                {transaction.date.toLocaleDateString('vi-VN')} • {transaction.date.toLocaleTimeString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCoins(Math.abs(transaction.amount))}
                            </div>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status === 'completed' ? 'Hoàn thành' :
                               transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có giao dịch nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deposit Methods Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức nạp tiền</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {depositMethods.filter(method => method.isActive).map((method) => (
                      <div key={method.id} className="p-4 border rounded-lg hover:border-blue-500 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-gray-600">{method.processingTime}</div>
                            </div>
                          </div>

                        </div>
                        <div className="text-sm text-gray-600">
                          Từ {formatCoins(method.minAmount)} - {formatCoins(method.maxAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deposit Tab */}
            <TabsContent value="deposit" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Deposit Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-6 h-6 mr-3 text-blue-600" />
                      Nạp tiền vào ví
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="amount">Số tiền nạp</Label>
                      <Input
                        id="amount"
                        placeholder="Nhập số tiền..."
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(formatAmount(e.target.value))}
                        className="mt-1 text-lg"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Tối thiểu: {formatCoins(selectedDepositMethod?.minAmount || 0)} - 
                        Tối đa: {formatCoins(selectedDepositMethod?.maxAmount || 0)}
                      </p>
                    </div>

                    <div>
                      <Label>Phương thức thanh toán</Label>
                      <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="mt-2">
                        {depositMethods.filter(method => method.isActive).map((method) => (
                          <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:border-blue-500 transition-colors">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-2xl">{method.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Label htmlFor={method.id} className="cursor-pointer font-medium">
                                    {method.name}
                                  </Label>

                                  {method.fee === 0 && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      Miễn phí
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {method.processingTime} • {method.fee > 0 ? `Phí: ${formatCoins(method.fee)}` : 'Không phí'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {selectedDepositMethod && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Chi tiết giao dịch</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Số tiền nạp:</span>
                            <span>{formatCoins(parseInt(depositAmount.replace(/\D/g, '')) || 0)}</span>
                          </div>
                          {selectedDepositMethod.fee > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Phí xử lý:</span>
                              <span>-{formatCoins(selectedDepositMethod.fee)}</span>
                            </div>
                          )}

                          <Separator />
                          <div className="flex justify-between font-medium text-blue-900">
                            <span>Tổng nhận:</span>
                            <span>{formatCoins(
                              (parseInt(depositAmount.replace(/\D/g, '')) || 0) - 
                              selectedDepositMethod.fee
                            )}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleDeposit}
                      disabled={!depositAmount || isProcessingDeposit}
                      className="w-full bg-gradient-to-r from-brand-blue to-brand-emerald text-white py-3 text-lg font-semibold"
                    >
                      {isProcessingDeposit ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Đang xử lý...
                        </div>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Nạp tiền ngay
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Security & Benefits */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-6 h-6 mr-3 text-green-600" />
                        Bảo mật & Ưu đãi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-brand-emerald mt-0.5" />
                        <div>
                          <div className="font-medium">Bảo mật 100%</div>
                          <div className="text-sm text-gray-600">Mã hóa SSL 256-bit, bảo vệ tuyệt đối</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Bonus hấp dẫn</div>
                          <div className="text-sm text-gray-600">Nhận thêm coins khi nạp tiền</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Zap className="w-5 h-5 text-brand-blue mt-0.5" />
                        <div>
                          <div className="font-medium">Xử lý tức thì</div>
                          <div className="text-sm text-gray-600">Coins vào ví ngay lập tức</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lợi ích khi dùng Coins</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                        <span>Thanh toán siêu nhanh, không cần nhập thông tin</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                        <span>Ưu đãi đặc biệt dành riêng cho thành viên VIP</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                        <span>Tích lũy điểm thưởng và nhận quà tặng</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                        <span>Bảo hành kép cho các giao dịch bằng coins</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Lịch sử giao dịch</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        console.log("🔄 Manual refresh triggered");
                        refreshTransactions();
                        syncDepositStatus();
                        toast({
                          title: "🔄 Đồng bộ thành công",
                          description: "Lịch sử giao dịch đã được cập nhật",
                        });
                      }}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Đồng bộ</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {getTransactionHistory().map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-gray-600">
                                {transaction.date.toLocaleDateString('vi-VN')} • {transaction.date.toLocaleTimeString('vi-VN')}
                                {transaction.orderId && (
                                  <span className="ml-2 text-blue-600">#{transaction.orderId}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCoins(Math.abs(transaction.amount))}
                            </div>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status === 'completed' ? 'Hoàn thành' :
                               transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <History className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                      <h3 className="text-xl font-medium mb-2">Chưa có giao dịch nào</h3>
                      <p className="mb-6">Hãy bắt đầu nạp tiền để sử dụng các dịch vụ của chúng tôi</p>
                      <Button onClick={() => setActiveTab('deposit')} className="bg-brand-blue text-white">
                        Nạp tiền ngay
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Deposit Modal */}
      {showDepositModal && selectedDepositMethod && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={() => {
            setShowDepositModal(false);
            setDepositAmount('');
            setCurrentOrderId('');
            setActiveTab('overview');
          }}
          amount={parseInt(depositAmount.replace(/\D/g, '')) || 0}
          method={selectedDepositMethod}
          formatCoins={formatCoins}
          user={user}
          orderId={currentOrderId}
          onNavigateToHistory={() => {
            setShowDepositModal(false);
            setDepositAmount('');
            setCurrentOrderId('');
            setActiveTab('history');
          }}
          onConfirmUserPayment={confirmUserPayment}
        />
      )}
    </div>
  );
}