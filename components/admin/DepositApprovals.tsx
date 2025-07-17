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
// import data from '@/lib/data.json';
// import { User } from '@/types/user.interface';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllTransactions, updateTransactionStatus } from '@/lib/api';

interface PendingDeposit {
  orderId: string;
  transaction_id: string;
  userId: string;
  userEmail: string;
  amount: number;
  type: string;
  fee: number;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}


export default function DepositApprovals() {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<PendingDeposit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<PendingDeposit | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const { sessionId } = useAuth(); // Lấy sessionId từ context
  const [isProcessingType, setIsProcessingType] = useState<string | null>(null);

  /// Load pending deposits from API
  const loadPendingDeposits = async () => {
    try {

      if (!sessionId) return;
      // Thay vì lấy từ localStorage, gọi API để lấy danh sách giao dịch
      const response = await fetchAllTransactions(sessionId);

      if (response.data.length > 0) {
        // Assuming response is an array of pending deposits
        const deposits = response.data.map((deposit: any) => ({
          orderId: deposit.id || '',
          transaction_id: deposit.transaction_id || '',
          userEmail: deposit.user.email || '',
          userId: deposit.userId || '',
          amount: deposit.amount || 0,
          type: deposit.type || '',
          created_at: deposit.created_at || new Date().toISOString(),
          status: deposit.status || 'pending',
        })) as PendingDeposit[];

        setPendingDeposits(deposits);
        setFilteredDeposits(deposits);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi tải giao dịch',
        description: `Có lỗi xảy ra khi tải giao dịch. ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessingType(''); // Reset loại xử lý sau khi hoàn thành
    }
  };

  /// Renew load pending deposits from API
  const renewLoadPendingDeposits = async () => {
    setIsProcessingType('renew'); // Cập nhật loại xử lý là approve
    loadPendingDeposits()
  }

  useEffect(() => {
    loadPendingDeposits();
    // Refresh every 30 seconds
    // const interval = setInterval(loadPendingDeposits, 30000);
    // return () => clearInterval(interval);
  }, []);

  // Filter deposits based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDeposits(pendingDeposits);
    } else {
      const filtered = pendingDeposits.filter(deposit =>
        deposit.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDeposits(filtered);
    }
  }, [searchTerm, pendingDeposits]);

  const handleApprove = async (deposit: PendingDeposit) => {
    setIsProcessing(deposit.orderId);
    setIsProcessingType('approve'); // Cập nhật loại xử lý là approve

    if (!sessionId) return;

    try {
      // Cập nhật trạng thái giao dịch là 'approved'
      const updatedTransaction = await updateTransactionStatus(sessionId, deposit.orderId, 'approved');

      // Cập nhật trạng thái trong danh sách local (giữ lại tất cả thông tin về order, chỉ thay đổi trạng thái)
      const updatedDeposits = pendingDeposits.map(d =>
        d.orderId === deposit.orderId ? {
          ...d, status: 'approved' as 'pending' | 'approved' | 'rejected' // Đảm bảo status có giá trị hợp lệ
        } : d
      );
      setPendingDeposits(updatedDeposits);

      toast({
        title: "✅ Đã phê duyệt",
        description: `Giao dịch ${deposit.amount} coins của người dùng ${deposit.userEmail} đã được phê duyệt.`
      });

    } catch (error) {
      toast({
        title: "Lỗi phê duyệt",
        description: "Có lỗi xảy ra khi phê duyệt giao dịch.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
      setIsProcessingType(''); // Reset loại xử lý sau khi hoàn thành
    }
  };

  const handleReject = async (deposit: PendingDeposit) => {
    setIsProcessing(deposit.orderId);
    setIsProcessingType('reject'); // Cập nhật loại xử lý là reject

    if (!sessionId) return;

    try {
      // Cập nhật trạng thái giao dịch là 'rejected'
      const updatedTransaction = await updateTransactionStatus(sessionId, deposit.orderId, 'rejected');

      // Cập nhật trạng thái trong danh sách giao dịch local (giữ lại thông tin nhưng thay đổi trạng thái)
      const updatedDeposits = pendingDeposits.map(d =>
        d.orderId === deposit.orderId ? {
          ...d,
          status: 'rejected' as 'pending' | 'approved' | 'rejected' // Đảm bảo status có giá trị hợp lệ
        } : d
      );

      // Cập nhật lại danh sách giao dịch
      setPendingDeposits(updatedDeposits);

      // Hiển thị thông báo phê duyệt
      toast({
        title: "❌ Đã từ chối",
        description: `Giao dịch ${deposit.amount} coins của người dùng ${deposit.userEmail} đã bị từ chối.`,
        variant: "destructive",
      });

    } catch (error) {
      toast({
        title: "Lỗi từ chối",
        description: "Có lỗi xảy ra khi từ chối giao dịch.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
      setIsProcessingType(''); // Reset loại xử lý sau khi hoàn thành
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
      <div className="grid md:grid-cols-4 gap-4">
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
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {pendingDeposits.filter(d => d.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Đã từ chối hôm nay</div>
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


      </div>

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quản lý nạp tiền</span>
            <Button onClick={renewLoadPendingDeposits} variant="outline" size="sm" disabled={isProcessingType == 'renew'}
            >
              {isProcessingType === 'renew' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
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
                  <TableHead>ID</TableHead>
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
                    // const finalAmount = deposit.amount - deposit.fee;
                    // const bonusAmount = Math.floor((finalAmount * deposit.bonusPercentage) / 100);
                    // const totalReceived = finalAmount + bonusAmount;

                    return (
                      <TableRow key={deposit.orderId}>
                        <TableCell className="font-mono text-sm">
                          {deposit.orderId}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {deposit.transaction_id}
                        </TableCell>
                        <TableCell>{deposit.userEmail}</TableCell>
                        <TableCell>{deposit.type}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatCurrency(deposit.amount)}</div>
                            {/* <div className="text-green-600 text-xs"> → {formatCoins(totalReceived)}
                            </div> */}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(deposit.created_at).toLocaleString('vi-VN')}
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
                                        <div>{selectedDeposit.type}</div>
                                      </div>
                                      <div>
                                        <Label>Thời gian tạo</Label>
                                        <div>{new Date(selectedDeposit.created_at).toLocaleString('vi-VN')}</div>
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
                                      {/* {selectedDeposit.bonusPercentage > 0 && (
                                        <div className="flex justify-between text-green-600">
                                          <span>Bonus ({selectedDeposit.bonusPercentage}%):</span>
                                          <span>+{formatCoins(Math.floor(((selectedDeposit.amount - selectedDeposit.fee) * selectedDeposit.bonusPercentage) / 100))}</span>
                                        </div>
                                      )} */}
                                      <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span>Tổng nhận:</span>
                                        <span>{formatCoins(deposit.amount)}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {deposit.status === 'pending' && (
                              <>
                                {/* Approve Button */}
                                <Button
                                  onClick={() => handleApprove(deposit)}
                                  disabled={isProcessing === deposit.orderId}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isProcessing === deposit.orderId && isProcessingType === 'approve' ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>

                                {/* Reject Button */}
                                <Button
                                  onClick={() => handleReject(deposit)}
                                  disabled={isProcessing === deposit.orderId}
                                  size="sm"
                                  variant="destructive"
                                >
                                  {isProcessing === deposit.orderId && isProcessingType === 'reject' ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
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