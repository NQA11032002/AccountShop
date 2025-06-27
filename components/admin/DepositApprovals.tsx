"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, RefreshCw, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataSyncHelper from '@/lib/syncHelper';

interface PendingDeposit {
  orderId: string;
  userId: string;
  userEmail: string;
  amount: number;
  methodId: string;
  methodName: string;
  fee: number;
  bonusPercentage: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function DepositApprovals() {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<PendingDeposit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<PendingDeposit | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pending deposits
  const loadPendingDeposits = () => {
    const rawDeposits = JSON.parse(localStorage.getItem('qai-pending-deposits') || '[]');
    
    // Ensure all deposits have required fields with defaults
    const deposits = rawDeposits.map((deposit: any) => ({
      orderId: deposit.orderId || '',
      userId: deposit.userId || '',
      userEmail: deposit.userEmail || '',
      amount: deposit.amount || 0,
      methodId: deposit.methodId || '',
      methodName: deposit.methodName || '',
      fee: deposit.fee || 0,
      bonusPercentage: deposit.bonusPercentage || 0, // Default bonus to 0
      createdAt: deposit.createdAt || new Date().toISOString(),
      status: deposit.status || 'pending'
    })) as PendingDeposit[];
    
    setPendingDeposits(deposits);
    setFilteredDeposits(deposits);
    console.log("Loaded pending deposits", { count: deposits.length, deposits });
  };

  useEffect(() => {
    loadPendingDeposits();
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingDeposits, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter deposits based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDeposits(pendingDeposits);
    } else {
      const filtered = pendingDeposits.filter(deposit =>
        deposit.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.methodName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDeposits(filtered);
    }
  }, [searchTerm, pendingDeposits]);

  const handleApprove = async (deposit: PendingDeposit) => {
    setIsProcessing(deposit.orderId);
    console.log("🟢 Approving deposit", { orderId: deposit.orderId, userEmail: deposit.userEmail });

    try {
      // Calculate final amounts
      const finalAmount = deposit.amount - deposit.fee;
      const bonusAmount = Math.floor((finalAmount * deposit.bonusPercentage) / 100);
      const totalReceived = finalAmount + bonusAmount;

      // Remove from pending deposits first
      const updatedDeposits = pendingDeposits.filter(d => d.orderId !== deposit.orderId);
      localStorage.setItem('qai-pending-deposits', JSON.stringify(updatedDeposits));
      setPendingDeposits(updatedDeposits);

      // Trigger synchronized deposit approval
      DataSyncHelper.syncDepositApproval({
        orderId: deposit.orderId,
        userId: deposit.userId,
        userEmail: deposit.userEmail,
        amount: deposit.amount,
        finalAmount: totalReceived,
        status: 'approved',
        methodName: deposit.methodName,
        bonusAmount: bonusAmount > 0 ? bonusAmount : undefined
      });

      toast({
        title: "✅ Đã phê duyệt",
        description: `Giao dịch ${deposit.orderId} đã được phê duyệt. Người dùng ${deposit.userEmail} nhận được ${formatCoins(totalReceived)}.`,
      });

      console.log("✅ Deposit approved and synced successfully", { 
        orderId: deposit.orderId, 
        totalReceived,
        userEmail: deposit.userEmail,
        bonusAmount 
      });
      
    } catch (error) {
      console.error("❌ Error approving deposit:", error);
      toast({
        title: "Lỗi phê duyệt",
        description: "Có lỗi xảy ra khi phê duyệt giao dịch.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (deposit: PendingDeposit) => {
    setIsProcessing(deposit.orderId);
    console.log("🔴 Rejecting deposit", { orderId: deposit.orderId, userEmail: deposit.userEmail });

    try {
      // Remove from pending deposits
      const updatedDeposits = pendingDeposits.filter(d => d.orderId !== deposit.orderId);
      localStorage.setItem('qai-pending-deposits', JSON.stringify(updatedDeposits));
      setPendingDeposits(updatedDeposits);

      // Trigger synchronized deposit rejection
      DataSyncHelper.syncDepositApproval({
        orderId: deposit.orderId,
        userId: deposit.userId,
        userEmail: deposit.userEmail,
        amount: deposit.amount,
        finalAmount: 0, // No money added for rejection
        status: 'rejected',
        methodName: deposit.methodName
      });
      
      toast({
        title: "❌ Đã từ chối",
        description: `Giao dịch ${deposit.orderId} của ${deposit.userEmail} đã bị từ chối.`,
        variant: "destructive",
      });

      console.log("✅ Deposit rejected and synced", { 
        orderId: deposit.orderId, 
        userEmail: deposit.userEmail 
      });
      
    } catch (error) {
      console.error("❌ Error rejecting deposit:", error);
      toast({
        title: "Lỗi từ chối",
        description: "Có lỗi xảy ra khi từ chối giao dịch.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const formatCoins = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' coins';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = filteredDeposits.filter(d => d.status === 'pending').length;
  const totalPendingAmount = filteredDeposits
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Chờ duyệt</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPendingAmount)}</div>
                <div className="text-sm text-gray-600">Tổng tiền chờ</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {pendingDeposits.filter(d => d.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Đã duyệt hôm nay</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quản lý nạp tiền</span>
            <Button onClick={loadPendingDeposits} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, email, phương thức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Deposits Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Không có giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeposits.map((deposit) => {
                    const finalAmount = deposit.amount - deposit.fee;
                    const bonusAmount = Math.floor((finalAmount * deposit.bonusPercentage) / 100);
                    const totalReceived = finalAmount + bonusAmount;

                    return (
                      <TableRow key={deposit.orderId}>
                        <TableCell className="font-mono text-sm">
                          {deposit.orderId}
                        </TableCell>
                        <TableCell>{deposit.userEmail}</TableCell>
                        <TableCell>{deposit.methodName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatCurrency(deposit.amount)}</div>
                            <div className="text-green-600 text-xs">
                              → {formatCoins(totalReceived)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(deposit.status)}>
                            {deposit.status === 'pending' ? 'Chờ duyệt' :
                             deposit.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedDeposit(deposit)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Chi tiết giao dịch</DialogTitle>
                                </DialogHeader>
                                {selectedDeposit && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <Label>Mã đơn hàng</Label>
                                        <div className="font-mono">{selectedDeposit.orderId}</div>
                                      </div>
                                      <div>
                                        <Label>Người dùng</Label>
                                        <div>{selectedDeposit.userEmail}</div>
                                      </div>
                                      <div>
                                        <Label>Phương thức</Label>
                                        <div>{selectedDeposit.methodName}</div>
                                      </div>
                                      <div>
                                        <Label>Thời gian tạo</Label>
                                        <div>{new Date(selectedDeposit.createdAt).toLocaleString('vi-VN')}</div>
                                      </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Số tiền nạp:</span>
                                        <span>{formatCurrency(selectedDeposit.amount)}</span>
                                      </div>
                                      {selectedDeposit.fee > 0 && (
                                        <div className="flex justify-between text-red-600">
                                          <span>Phí xử lý:</span>
                                          <span>-{formatCurrency(selectedDeposit.fee)}</span>
                                        </div>
                                      )}
                                      {selectedDeposit.bonusPercentage > 0 && (
                                        <div className="flex justify-between text-green-600">
                                          <span>Bonus ({selectedDeposit.bonusPercentage}%):</span>
                                          <span>+{formatCoins(Math.floor(((selectedDeposit.amount - selectedDeposit.fee) * selectedDeposit.bonusPercentage) / 100))}</span>
                                        </div>
                                      )}
                                      <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span>Tổng nhận:</span>
                                        <span>{formatCoins(selectedDeposit.amount - selectedDeposit.fee + Math.floor(((selectedDeposit.amount - selectedDeposit.fee) * selectedDeposit.bonusPercentage) / 100))}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {deposit.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => handleApprove(deposit)}
                                  disabled={isProcessing === deposit.orderId}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isProcessing === deposit.orderId ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleReject(deposit)}
                                  disabled={isProcessing === deposit.orderId}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}