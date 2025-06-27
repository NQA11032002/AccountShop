"use client";

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  type: 'user' | 'product' | 'order' | 'account';
}

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description, 
  itemName, 
  type 
}: DeleteConfirmDialogProps) {

  console.log("DeleteConfirmDialog rendered", { open, type, itemName });

  const handleConfirm = () => {
    console.log("Delete confirmed", { type, itemName });
    onConfirm();
    onOpenChange(false);
  };

  const getTypeColor = () => {
    switch (type) {
      case 'user': return 'text-red-600 bg-red-50 border-red-200';
      case 'product': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'order': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'account': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getWarningMessage = () => {
    switch (type) {
      case 'user':
        return 'Việc xóa người dùng sẽ xóa tất cả dữ liệu liên quan bao gồm đơn hàng, lịch sử mua hàng và không thể khôi phục.';
      case 'product':
        return 'Việc xóa sản phẩm có thể ảnh hưởng đến các đơn hàng hiện tại và lịch sử giao dịch. Hành động này không thể hoàn tác.';
      case 'order':
        return 'Việc xóa đơn hàng sẽ xóa hoàn toàn thông tin giao dịch và không thể khôi phục. Hãy cân nhắc kỹ trước khi thực hiện.';
      case 'account':
        return 'Việc xóa tài khoản khách hàng sẽ xóa hoàn toàn thông tin đăng nhập và không thể khôi phục. Khách hàng sẽ mất quyền truy cập vào dịch vụ.';
      default:
        return 'Hành động này không thể hoàn tác. Hãy chắc chắn bạn muốn tiếp tục.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Item Info */}
          <div className={`p-4 rounded-lg border ${getTypeColor()} mb-4`}>
            <div className="font-medium mb-1">
              {type === 'user' && 'Người dùng: '}
              {type === 'product' && 'Sản phẩm: '}
              {type === 'order' && 'Đơn hàng: '}
              {type === 'account' && 'Tài khoản: '}
              <span className="font-bold">{itemName}</span>
            </div>
          </div>

          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Cảnh báo:</strong> {getWarningMessage()}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy bỏ
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}