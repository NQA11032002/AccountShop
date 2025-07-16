"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/user.interface';
import { updateAdminUser } from '@/lib/api'; // Import hàm updateUser
import { useAuth } from '@/contexts/AuthContext';

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: User) => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
  const defaultUser: User = {
    id: '',
    name: '',
    email: '',
    password: '',
    joinDate: new Date().toISOString(),
    status: 'active',
    totalOrders: 0,
    totalSpent: 0,
    avatar: '',
    phone: '',
    address: '',
    points: 0,
    rank: 'bronze',
    coins: 0,
    preferences: {
      categories: [],
      notifications: true,
      currency: 'VND'
    },
    role: ''
  };

  const [formData, setFormData] = useState<User>(user || defaultUser);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { sessionId } = useAuth();

  // Reset form data when user prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(user || defaultUser);
    }
  }, [user, open]);

  const handleSave = async () => {
    setLoading(true);
    setError('');

    if (!sessionId) {
      setError('Session ID is missing.');
      setLoading(false);
      return;
    }

    try {
      // Call updateAdminUser API to update user
      const updatedUser = await updateAdminUser(sessionId, formData.id, formData);

      // Normalize the response data if necessary
      const normalizedUser = {
        ...updatedUser.user,
        totalOrders: updatedUser.user.total_orders,
        totalSpent: updatedUser.user.total_spent,
        joinDate: updatedUser.user.join_date
      };

      onSave(normalizedUser); // Call onSave to update the user in the parent component

      onOpenChange(false); // Close the dialog after update
    } catch (err: any) {
      setError(err.message || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Cập nhật thông tin người dùng' : 'Nhập thông tin để tạo người dùng mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Họ tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Points */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">Points</Label>
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              className="col-span-3"
              placeholder="500"
            />
          </div>

          {/* Coins */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coins" className="text-right">Coins</Label>
            <Input
              id="coins"
              type="number"
              value={formData.coins}
              onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) })}
              className="col-span-3"
              placeholder="500"
            />
          </div>

          {/* Rank */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Rank</Label>
            <Select
              value={formData.rank}
              onValueChange={(value: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Elite') =>
                setFormData({ ...formData, rank: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone - Zalo</Label>
            <Input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="col-span-3"
              placeholder="0389*******"
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive' | 'banned') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="banned">Bị cấm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'user' | 'admin') =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Orders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalOrders">Tổng đơn hàng</Label>
              <Input
                id="totalOrders"
                type="number"
                value={formData.totalOrders}
                onChange={(e) => setFormData({ ...formData, totalOrders: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="totalSpent">Tổng chi tiêu (VNĐ)</Label>
              <Input
                id="totalSpent"
                type="number"
                value={formData.totalSpent}
                onChange={(e) => setFormData({ ...formData, totalSpent: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {user ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
